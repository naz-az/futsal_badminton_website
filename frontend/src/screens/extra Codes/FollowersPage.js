import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Container, Button, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

function FollowersPage() {
    const [followers, setFollowers] = useState([]);
    const [followersCount, setFollowersCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [profileToRemove, setProfileToRemove] = useState(null);
    const navigate = useNavigate(); // Use navigate for redirection

    useEffect(() => {
        const fetchFollowers = async () => {
            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };
            const response = await axios.get('/api/profiles/followers/', config);
            setFollowers(response.data);
            setFollowersCount(response.data.length);
        };

        fetchFollowers();
    }, []);

    const removeFollower = async (profileId) => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };
            await axios.post(`/api/profiles/${profileId}/remove_follower/`, {}, config);
            setFollowers(followers.filter(profile => profile.id !== profileId));
            setFollowersCount(followersCount - 1);
        } catch (error) {
            console.error("Error removing follower", error);
            // Handle error (show error message to user, etc.)
        }
    };

    const handleRemoveClick = (profileId) => {
        setProfileToRemove(profileId);
        setShowModal(true);
    };

    const confirmRemoveFollower = async () => {
        if (profileToRemove) {
            await removeFollower(profileToRemove);
            setShowModal(false);
            setProfileToRemove(null);
        }
    };

    const handleSendMessage = (profileId) => {
        navigate(`/send?recipient=${profileId}`);
    };

    return (
        <Container className="my-md">
                              <h2 style={{ textAlign: 'center',marginTop: '20px',marginBottom: '40px' }}>({followersCount}) Followers</h2>

            {followers.map(profile => (
                <Card key={profile.id} className="mb-3 d-flex flex-row align-items-center">
                    <div style={{ width: '10%', marginRight: '20px' }}>
                        <Link to={`/profiles/${profile.id}`}>
                        <Card.Img src={profile.profile_image} style={{ width: '150px', height: '200px', objectFit: 'cover' }}/>
                        </Link>
                    </div>
                    <Card.Body className="d-flex flex-column justify-content-center" style={{ width: '70%' }}>
                        <Card.Title>
                            <Link to={`/profiles/${profile.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {profile.name}
                            </Link>
                        </Card.Title>

                        <Card.Text>
                        {profile.short_intro?.slice(0, 60) ?? ''}
                    </Card.Text>

                    </Card.Body>
                    <Button 
                        variant="primary" 
                        onClick={() => handleSendMessage(profile.id)} 
                        className="align-self-center mx-1" 
                        style={{ width: '10%' }}>
                        Send Message
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => handleRemoveClick(profile.id)}
                        className="align-self-center mx-4" 
                        style={{ width: '10%' }}>
                        Remove Follower
                    </Button>
                </Card>
            ))}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Removal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to remove this follower?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={confirmRemoveFollower}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default FollowersPage;
