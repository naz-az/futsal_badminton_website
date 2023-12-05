import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Modal  } from 'react-bootstrap';
import { ListGroup, CloseButton } from 'react-bootstrap';  // Import additional components
import { useNavigate } from 'react-router-dom';

const AddProject = () => {
    const [projectData, setProjectData] = useState({
        title: '',
        featured_image: null,
        additional_images: Array(3).fill(null),
        description: '',
        brand: '',
        deal_link: '',
        price: '',
        tags: [],
        newTag: '',
        location: '',         // New state variable for location
        start_date: '',       // New state variable for start date/time
        end_date: '',         // New state variable for end date/time
    });

    const [imagePreviews, setImagePreviews] = useState({
        featured_image: '',
        additional_images: Array(3).fill(''),
    });

    const fileInputRefs = {
        featured_image: useRef(null),
        additional_images: [useRef(null), useRef(null), useRef(null)],
    };

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

    const convertToMalaysianTime = (isoString) => {
        const date = new Date(isoString);
        const offset = 8; // Malaysian Time Zone Offset (UTC+8)
        const localTime = new Date(date.getTime() + offset * 3600 * 1000);
        return localTime.toISOString().substring(0, 16); // Adjust format as needed
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

    // handleChange modified to handle multiple images
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'featured_image' || name.startsWith('additional_image_')) {
            const file = files[0];
            const updatedImages = [...projectData.additional_images];
            const updatedImagePreviews = { ...imagePreviews.additional_images };

            if (name === 'featured_image') {
                setProjectData({ ...projectData, featured_image: file });
                setImagePreviews({ ...imagePreviews, featured_image: URL.createObjectURL(file) });
            } else {
                const index = parseInt(name.split('_')[2]);
                updatedImages[index] = file;
                updatedImagePreviews[index] = URL.createObjectURL(file);
                setProjectData({ ...projectData, additional_images: updatedImages });
                setImagePreviews({ ...imagePreviews, additional_images: updatedImagePreviews });
            }

        } else {
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
    
    
    // clearImage function modified to handle multiple images
    const clearImage = (imageType, index = null) => {
        if (imageType === 'featured_image') {
            setProjectData({ ...projectData, featured_image: null });
            setImagePreviews({ ...imagePreviews, featured_image: '' });
            if (fileInputRefs.featured_image.current) {
                fileInputRefs.featured_image.current.value = "";
            }
        } else if (imageType === 'additional_image') {
            const updatedImages = [...projectData.additional_images];
            const updatedImagePreviews = [...imagePreviews.additional_images];
            updatedImages[index] = null;
            updatedImagePreviews[index] = '';
            setProjectData({ ...projectData, additional_images: updatedImages });
            setImagePreviews({ ...imagePreviews, additional_images: updatedImagePreviews });
            if (fileInputRefs.additional_images[index].current) {
                fileInputRefs.additional_images[index].current.value = "";
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        let formData = new FormData();
        formData.append('featured_image', projectData.featured_image);
        console.log('Additional Images Type:', typeof projectData.additional_images);
        console.log('Additional Images:', projectData.additional_images);

        
        projectData.additional_images.forEach((image, index) => {
            if (image) {
                formData.append(`additional_images_${index}`, image);
            }
        });

        // let formData = new FormData();
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
                                placeholder="Enter event title" 
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
                                placeholder="Enter description"
                                value={projectData.description}
                                onChange={handleChange} 
                            />
                        </Form.Group>
                        {/* ... other form groups ... */}

                        {/* Featured Image Input */}
                        <Form.Group controlId="featured_image">
                            <Form.Label>Featured Image</Form.Label>
                            {imagePreviews.featured_image && (
                                <div>
                                    <img
                                        src={imagePreviews.featured_image}
                                        alt="Selected Project"
                                        style={{ width: '300px', height: '300px', objectFit: 'cover', marginRight: '50px' }}
                                        className="mb-2"
                                    />
                                    <Button variant="danger" onClick={() => clearImage('featured_image')} className="mb-2">Clear</Button>
                                </div>
                            )}
                            <Form.Control
                                type="file"
                                name="featured_image"
                                onChange={handleChange}
                                ref={fileInputRefs.featured_image}
                            />
                        </Form.Group>

                        {/* Additional Image Inputs */}
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Form.Group controlId={`additional_image_${index}`} key={index}>
                                <Form.Label>{`Additional Image ${index + 1}`}</Form.Label>
                                {imagePreviews.additional_images[index] && (
                                    <div>
                                        <img
                                            src={imagePreviews.additional_images[index]}
                                            alt={`Additional Image ${index + 1}`}
                                            style={{ width: '300px', height: '300px', objectFit: 'cover', marginRight: '50px' }}
                                            className="mb-2"
                                        />
                                        <Button variant="danger" onClick={() => clearImage('additional_image', index)} className="mb-2">Clear</Button>
                                    </div>
                                )}
                                <Form.Control
                                    type="file"
                                    name={`additional_image_${index}`}
                                    onChange={handleChange}
                                    ref={fileInputRefs.additional_images[index]}
                                />
                            </Form.Group>
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

                {/* Location Input */}
                <Form.Group controlId="location">
                    <Form.Label>Location</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Enter event location" 
                        name="location" 
                        value={projectData.location}
                        onChange={handleChange} 
                    />
                </Form.Group>

                {/* Start Date/Time Input */}
                <Form.Group controlId="start_date">
                    <Form.Label>Start Date and Time</Form.Label>
                    <Form.Control 
                        type="datetime-local" 
                        name="start_date" 
                        value={projectData.start_date}
                        onChange={handleChange} 
                    />
                </Form.Group>

                {/* End Date/Time Input */}
                <Form.Group controlId="end_date">
                    <Form.Label>End Date and Time</Form.Label>
                    <Form.Control 
                        type="datetime-local" 
                        name="end_date" 
                        value={projectData.end_date}
                        onChange={handleChange} 
                    />
                </Form.Group>


                        {/* Price */}
                        <Form.Group controlId="price">
                            <Form.Label>Price (per person)</Form.Label>
                            <Form.Control 
                                type="number" 
                                step="0.01"
                                placeholder="Price in Ringgit (RM)" 
                                name="price" 
                                value={projectData.price}
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
                            <Form.Label>Available Categories</Form.Label>
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
                <Form.Label>Selected Categories</Form.Label>
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
                <Form.Label>Add New Category</Form.Label>
                <Row>
                    <Col>
                        <Form.Control type="text" name="newTag" value={projectData.newTag} onChange={handleChange} />
                    </Col>
                    <Col>
                        <Button onClick={handleAddTag}>Add Category</Button>
                    </Col>
                </Row>
            </Form.Group>

                        {/* Submit Button */}
                        <Button variant="primary" type="submit">
                            Add Event
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default AddProject;