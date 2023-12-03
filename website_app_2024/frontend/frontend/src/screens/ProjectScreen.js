import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Row,
  Col,
  Image,
  ListGroup,
  Button,
  Card,
  Form,
  ButtonGroup,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authContext";
import RelatedProjectsSlider from "../components/RelatedProjectsSlider";

import VotingButtons from "../components/VotingButtons";

import { useNavigate } from 'react-router-dom';
import Comment from "../components/Comment";
import PostComment from "../components/PostComment";

import moment from 'moment';

function ProjectScreen() {
  const [project, setProject] = useState({ project_images: [], attendees: [] });
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const { id } = useParams();
  const auth = useContext(AuthContext);

  const currentUserId = auth.user?.profile.id; // Ensure you have a safe check for `user` and `profile`.

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const [relatedProjects, setRelatedProjects] = useState([]);

  const [isFavorited, setIsFavorited] = useState(false);

  const [selectedImage, setSelectedImage] = useState(''); // State to track the selected image
  
  const currentUserProfile = auth.user?.profile; // Assuming `profile` is part of the user object


  const currentUser = auth.user; // Assuming `user` holds the current user information
  // console.log("Current User:", currentUser);

  const navigate = useNavigate(); // This is the function we'll use for navigation

  const [isAttending, setIsAttending] = useState(false);
  const [attendees, setAttendees] = useState([]);

  const refreshComments = useCallback(() => {
    axios
      .get(`/api/comments/${id}`)
      .then((response) => setComments(response.data))
      .catch((error) => console.error("Error refreshing comments:", error));
  }, [id]);


  
  useEffect(() => {
    async function fetchProject() {
      try {
        const { data } = await axios.get(`/api/projects/${id}`);
        setProject({
          ...data.project,
        });
                setSelectedImage(data.project.featured_image); // Initialize with the featured image
        
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    }
    

    console.log("Fetching project data for project id:", id);
    fetchProject();
    refreshComments();
  }, [id, refreshComments]);

    // Function to change the main image
    const handleImageSelect = (image) => {
      setSelectedImage(image);
    };

  useEffect(() => {
    async function fetchRelatedProjects(tags) {
      const promises = tags.map((tag) =>
        axios.get(`/api/projects/?tag_id=${tag.id}`)
      );
      const responses = await Promise.all(promises);
      const allRelatedProjects = responses.flatMap((response) => response.data);

      // Deduplicate related projects
      const uniqueRelatedProjects = Array.from(
        new Set(allRelatedProjects.map((p) => p.id))
      ).map((id) => allRelatedProjects.find((p) => p.id === id));

      setRelatedProjects(uniqueRelatedProjects);
    }

    if (project && project.tags && project.tags.length) {
      fetchRelatedProjects(project.tags);
    }
  }, [project]);

  useEffect(() => {
    async function checkFavoriteStatus() {
      if (auth.isAuthenticated) {
        // Only make request if user is authenticated
        const response = await axios.get(`/api/favorites/is-favorite/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setIsFavorited(response.data.isFavorited);
      }
    }

    checkFavoriteStatus();
  }, [id]);

  const handleAddFavorite = async () => {
    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      await axios.post(`/api/favorites/add/${id}/`, {}, config);
      setIsFavorited(true);
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const handleRemoveFavorite = async () => {
    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      await axios.delete(`/api/favorites/remove/${id}/`, config);
      setIsFavorited(false);
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

 
  useEffect(() => {
    async function checkAttendanceStatus() {
      if (auth.isAuthenticated) {
        try {
          const response = await axios.get(`/api/attendance/is-attending/${id}/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setIsAttending(response.data.isAttending);
        } catch (error) {
          console.error('Error checking attendance:', error);
        }
      }
    }
  
    checkAttendanceStatus();
  }, [id, auth.isAuthenticated]);

  

  const handleAddAttendance = async () => {
    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      await axios.post(`/api/attendance/add/${id}/`, {}, config);
      setIsAttending(true);
      // Optimistically update the attendees list
      setAttendees(prevAttendees => [...prevAttendees, { attendee: currentUserProfile }]);
    } catch (error) {
      console.error("Error adding attendance:", error);
    }
  };
  
  const handleRemoveAttendance = async () => {
    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      await axios.delete(`/api/attendance/remove/${id}/`, config);
      setIsAttending(false);
      // Optimistically update the attendees list
      setAttendees(prevAttendees => prevAttendees.filter(attendee => attendee.attendee.id !== currentUserId));
    } catch (error) {
      console.error("Error removing attendance:", error);
    }
  };
  

  useEffect(() => {
    const fetchAttendees = async () => {
        try {
            // Configuration for the authorization header
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            };

            const response = await axios.get(`/api/projects/${id}/attendees/`, config);
            setAttendees(response.data);
        } catch (error) {
            console.error('Error fetching attendees:', error);
        }
    };

    fetchAttendees();
}, [id]);

const formatMomentDate = (dateString) => {
  return dateString 
    ? moment.utc(dateString).format("DD/MM/YY, (ddd), hh:mm A") + " UTC+8" 
    : "N/A";
};

  return (
    <div>
      <Button className="btn btn-light my-3" onClick={() => navigate(-1)}>
        Go Back
      </Button>
      <Row>


      <Col md={6}>
          <Image src={selectedImage} alt={project.title} style={{ width: '550px', height: '450px', objectFit: 'cover', marginRight: '50px' }} fluid />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            {[project.featured_image, ...project.project_images.map(img => img.image)].map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt={`Thumbnail ${index}`} 
                style={{ width: "50px", height: "50px", marginRight: "10px", cursor: "pointer" }} 
                onClick={() => handleImageSelect(img)}
                onMouseEnter={() => handleImageSelect(img)}
              />
            ))}
          </div>
        </Col>



        <Col md={6}>
          <Card>
            <ListGroup variant="flush">

            <ListGroup.Item>
              <h3>{project.title}</h3>
            </ListGroup.Item>
            



<ListGroup.Item>
  <Row>
    <Col>Start Date & Time:</Col>
    <Col>
      <strong>{formatMomentDate(project.start_date)} </strong> 
    </Col>
  </Row>
</ListGroup.Item>

<ListGroup.Item>
  <Row>
    <Col>End Date & Time:</Col>
    <Col>
      <strong> {formatMomentDate(project.end_date)} </strong> 
    </Col>
  </Row>
</ListGroup.Item>





              
              <ListGroup.Item>
                <Row>
                  <Col>Price:</Col>
                  <Col>
                    <strong>RM{project.price}</strong>
                  </Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Location:</Col>
                  <Col>
                    <strong>{project.location}</strong>
                  </Col>
                </Row>
              </ListGroup.Item>

              {/* Add this section for the tags */}
              <ListGroup.Item>
                <Row>
                  <Col>
                    <ButtonGroup>
                      {project.tags &&
                        project.tags.map((tag) => (
                          <Link
                            key={tag.id}
                            to={`/categories?tag_id=${tag.id}`}
                          >
                            <Button
                              variant="danger"
                              className="mr-2"
                              style={{
                                fontSize: "12px",
                                padding: "2px 5px",
                                marginRight: "6px",
                              }}
                            >
                              {tag.name}
                            </Button>
                          </Link>
                        ))}
                    </ButtonGroup>
                  </Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>
                    <Button
                      variant="warning"
                      onClick={() => {
                        const url =
                          project.deal_link.startsWith("http://") ||
                          project.deal_link.startsWith("https://")
                            ? project.deal_link
                            : "http://" + project.deal_link;
                        window.open(url, "_blank");
                      }}
                    >
                      Go to Link
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>




              <ListGroup.Item>
  <Row>
    <Col>
      {isAttending ? (
        <Button variant="primary" onClick={handleRemoveAttendance}>
                    <i className="fa-solid fa-xmark" style={{ marginRight: '0.3rem' }}></i> Cancel Attending
        </Button>
      ) : (
        <Button variant="outline-success" onClick={handleAddAttendance}>
          <i className="fa-solid fa-check" style={{ marginRight: '0.3rem' }}></i> Attend
        </Button>
      )}
    </Col>
  </Row>
</ListGroup.Item>





              <ListGroup.Item>
                <Row>
                  <Col>
                    {isFavorited ? (
                      <Button variant="info" onClick={handleRemoveFavorite}>
                        <i className="fa-solid fa-bookmark" style={{ marginRight: '0.3rem' }}></i> Remove bookmark
                      </Button>
                    ) : (
                      <Button variant="outline-info" onClick={handleAddFavorite}>
                        <i className="fa-regular fa-bookmark" style={{ marginRight: '0.3rem' }}></i> Bookmark
                      </Button>
                    )}
                  </Col>
                </Row>
              </ListGroup.Item>



            </ListGroup>

            

          </Card>

          
          <Row style={{ marginTop: '1.5rem', marginLeft: '0.5rem' }}>
    <VotingButtons projectId={id} />
</Row>



        </Col>
      </Row>


      <Row style={{ marginTop: '1.5rem'}}>
      <Col md={9}>
          <ListGroup variant="flush">


            <Link to={currentUserId === project.owner?.id ? '/user/account' : `/profiles/${project.owner?.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
  <ListGroup.Item className="mb-2 d-flex align-items-center">
    {project.owner?.profile_image && (
      <img
        src={project.owner.profile_image}
        alt={`${project.owner.name}'s profile`}
        style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
      />
    )}
    {project.owner?.name}
  </ListGroup.Item>                
</Link>





            <ListGroup.Item>Price: RM{project.price}</ListGroup.Item>
            <ListGroup.Item>Description: {project.description}</ListGroup.Item>
          </ListGroup>

          <ListGroup.Item style={{ marginTop: '1.5rem'}}>
  <h4>Attendees ({attendees.length})</h4>
  <ListGroup>
      {attendees.map((attendance, index) => (
          <ListGroup.Item key={index}>
            <Link to={currentUserId === attendance.attendee.id ? '/user/account' : `/profiles/${attendance.attendee.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Image 
                  src={attendance.attendee.profile_image} 
                  roundedCircle 
                  style={{ width: '30px', height: '30px', marginRight: '10px' }}  // Small icon size
              />
              {attendance.attendee.name} (@{attendance.attendee.username})
            </Link>
          </ListGroup.Item>
      ))}
  </ListGroup>
</ListGroup.Item>





        </Col>
        </Row>






      <Row>
      <Col md={12} style={{ marginTop: '50px'}}>
          <h4>Comments</h4>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              projectId={id}
              currentUser={auth.user}

              onCommentUpdated={refreshComments} // Pass the refresh function
            />
          ))}
        </Col>
      </Row>

      <Row>
      <Col md={12} style={{ marginBottom: '50px' }}>
  {auth.isAuthenticated && <PostComment projectId={id} onCommentPosted={refreshComments} />}
        </Col>
      </Row>

      <RelatedProjectsSlider
        relatedProjects={relatedProjects}
        currentProjectId={id}
      />
    </div>
  );
}

export default ProjectScreen;
