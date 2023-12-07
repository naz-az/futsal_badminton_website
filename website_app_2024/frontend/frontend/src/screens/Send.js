import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Form, Button, Container, Col, Modal,ListGroup, Image  } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/authContext';
import { Link } from 'react-router-dom';

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

    const [searchInput, setSearchInput] = useState(''); // State for search input

    const [selectedProfile, setSelectedProfile] = useState(null); // State for selected profile

    const [showAlertModal, setShowAlertModal] = useState(false);

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

    // useEffect(() => {
    //     const newFilteredProfiles = profiles.filter(profile => 
    //         profile.id !== currentUserId && // Exclude current user
    //         !blockedByUsers.some(blockedUser => blockedUser.id === profile.id) &&
    //         !usersBlockingMe.some(blockingUser => blockingUser.id === profile.id)
    //     );
    //     setFilteredProfiles(newFilteredProfiles);
    // }, [blockedByUsers, usersBlockingMe, profiles, currentUserId]); // Include currentUserId as a dependency
    
   
    useEffect(() => {
        // Only filter profiles if there is search input
        if (searchInput) {
            const newFilteredProfiles = profiles.filter(profile => 
                profile.id !== currentUserId &&
                !blockedByUsers.some(blockedUser => blockedUser.id === profile.id) &&
                !usersBlockingMe.some(blockingUser => blockingUser.id === profile.id) &&
                profile.name.toLowerCase().includes(searchInput.toLowerCase())
            );
            setFilteredProfiles(newFilteredProfiles);
        } else {
            setFilteredProfiles([]); // Clear the filtered profiles if search input is empty
        }
    }, [blockedByUsers, usersBlockingMe, profiles, currentUserId, searchInput]);


    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        
        // Check if a recipient is selected. If not, show the custom alert modal.
        if (!formData.recipientId) {
            setShowAlertModal(true);
            return;
        }
    
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
        setSelectedProfile(null); // Clear the selected profile
        setFormData({ ...formData, recipientId: '' }); // Clear the recipientId in formData
        setSearchInput(''); // Show the search bar again
    };
    
    const navigateToThread = () => {
        navigate(`/thread/${existingThreadId}/`);
    };


    
    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSelectRecipient = (profile) => {
        setFormData({ ...formData, recipientId: profile.id });
        setSelectedProfile(profile); // Set the selected profile
        setSearchInput(''); // Clear the search input
    };

    const handleDeselectRecipient = () => {
        setSelectedProfile(null); // Clear the selected profile
        setFormData({ ...formData, recipientId: '' }); // Clear the recipientId in formData
    };

    const [recipientProfile, setRecipientProfile] = useState(null);

        // Fetch recipient's profile when recipientFromQuery changes
        useEffect(() => {
            if (recipientFromQuery) {
                axios.get(`/api/profiles/${recipientFromQuery}`, authHeaders)
                    .then(response => {
                        setRecipientProfile(response.data);
                        setFormData(prevState => ({
                            ...prevState,
                            recipientId: recipientFromQuery
                        }));
                    })
                    .catch(err => console.log(err));
            } else {
                setRecipientProfile(null); // Reset if recipientFromQuery is not present
            }
        }, [recipientFromQuery]);
    
        // Function to handle deselecting the recipient
// Function to handle deselecting the recipient
const handleDeselectQueryRecipient = () => {
    setRecipientProfile(null);
    setFormData({ ...formData, recipientId: '' });
    navigate("/send"); // Add this line to navigate to "/send"
};


    return (
        <Container>

<Modal show={showAlertModal} onHide={() => setShowAlertModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Alert</Modal.Title>
    </Modal.Header>
    <Modal.Body>Recipient not selected! Please select a recipient.</Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAlertModal(false)}>
            Close
        </Button>
    </Modal.Footer>
</Modal>


            <h1>Send Message</h1>
            <Col>
                <Button variant="info" onClick={() => navigate('/thread')}>Back to Inbox</Button>
            </Col>
            <Form onSubmit={handleSubmit}>


            {recipientProfile && (
                    <div className="selected-recipient d-flex align-items-center" style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                        <Image 
                            src={recipientProfile.profile_image} 
                            alt={`${recipientProfile.username}'s profile`} 
                            roundedCircle 
                            style={{ width: '40px', height: '40px', marginRight: '15px' }}
                        />
                        <span style={{ flex: 1 }}>{recipientProfile.name || recipientProfile.username}</span>
                        <Button variant="primary" size="sm" onClick={handleDeselectQueryRecipient}>X</Button>
                    </div>
                )}







                {!recipientFromQuery && (
                    <>
                        <Form.Group controlId="searchRecipient">
                            <Form.Label>Search Recipient:</Form.Label>
                            {selectedProfile ? (
                                <div className="selected-recipient d-flex align-items-center" style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                                    <Image 
                                        src={selectedProfile.profile_image} 
                                        alt={`${selectedProfile.username}'s profile`} 
                                        roundedCircle 
                                        style={{ width: '40px', height: '40px', marginRight: '15px' }}
                                    />
                                    <span style={{ flex: 1 }}>{selectedProfile.name || selectedProfile.username}</span>
                                    <Button variant="primary" size="sm" onClick={handleDeselectRecipient}>X</Button>
                                </div>
                            ) : (
                                <Form.Control 
                                    type="text" 
                                    placeholder="Enter username" 
                                    value={searchInput} 
                                    onChange={handleSearchChange}
                                />
                            )}
                        </Form.Group>
        
                        {!selectedProfile && searchInput && (
    <ListGroup>
        {filteredProfiles.map(profile => (
            <ListGroup.Item key={profile.id} className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <Image 
                        src={profile.profile_image} 
                        alt={`${profile.username}'s profile`} 
                        roundedCircle 
                        style={{ width: '30px', height: '30px', marginRight: '10px' }}
                    />
                    <span>{profile.name || profile.username}</span>
                </div>
                <Button 
                    variant="success" 
                    onClick={() => handleSelectRecipient(profile)}
                >
                    Select
                </Button>
            </ListGroup.Item>
        ))}
    </ListGroup>
)}

                    </>
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
                <Button variant="dark" type="submit">Submit</Button>
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