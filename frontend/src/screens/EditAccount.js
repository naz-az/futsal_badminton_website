import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/authContext';

function EditAccount() {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        username: '',
        location: '',
        bio: '',
        short_intro: '',
        profile_image: '',
        social_facebook: '',
        social_twitter: '',
        social_instagram: '',
        social_youtube: '',
        social_website: '',
        blocked_users: [], // initialize as empty array
        followed_tags: [], // initialize as empty array
        followers: [], // initialize as empty array
    });
    const [imagePreview, setImagePreview] = useState('');
    
    const clearImage = () => {
        setProfile(prevState => ({ ...prevState, profile_image: '' }));
        setImagePreview('');
    }

    const [selectedFile, setSelectedFile] = useState(null);

    const navigate = useNavigate();

    const auth = useContext(AuthContext);
    console.log("Auth context in EditAccount:", auth);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                };
                const response = await axios.get('/api/user/account/', config);
                console.log(response.data);  // <-- Insert this line here
                if (response.data) {
                    setProfile(response.data.profile);

                }
            } catch (error) {
                console.error("Error fetching user data", error);
            }
        };
    
        fetchUserData();
    }, []);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        if(name === "profile_image") {
            setSelectedFile(e.target.files[0]);
        
            // Create a local URL for the selected image file
            const file = e.target.files[0];
            const imageURL = URL.createObjectURL(file);
            setImagePreview(imageURL);
        }
         else {
            setProfile(prevState => ({...prevState, [name]: value}));
        }
    };

    console.log("auth izz", auth)


    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };
    
            let formData = new FormData();
            Object.keys(profile).forEach(key => {
                // If the key is an array, we append each item individually.
                if (Array.isArray(profile[key])) {
                    if (profile[key].length > 0) {
                        profile[key].forEach((item) => {
                            formData.append(`${key}[]`, item); // Notice the [] to indicate an array
                        });
                    }
                } else if (key !== "profile_image") {
                    formData.append(key, profile[key]);
                }
            });
    
            if (selectedFile) {
                formData.append("profile_image", selectedFile);
            }
    
            const response = await axios.post('/api/user/edit-account/', formData, config);
            console.log(response); // Log the whole response

            if (response.data.success) {
                // Show success message
                console.log("Account updated successfully"); // Check if this gets logged
                alert("User account updated successfully!");
                console.log("Account updated successfully:response data", response.data["success data"]); // Check if this gets logged
                console.log("logged in user data after success:", auth);

                auth.updateUser(response.data["success data"]);

                navigate('/user/account');
            }
        } catch (error) {
            console.error("Error editing profile", error);
        }
    };
    


    

    
    const handleBackClick = () => {
        window.history.back();
    };


    
    return (
      <Container className="mt-5">
        <Row className="justify-content-md-center">

          <Col xs={12} md={8}>
            {/* Back button */}
            <Button
              variant="secondary"
              onClick={handleBackClick}
              className="mb-3"
            >
              Go Back
            </Button>
            <h2 className="text-center">Edit Account</h2>

            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="name" className="form-group-margin">
                <Form.Label><strong>Name</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Name"
                />
              </Form.Group>

              <Form.Group controlId="email" className="form-group-margin">
                <Form.Label><strong>E-mail</strong></Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
              </Form.Group>

              <Form.Group controlId="username" className="form-group-margin">
                <Form.Label><strong>Username</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  placeholder="Username"
                />
              </Form.Group>

              <Form.Group controlId="location" className="form-group-margin">
                <Form.Label><strong>Location</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder="Location"
                />
              </Form.Group>

              <Form.Group controlId="bio" className="form-group-margin">
                <Form.Label><strong>Bio</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Bio"
                />
              </Form.Group>

              <Form.Group controlId="short_intro" className="form-group-margin">
                <Form.Label><strong>Short Intro</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="short_intro"
                  value={profile.short_intro}
                  onChange={handleChange}
                  placeholder="Short Intro"
                />
              </Form.Group>

              <Form.Group controlId="profile_image" className="form-group-margin">
                <Form.Label><strong>Profile Image</strong></Form.Label>

                {/* Display current image URL */}
                {/* <p>
                  Currently:{" "}
                  {typeof profile.profile_image === "string"
                    ? profile.profile_image
                    : "No image selected"}
                </p> */}

                {/* Display current image */}
                <div>
                  <img
                    src={profile.profile_image}
                    alt="Current Profile"
                    className="preview-image"
                    style={{
                      width: "300px",
                      height: "300px",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Clear button */}
                <Button variant="primary" onClick={clearImage} className="mb-4 mt-2">
                  Clear
                </Button>

                <Form.Control
                  type="file"
                  name="profile_image"
                  onChange={handleChange}
                />

                {/* Preview selected image */}
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Selected Profile"
                    className="preview-image"
                    style={{
                        width: "300px",
                        height: "300px",
                        objectFit: "cover",
                      }}
                  />
                )}
              </Form.Group>

              <Form.Group controlId="social_facebook" className="form-group-margin">
                <Form.Label><strong>Facebook Profile URL</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="social_facebook"
                  value={profile.social_facebook}
                  onChange={handleChange}
                  placeholder="Facebook Profile URL"
                />
              </Form.Group>

              <Form.Group controlId="social_twitter" className="form-group-margin">
                <Form.Label><strong>Twitter Profile URL</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="social_twitter"
                  value={profile.social_twitter}
                  onChange={handleChange}
                  placeholder="Twitter Profile URL"
                />
              </Form.Group>

              <Form.Group controlId="social_instagram" className="form-group-margin">
                <Form.Label><strong>Instagram Profile URL</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="social_instagram"
                  value={profile.social_instagram}
                  onChange={handleChange}
                  placeholder="Instagram Profile URL"
                />
              </Form.Group>

              <Form.Group controlId="social_youtube" className="form-group-margin">
                <Form.Label><strong>YouTube Profile URL</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="social_youtube"
                  value={profile.social_youtube}
                  onChange={handleChange}
                  placeholder="YouTube Channel URL"
                />
              </Form.Group>

              <Form.Group controlId="social_website" className="form-group-margin">
                <Form.Label><strong>Website URL</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="social_website"
                  value={profile.social_website}
                  onChange={handleChange}
                  placeholder="Website URL"
                />
              </Form.Group>
              <Button variant="warning" type="submit">
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    );
}

export default EditAccount;