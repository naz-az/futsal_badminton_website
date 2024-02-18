import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function FollowersPage() {
    const [followers, setFollowers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [profileToRemove, setProfileToRemove] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFollowers = async () => {
            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };
            const response = await axios.get('/api/profiles/followers/', config);
            setFollowers(response.data);
        };

        fetchFollowers();
    }, []);

    const removeFollower = async (profileId) => {
        const config = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };
        await axios.post(`/api/profiles/${profileId}/remove_follower/`, {}, config);
        setFollowers(followers.filter(profile => profile.id !== profileId));
    };

    const handleRemoveClick = (profileId) => {
        setProfileToRemove(profileId);
        setShowModal(true);
    };

    const confirmRemoveFollower = () => {
        removeFollower(profileToRemove);
        setShowModal(false);
        setProfileToRemove(null);
    };

    const handleSendMessage = (profileId) => {
        navigate(`/send?recipient=${profileId}`);
    };

    return (
        <Container className="my-4">
            <h2 className="text-center my-4">Followers ({followers.length})</h2>

            {followers.map(profile => (
                <Row key={profile.id} className="mb-3 align-items-center">
                    <Col xs={3} className="d-flex justify-content-center">
                        <Link to={`/profiles/${profile.id}`}>
                            <img src={profile.profile_image} alt="Profile" className="img-fluid" style={{ maxWidth: '60px', maxHeight: '60px', width: '60px', height: '60px', borderRadius: '50%' }} />
                        </Link>
                    </Col>
                    <Col xs={5} className="d-flex flex-column justify-content-center px-1">
                        <Link to={`/profiles/${profile.id}`} className="text-decoration-none text-dark">
                            <strong>{profile.name}</strong>
                        </Link>
                        {/* <p>{profile.short_intro}</p> */}
                    </Col>
                    <Col xs={4} className="d-flex justify-content-end">
                        <Button variant="outline-primary" onClick={() => handleSendMessage(profile.id)} className="mx-1" style={{ padding: '0.375rem 0.5rem' }}>
                            Message
                        </Button>
                        <Button variant="outline-danger" onClick={() => handleRemoveClick(profile.id)} className="mx-1" style={{ padding: '0.375rem 0.5rem' }}>
                            Remove
                        </Button>
                    </Col>
                </Row>
            ))}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Removal</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to remove this follower?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmRemoveFollower}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default FollowersPage;
