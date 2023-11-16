import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Modal } from 'react-bootstrap';
import { ListGroup, CloseButton } from 'react-bootstrap';

const ProjectForm = ({ editMode = false }) => {
    const [projectData, setProjectData] = useState({
        title: '',
        featured_image: null,
        description: '',
        brand: '',
        deal_link: '',
        price: '',
        tags: [],
        newTag: '',
    });
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [visibleTagCount, setVisibleTagCount] = useState(10);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);
    const [serverError, setServerError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { projectId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjectData = async () => {
            if (editMode && projectId) {
                try {
                    const response = await axios.get(`/api/projects/${projectId}`);
                    setProjectData(response.data);

                    if (response.data.featured_image) {
                        setImagePreview(response.data.featured_image_url); // Ensure this URL is correct
                    }
                } catch (error) {
                    console.error('Error fetching project', error);
                }
            }
        };

        fetchProjectData();
    }, [editMode, projectId]);

    const isValidUUID = (uuid) => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
    };

    const handleToggleTagToProject = (tagId) => {
        if (isValidUUID(tagId)) {
            if (selectedTags.includes(tagId)) {
                setSelectedTags(selectedTags.filter(id => id !== tagId));
            } else {
                setSelectedTags([...selectedTags, tagId]);
            }
        } else {
            console.error("Invalid UUID: ", tagId);
        }
    };

    const handleRemoveTagFromProject = (tagId) => {
        setSelectedTags(selectedTags.filter(id => id !== tagId));
    };

    const handleAddTag = async () => {
        const newTagName = projectData.newTag.trim().toLowerCase();
        if (newTagName !== '') {
            const existingTag = tags.find(tag => tag.name.toLowerCase() === newTagName);
            if (existingTag) {
                if (!selectedTags.includes(existingTag.id)) {
                    setSelectedTags([...selectedTags, existingTag.id]);
                }
            } else {
                try {
                    const response = await axios.post('/api/add-tag/', { name: newTagName });
                    const newTag = response.data;
                    setTags([...tags, newTag]);
                    setSelectedTags([...selectedTags, newTag.id]);
                } catch (error) {
                    console.error("Error adding tag", error);
                }
            }
            setProjectData({ ...projectData, newTag: '' });
        }
    };

    const loadMoreTags = () => {
        const newCount = visibleTagCount + 10;
        setVisibleTagCount(newCount > tags.length ? tags.length : newCount);
    };

    const loadLessTags = () => {
        const newCount = visibleTagCount - 10;
        setVisibleTagCount(newCount < 10 ? 10 : newCount);
    };

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const response = await axios.get(`/api/projects/${projectId}`);
                console.log("API Response:", response.data); // Add this log to check the API response
    
                if (response.data) {
                    setProjectData(response.data);
    
                    if (response.data.featured_image) {
                        setImagePreview(response.data.featured_image_url); // Make sure this URL is correct
                    }
                } else {
                    console.error('No data in API response');
                }
            } catch (error) {
                console.error('Error fetching project', error);
            }
        };
    
        // Fetch tags when the component mounts
        const fetchTags = async () => {
            try {
                const response = await axios.get('/api/tags/');
                if (Array.isArray(response.data)) {
                    setTags(response.data);
                } else {
                    console.error('Invalid data format for tags');
                }
            } catch (error) {
                console.error('Error fetching tags', error);
            }
        };
    
        fetchTags();
        fetchProjectData();
    }, [editMode, projectId]);
    

    const clearImage = () => {
        setProjectData({ ...projectData, featured_image: null });
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = "";  // Reset the file input
        }
    };

    // Validate UUID


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

    const handleSubmit = async (e) => {
        e.preventDefault();
        let formData = new FormData();
        // Existing logic to prepare formData

        try {
            const url = editMode ? `/api/update-project/${projectId}` : '/api/create-project/';
            const response = await axios[editMode ? 'put' : 'post'](url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            // Success handling logic
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                navigate('/'); // Redirect after success
            }, 1500);
        } catch (error) {
            // Error handling
            setServerError("Error updating the project");
        }
    };
    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>

                    <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Success</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Project updated successfully!
                        </Modal.Body>
                    </Modal>

                    {serverError && (
                        <div className="alert alert-danger" role="alert">
                            {serverError}
                        </div>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="title" 
                                value={projectData.title}
                                onChange={handleChange} 
                            />
                        </Form.Group>

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
                                ref={fileInputRef} 
                            />
                        </Form.Group>

                        {/* Additional fields like Brand, Deal Link, Price, etc. */}
                        {/* ... */}

                        {/* Tags Section */}
                        <Form.Group controlId="tags">
                            <Form.Label>Tags</Form.Label>

                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Update Project
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default ProjectForm;