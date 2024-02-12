import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Container, Row, Col, Modal, Card } from "react-bootstrap";

const EditProject = () => {
  const [projectData, setProjectData] = useState({
    title: "",
    featured_image: null,
    project_images: Array(3).fill(null),
    description: "",
    brand: "",
    deal_link: "",
    price: "",
    tags: [],
    newTag: "",
    location: "",       // New state variable for location
    start_date: "",     // New state variable for start date/time
    end_date: "",       // New state variable for end date/time
  });

  const [imagePreviews, setImagePreviews] = useState({
    featured_image: "",
    featured_image_new: "",
    project_images: Array(3).fill(""),
    project_images_new: Array(3).fill(""), // new state for new additional images
  });
  
  

  const fileInputRefs = {
    featured_image: useRef(null),
    project_images: [useRef(null), useRef(null), useRef(null)],
  };


  
  
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { projectId } = useParams(); // Assuming you have a route parameter for project ID

  const [visibleTagCount, setVisibleTagCount] = useState(10); // For managing visible tags


  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        };
        const response = await axios.get(`/api/projects/${projectId}/`, config);
        
        if (response.data) {
          const project = response.data.project;
          const formattedStartDate = project.start_date ? new Date(project.start_date).toISOString().slice(0, 16) : "";
          const formattedEndDate = project.end_date ? new Date(project.end_date).toISOString().slice(0, 16) : "";
  
          setProjectData({
            ...project,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
          });
          setSelectedTags(project.tags.map(tag => tag.id)); // Assuming each tag has an id
          // Console logs for debugging
          console.log("Featured Image:", project.featured_image);
          console.log("Additional Images:", project.project_images);
          console.log("Taggies:", project.tags.map(tag => tag.id));
          console.log("Start Date:", formattedStartDate);
          console.log("End Date:", formattedEndDate);
          // Set image previews for existing images
// Set image previews for existing images
// Set image previews for existing images
setImagePreviews(prevState => ({
    ...prevState,
    featured_image: project.featured_image || "",
    project_images: project.project_images.map(img => img.image || ""),
  }));
  
  console.log("Image Previews after fetching project details:", imagePreviews);

  
        }
      } catch (error) {
        console.error("Error fetching project details", error);
      }
    };
  
    fetchProjectDetails();
  }, [projectId]);
  
    // When loading tags, you should also update the list of available tags
    useEffect(() => {
        const fetchTags = async () => {
          try {
            const response = await axios.get('/api/tags/');
            setTags(response.data);
            console.log("All Taggies:", response.data);

          } catch (error) {
            console.error('Error fetching tags', error);
          }
        };
    
        fetchTags();
      }, []);

  // console.log("Project Data Title 1:", response.data.title);
  // console.log("Project Data Title 2:", projectData.project.title);

  // Rest of your existing handlers and functions, such as handleChange, handleToggleTagToProject, etc.

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      // Handling file inputs for images
      if (files && files[0]) {
        const file = files[0];
        const fileUrl = URL.createObjectURL(file);

        if (name === "featured_image") {
          setProjectData(prevState => ({ ...prevState, featured_image: file }));
          setImagePreviews(prevState => ({ ...prevState, featured_image_new: fileUrl }));
        } else if (name.startsWith("additional_image_")) {
          const index = parseInt(name.split("_")[2], 10);
          setProjectData(prevState => {
            const newImages = [...prevState.project_images];
            newImages[index] = file;
            return { ...prevState, project_images: newImages };
          });

          setImagePreviews(prevState => {
            const updatedNewImages = [...prevState.project_images_new];
            updatedNewImages[index] = fileUrl;
            return { ...prevState, project_images_new: updatedNewImages };
          });
        }
      }
    } else {
      // Handling other regular inputs
      setProjectData(prevState => ({ ...prevState, [name]: value }));
    }
};

  
  
  console.log("Updated Image Previews:", imagePreviews);

  useEffect(() => {
    console.log("Current imagePreviews state:", imagePreviews);
 }, [imagePreviews]);
 

  // Function to load more tags
  const loadMoreTags = () => {
    const newCount = visibleTagCount + 10;
    setVisibleTagCount(newCount > tags.length ? tags.length : newCount);
  };

  // Function to load less tags
  const loadLessTags = () => {
    const newCount = visibleTagCount - 10;
    setVisibleTagCount(newCount < 10 ? 10 : newCount);
  };

  // Update the handleToggleTagToProject function
  const handleToggleTagToProject = (tagId) => {
    if (isValidUUID(tagId)) {
      setSelectedTags(selectedTags.includes(tagId)
        ? selectedTags.filter(id => id !== tagId)
        : [...selectedTags, tagId]
      );
    } else {
      console.error("Invalid UUID: ", tagId);
    }
  };

  // Validate UUID
  const isValidUUID = (uuid) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      uuid
    );
  };

  const handleAddTag = async () => {
    const newTagName = projectData.newTag.trim().toLowerCase();

    if (newTagName !== "") {
      const existingTag = tags.find(
        (tag) => tag.name.toLowerCase() === newTagName
      );

      if (existingTag) {
        setSelectedTags(
          selectedTags.includes(existingTag.id)
            ? selectedTags
            : [...selectedTags, existingTag.id]
        );
      } else {
        try {
          const response = await axios.post("/api/add-tag/", {
            name: newTagName,
          });
          const newTag = response.data;
          setTags([...tags, newTag]);
          setSelectedTags([...selectedTags, newTag.id]);
        } catch (error) {
          console.error("Error adding tag", error);
        }
      }
      setProjectData({ ...projectData, newTag: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let formData = new FormData();
    for (let key in projectData) {
        if (key === "project_images") {
          projectData.project_images.forEach((image, index) => {
            if (image && typeof image === 'object') {
              formData.append(`additional_image_${index}`, image); // Changed key here
            }
          });
        } else if (key === "featured_image") {
          if (projectData.featured_image && typeof projectData.featured_image === 'object') {
            formData.append('featured_image', projectData.featured_image); // No change needed here
          }
        } else if (key !== "tags") {
          formData.append(key, projectData[key]);
        }
      }
  
      selectedTags.forEach((tagId) => {
        formData.append("tags", tagId);
      });
  
    // Log the form data for debugging
    for (let pair of formData.entries()) {
        console.log("the form data:",pair[0]+ ', ' + pair[1]); 
    }


    try {
      const response = await axios.put(
        `/api/update-project/${projectId}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data);
      navigate("/"); // Redirect to home page or appropriate route
    } catch (error) {
      if (error.response && error.response.data) {
        setServerError(Object.values(error.response.data).join(" "));
      } else {
        setServerError("An unexpected error occurred.");
      }
    }
  };

      // clearImage function modified to handle multiple images
      const clearImage = (imageType, index = null) => {
        if (imageType === 'featured_image') {
            setProjectData({ ...projectData, featured_image: null });
            setImagePreviews({ ...imagePreviews, featured_image: '', featured_image_new: '' });
            if (fileInputRefs.featured_image.current) {
                fileInputRefs.featured_image.current.value = "";
            }
        } else if (imageType === 'additional_image') {
            setProjectData(prevState => {
                const updatedImages = [...prevState.project_images];
                updatedImages[index] = null;
                return { ...prevState, project_images: updatedImages };
            });
        
            setImagePreviews(prevState => {
                const updatedImagePreviews = [...prevState.project_images];
                const updatedNewImagePreviews = [...prevState.project_images_new];
                updatedImagePreviews[index] = '';
                updatedNewImagePreviews[index] = '';
                return { ...prevState, project_images: updatedImagePreviews, project_images_new: updatedNewImagePreviews };
            });
    
            if (fileInputRefs.project_images[index].current) {
                fileInputRefs.project_images[index].current.value = "";
            }
        }
    };
    

    
  // console.log("",response.data);

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
        <h2>Edit Event</h2>

      
          <Form onSubmit={handleSubmit}>
            {/* Title */}
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter deal title"
                name="title"
                value={projectData.title}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Description */}
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={projectData.description}
                onChange={handleChange}
              />
            </Form.Group>
            {/* ... other form groups ... */}



            <Card className="mb-3">
          <Card.Body>
            <Form.Group controlId="featured_image">
              <Form.Label>Featured Image</Form.Label>
              {imagePreviews.featured_image && (
                <div>
                  {/* Existing Featured Image */}
                  <img
                    src={imagePreviews.featured_image}
                    alt="Existing Featured Image"
                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    className="mb-2"
                  />
                  <p>Current File: {imagePreviews.featured_image.split('/').pop()}</p>
                  <Button variant="danger" onClick={() => clearImage('featured_image')} className="mb-2">Clear</Button>
                </div>
              )}

              <Form.Label>Choose new featured image:</Form.Label>
              <Form.Control
                type="file"
                name="featured_image"
                onChange={handleChange}
                ref={fileInputRefs.featured_image}
                style={{ marginBottom: '20px' }}
              />
            </Form.Group>

            {imagePreviews.featured_image_new && (
              <div>
                {/* New Featured Image Preview */}
                <img
                  src={imagePreviews.featured_image_new}
                  alt="New Featured Image"
                  style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                  className="mb-2"
                />
              </div>
            )}
          </Card.Body>
        </Card>


{Array.from({ length: 3 }).map((_, index) => (
      <Card className="mb-3" key={index}>
      <Card.Body>
  <Form.Group controlId={`additional_image_${index}`} key={index}>
    <Form.Label>{`Additional Image ${index + 1}`}</Form.Label>
    
    {/* Existing Image Preview */}
    {imagePreviews.project_images[index] && (
      <div>
        <img
          src={imagePreviews.project_images[index]}
          alt={`Existing Additional Image ${index + 1}`}
          style={{ width: '200px', height: '200px', objectFit: 'cover' }}
          className="mb-2"
        />
        <p>Current File: {imagePreviews.project_images[index].split('/').pop()}</p>
        <Button variant="danger" onClick={() => clearImage('additional_image', index)} className="mb-2">Clear</Button>
      </div>
    )}
    {/* File Input Field */}
    <Form.Label>{`Choose new additional image ${index + 1}`}</Form.Label>

    <Form.Control
      type="file"
      name={`additional_image_${index}`}
      onChange={handleChange}
      ref={fileInputRefs.project_images[index]}
      style={{ marginBottom: '20px' }}
    />

    {/* New Image Preview */}
    {imagePreviews.project_images_new[index] && (
      <div>
        <img
          src={imagePreviews.project_images_new[index]}
          alt={`New Additional Image ${index + 1}`}
          style={{ width: '200px', height: '200px', objectFit: 'cover' }}
          className="mb-2"
        />
      </div>
    )}

  </Form.Group>
  </Card.Body>
  </Card>
))}

            {/* Brand */}
            {/* <Form.Group controlId="brand">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                placeholder="Brand name"
                name="brand"
                value={projectData.brand}
                onChange={handleChange}
              />
            </Form.Group> */}

<Form.Group controlId="location">
  <Form.Label>Location</Form.Label>
  <Form.Control
    type="text"
    placeholder="Enter location"
    name="location"
    value={projectData.location}
    onChange={handleChange}
  />
</Form.Group>


<Form.Group controlId="start_date">
  <Form.Label>Start Date and Time</Form.Label>
  <Form.Control
    type="datetime-local"
    name="start_date"
    value={projectData.start_date}
    onChange={handleChange}
  />
</Form.Group>


<Form.Group controlId="end_date">
  <Form.Label>End Date and Time</Form.Label>
  <Form.Control
    type="datetime-local"
    name="end_date"
    value={projectData.end_date}
    onChange={handleChange}
  />
</Form.Group>


            {/* Deal Link */}
            <Form.Group controlId="deal_link">
              <Form.Label>Event Link</Form.Label>
              <Form.Control
                type="text"
                placeholder="http://example.com/event"
                name="deal_link"
                value={projectData.deal_link}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Price */}
            <Form.Group controlId="price">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="Price in Ringgit (RM)"
                name="price"
                value={projectData.price}
                onChange={handleChange}
              />
            </Form.Group>




   {/* Tags Section */}
   <Form.Group controlId="tags">
      <Form.Label>Available Categories</Form.Label>
      <div>
        {tags.slice(0, visibleTagCount).map(tag => (
          <Button 
            key={tag.id} 
            onClick={() => handleToggleTagToProject(tag.id)} 
            variant={selectedTags.includes(tag.id) ? "primary" : "outline-primary"}
            className="m-1"
          >
            {tag.name} {selectedTags.includes(tag.id) ? "-" : "+"}
          </Button>
        ))}
      </div>
      {/* Load More / Load Less Buttons */}

      <div className="mt-2">
                                <Button 
                                    onClick={loadMoreTags} 
                                    disabled={visibleTagCount >= tags.length}
                                    className="mr-2">
<i className="fa-solid fa-arrow-down"></i>                                </Button>
                                <Button 
                                    onClick={loadLessTags} 
                                    disabled={visibleTagCount <= 10}>
                                    <i className="fa-solid fa-arrow-up"></i> 
                                </Button>
                            </div>
                                </Form.Group>

    {/* Selected Tags Display */}
    <Form.Group controlId="selectedTags">
      <Form.Label>Selected Categories</Form.Label>
      <div>
        {selectedTags.map(tagId => {
          const tag = tags.find(t => t.id === tagId);
          return tag ? (
            <Button 
              key={tag.id} 
              onClick={() => handleToggleTagToProject(tag.id)} 
              variant="outline-danger"
              className="m-1"
            >
              {tag.name}
            </Button>
          ) : null;
        })}
      </div>
    </Form.Group>




{/* Add New Tag */}
<Form.Group controlId="newTag">
    <Form.Label>Add New Category</Form.Label>
    <Row>
        <Col>
            <Form.Control
                type="text"
                placeholder="Enter category name"
                value={projectData.newTag}
                onChange={(e) => setProjectData({ ...projectData, newTag: e.target.value })}
            />
        </Col>
        <Col>
            <Button variant="primary" onClick={handleAddTag}>Add Category</Button>
        </Col>
    </Row>
</Form.Group>










            {/* Submit Button */}
            <Button variant="primary" type="submit">
              Edit Project
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProject;
