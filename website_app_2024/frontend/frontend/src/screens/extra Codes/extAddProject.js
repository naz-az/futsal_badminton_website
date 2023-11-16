import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Modal  } from 'react-bootstrap';
import { ListGroup, CloseButton } from 'react-bootstrap';  // Import additional components
import { useNavigate } from 'react-router-dom';

const AddProject = () => {
    const [projectData, setProjectData] = useState({
        title: '',
        featured_image: null,
        description: '',
        brand: '',
        deal_link: '',
        price: '',
        tags: [],  // Add tags to your state
        newTag: '',  // For creating new tags

    });

    const [tags, setTags] = useState([]); // State to store all available tags
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);  // Create a ref for the file input

    const [selectedTags, setSelectedTags] = useState([]); // State for selected tags

    const [visibleTagCount, setVisibleTagCount] = useState(10); // State to manage the number of visible tags

    const [serverError, setServerError] = useState('');

    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState(false); // State for showing the success modal

    const [additionalImages, setAdditionalImages] = useState([null, null, null]);
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState(['', '', '']);
    
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



    useEffect(() => {
        // Fetch tags when the component mounts
        const fetchTags = async () => {
            try {
                const response = await axios.get('/api/tags/');
                console.log("Fetched Tags: ", response.data); // Add this line to inspect the tags format

                setTags(response.data);
            } catch (error) {
                console.error('Error fetching tags', error);
            }
        };
        fetchTags();
    }, []);

    // Handle change in form fields other than tags
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'featured_image') {
                const file = files[0];
                setProjectData({ ...projectData, featured_image: file });
        
                const imageURL = URL.createObjectURL(file);
                setImagePreview(imageURL);        } else {
            setProjectData({ ...projectData, [name]: value });
        }
    };
    
// Toggle tag addition/removal to/from project
const handleToggleTagToProject = (tagId) => {
    if (isValidUUID(tagId)) {
        if (selectedTags.includes(tagId)) {
            // Remove the tag from selected tags
            setSelectedTags(selectedTags.filter(id => id !== tagId));
        } else {
            // Add the tag to selected tags
            setSelectedTags([...selectedTags, tagId]);
        }
    } else {
        console.error("Invalid UUID: ", tagId); // Debug log
    }
};
// Validate UUID
const isValidUUID = (uuid) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
};

// Handle tag addition to project
const handleAddTagToProject = (tagId) => {
    if (isValidUUID(tagId)) {
        setSelectedTags([...selectedTags, tagId]);
    } else {
        console.error("Invalid UUID: ", tagId); // Debug log
    }
};

// Handle removal of tag from project
const handleRemoveTagFromProject = (tagId) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId && isValidUUID(id)));
};


    const handleAddTag = async () => {
        const newTagName = projectData.newTag.trim().toLowerCase();
    
        if (newTagName !== '') {
            // Check if the tag already exists (case-insensitive)
            const existingTag = tags.find(tag => tag.name.toLowerCase() === newTagName);
    
            if (existingTag) {
                // If tag exists, just add it to selected tags
                if (!selectedTags.includes(existingTag.id)) {
                    setSelectedTags([...selectedTags, existingTag.id]);
                }
            } else {
                // If tag does not exist, create a new one
                try {
                    const response = await axios.post('/api/add-tag/', { name: newTagName });
                    const newTag = response.data;
                    setTags([...tags, newTag]);  // Add the new tag to the local state
                    setSelectedTags([...selectedTags, newTag.id]);  // Automatically select the new tag
                } catch (error) {
                    console.error("Error adding tag", error);
                }
            }
            // Reset the newTag input field
            setProjectData({ ...projectData, newTag: '' });  
        }
    };
    
    
    const clearImage = () => {
        setProjectData({ ...projectData, featured_image: null });
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = "";  // Reset the file input
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        let formData = new FormData();
        for (let key in projectData) {
            if (key !== 'tags') {
                formData.append(key, projectData[key]);
            }
        }
        // Add only valid UUIDs
        selectedTags.filter(isValidUUID).forEach(tagId => {
            formData.append('tags', tagId);
        });
        
        // Append each tag ID as a separate entry in formData
        selectedTags.forEach(tagId => {
            formData.append('tags', tagId);
        });
    
        console.log("FormData before sending:", formData);  // Add this line to log FormData
    
        try {
            const response = await axios.post('/api/create-project/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            console.log(response.data);
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false); // Hide modal after a delay
                navigate('/'); // Redirect to home page
            }, 1500); // Delay of 3 seconds
                } catch (error) {
            if (error.response && error.response.data) {
                // Assuming the error message is in error.response.data
                setServerError(Object.values(error.response.data).join(' '));
            } else {
                setServerError("An unexpected error occurred.");
            }
        }
    };
    


    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
                <Modal.Header>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Project added successfully!
                </Modal.Body>
            </Modal>

                                        {/* Error Alert */}
                                        {serverError && (
                        <div className="alert alert-danger" role="alert">
                            {serverError}
                        </div>
                    )}


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

                        <Form.Group controlId="featured_image">
                            <Form.Label>Featured Image</Form.Label>
                            
                            {imagePreview && (
                                <div>
<img 
    src={imagePreview} 
    alt="Selected Project" 
    style={{ width: '200px', height: '200px', objectFit: 'cover' }} 
    className="mb-2" 
/>
                                    <Button variant="danger" onClick={clearImage} className="mb-2">Clear</Button>
                                </div>
                            )}

                            <Form.Control 
                                type="file" 
                                name="featured_image" 
                                onChange={handleChange} 
                                ref={fileInputRef}  // Attach the ref to the file input
                            />
                        </Form.Group>

                        {/* Brand */}
                        <Form.Group controlId="brand">
                            <Form.Label>Brand</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Brand name" 
                                name="brand" 
                                value={projectData.brand}
                                onChange={handleChange} 
                            />
                        </Form.Group>

                        {/* Deal Link */}
                        <Form.Group controlId="deal_link">
                            <Form.Label>Deal Link</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="http://example.com/deal"
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
                                placeholder="Price in USD" 
                                name="price" 
                                value={projectData.price}
                                onChange={handleChange} 
                            />
                        </Form.Group>

            {/* Tags */}
            {/* <Form.Group controlId="tags">
                <Form.Label>Tags</Form.Label>
                <Form.Control 
                    as="select" 
                    multiple 
                    name="tags" 
                    value={projectData.tags}
                    onChange={handleChange}
                >
                    {tags.map(tag => (
                        <option key={tag.id} value={tag.id}>{tag.name}</option>
                    ))}
                </Form.Control>
            </Form.Group> */}


   {/* Tags Section */}
        {/* Tags Section */}
        <Form.Group controlId="tags">
                            <Form.Label>Available Tags</Form.Label>
                            <div>
                                {tags.slice(0, visibleTagCount).map(tag => (
                                    <Button 
                                    key={tag.id} 
                                    onClick={() => handleToggleTagToProject(tag.id)} 
                                    variant={Array.isArray(projectData.tags) && projectData.tags.includes(tag.id) ? "primary" : "outline-primary"}
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
                <Form.Label>Selected Tags</Form.Label>
                <div>
                    {selectedTags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                            <Button 
                                key={tag.id} 
                                onClick={() => handleRemoveTagFromProject(tag.id)} 
                                variant="outline-danger" 
                                className="m-1"
                            >
                                {tag.name} -
                            </Button>
                        ) : null;
                    })}
                </div>
            </Form.Group>

            {/* Add New Tag */}
            <Form.Group controlId="newTag">
                <Form.Label>Add New Tag</Form.Label>
                <Row>
                    <Col>
                        <Form.Control type="text" name="newTag" value={projectData.newTag} onChange={handleChange} />
                    </Col>
                    <Col>
                        <Button onClick={handleAddTag}>Add Tag</Button>
                    </Col>
                </Row>
            </Form.Group>

                        {/* Submit Button */}
                        <Button variant="primary" type="submit">
                            Add Project
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default AddProject;