import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Form, Button, Container, Col, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/authContext';

function Send() {
    const [formData, setFormData] = useState({
        subject: '',
        body: '',
        recipientId: ''
    });
    const [profiles, setProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]); // Added state for filtered profiles
    const [responseMessage, setResponseMessage] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const recipientFromQuery = params.get('recipient');

    const [showModal, setShowModal] = useState(false);
    const [existingThreadId, setExistingThreadId] = useState(null);

    const [blockedByUsers, setBlockedByUsers] = useState([]);

    const [usersBlockingMe, setUsersBlockingMe] = useState([]);

    const token = localStorage.getItem("token"); // Token retrieved from localStorage
    const authHeaders = {  // Define authHeaders for axios requests
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    // Function to check for existing thread
    const checkExistingThread = async (recipientId) => {
        try {
            const response = await axios.get('/api/threads/', authHeaders);
            const threads = response.data;
            const existingThread = threads.find(thread => 
                thread.participants.some(p => p.id === recipientId));
            if (existingThread) {
                setExistingThreadId(existingThread.id);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error fetching threads:', error);
        }
    };

    useEffect(() => {
        if (formData.recipientId) {
            checkExistingThread(formData.recipientId);
        }
    }, [formData.recipientId]);

    useEffect(() => {
        if (recipientFromQuery) {
            setFormData(prevState => ({
                ...prevState,
                recipientId: recipientFromQuery
            }));
        }
    }, [recipientFromQuery]);

    useEffect(() => {
        axios.get('/api/profiles/', authHeaders)
          .then(response => {
              setProfiles(response.data);
          })
          .catch(err => console.log(err));
    

// Inside the useEffect hook:
axios.get('/api/blocking-users/', authHeaders)
    .then(response => {
        setUsersBlockingMe(response.data);
    })
    .catch(err => console.log(err));


        axios.get('/api/blocked-users/', authHeaders)
          .then(response => {
              setBlockedByUsers(response.data);
          })
          .catch(err => console.log(err));
    }, []);

    const auth = useContext(AuthContext);
console.log("Auth User:", auth.user);

    const currentUserId =  auth.user.profile.id;
    console.log("currentUserId:", currentUserId);

    useEffect(() => {
        const newFilteredProfiles = profiles.filter(profile => 
            profile.id !== currentUserId && // Exclude current user
            !blockedByUsers.some(blockedUser => blockedUser.id === profile.id) &&
            !usersBlockingMe.some(blockingUser => blockingUser.id === profile.id)
        );
        setFilteredProfiles(newFilteredProfiles);
    }, [blockedByUsers, usersBlockingMe, profiles, currentUserId]); // Include currentUserId as a dependency
    
    
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/send_message/', formData, authHeaders);
            setResponseMessage(response.data.message);
            if (response.data.thread && response.data.thread.id) {
                navigate(`/thread/${response.data.thread.id}/`);
            } else {
                console.error("Thread ID is missing from the response.");
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setExistingThreadId(null);
        setFormData({ ...formData, recipientId: '' });
    };

    const navigateToThread = () => {
        navigate(`/thread/${existingThreadId}/`);
    };
    return (
        <Container>
            <h1>Send Message</h1>
            <Col>
              <Button variant="primary" onClick={() => navigate('/thread')}>Back to Inbox</Button>
            </Col>
            <Form onSubmit={handleSubmit}>
                {!recipientFromQuery && (
                    <Form.Group controlId="recipientId">
                        <Form.Label>Recipient:</Form.Label>
                        <Form.Control 
                            as="select" 
                            name="recipientId" 
                            value={formData.recipientId} 
                            onChange={handleChange}>
                            <option value="">Select Recipient</option>
                            {filteredProfiles.map(profile => (
                                <option key={profile.id} value={profile.id}>{profile.name || profile.username}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                )}
                <Form.Group controlId="body">
                    <Form.Label>Body</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        name="body" 
                        value={formData.body} 
                        onChange={handleChange} 
                    />
                </Form.Group>
                <Button variant="primary" type="submit">Submit</Button>
            </Form>

            {responseMessage && (
                <div>
                    <h3>Message Sent</h3>
                    <pre>{JSON.stringify(responseMessage, null, 2)}</pre>
                </div>
            )}

            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Existing Thread</Modal.Title>
                </Modal.Header>
                <Modal.Body>You have already a thread with this participant.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={navigateToThread}>
                        Go to Thread Message
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Send;