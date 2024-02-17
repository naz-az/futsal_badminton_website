import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function FollowingPage() {
    const [followingProfiles, setFollowingProfiles] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFollowingProfiles();
    }, []);

    const fetchFollowingProfiles = async () => {
        const config = {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        };
        const response = await axios.get('/api/profiles/following/', config);
        setFollowingProfiles(response.data);
    };

    const handleUnfollowClick = (profile) => {
        setSelectedProfile(profile);
        setShowConfirmation(true);
    };

    const confirmUnfollow = async () => {
        if (selectedProfile) {
            const config = {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            };
            await axios.post(`/api/profiles/${selectedProfile.id}/unfollow/`, null, config);
            fetchFollowingProfiles();
            setShowConfirmation(false);
        }
    };

    const handleSendMessage = (profileId) => {
        navigate(`/send?recipient=${profileId}`);
    };

    return (
        <Container className="my-4">
            <h2 className="text-center my-4">Following ({followingProfiles.length})</h2>
            {followingProfiles.map(profile => (
                <Row key={profile.id} className="mb-3 align-items-center">
                    <Col xs={3} className="d-flex justify-content-center">
                        <Link to={`/profiles/${profile.id}`}>
                            {/* Ensure width and height are equal for a perfect circle */}
                            <img src={profile.profile_image} alt="Profile" className="img-fluid" style={{ maxWidth: '60px', maxHeight: '60px', width: '60px', height: '60px', borderRadius: '50%' }}/>
                        </Link>
                    </Col>
                    <Col xs={5} className="d-flex flex-column justify-content-center px-1">
                        <Link to={`/profiles/${profile.id}`} className="text-decoration-none text-dark">
                            <strong>{profile.name}</strong>
                        </Link>
                        <p className="d-none d-md-block">{profile.short_intro}</p> {/* Hide on xs to save space */}
                    </Col>
                    <Col xs={4} className="d-flex justify-content-end">
                        <Button 
                            variant="outline-primary" 
                            onClick={() => handleSendMessage(profile.id)} 
                            className="mx-1" style={{ padding: '0.375rem 0.5rem' }}>
                            Message
                        </Button>
                        <Button 
                            variant="outline-danger" 
                            onClick={() => handleUnfollowClick(profile)} 
                            className="mx-1" style={{ padding: '0.375rem 0.5rem' }}>
                            Unfollow
                        </Button>
                    </Col>
                </Row>
            ))}

            {/* Confirmation Modal */}
            <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Unfollow</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to unfollow {selectedProfile?.name}?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={confirmUnfollow}>
                        Yes, Unfollow
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default FollowingPage;
