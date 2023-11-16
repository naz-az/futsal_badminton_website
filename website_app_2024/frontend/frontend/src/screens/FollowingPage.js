import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal } from 'react-bootstrap';
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
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            };
            await axios.post(`/api/profiles/${selectedProfile.id}/unfollow/`, null, config);
            fetchFollowingProfiles(); // Refetch the following list
            setShowConfirmation(false);
        }
    };

    const handleSendMessage = (profileId) => {
        navigate(`/send?recipient=${profileId}`);
    };


    return (
        <div className="my-md">
            <h2>You're following {followingProfiles.length} people</h2>
            {followingProfiles.map(profile => (
                <Card key={profile.id} className="mb-3 d-flex flex-row align-items-center">
                    <div style={{ width: '10%' , marginRight: '20px'}}>
                        <Link to={`/profiles/${profile.id}`}>
                            <Card.Img src={profile.profile_image} style={{ width: '150px', height: '200px', objectFit: 'cover' }}/>
                        </Link>
                    </div>
                    <Card.Body className="d-flex flex-column justify-content-center" style={{ width: '50%' }}>
                        <Card.Title>
                            <Link to={`/profiles/${profile.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {profile.name}
                            </Link>
                        </Card.Title>

                        <Card.Text>
                        {profile.short_intro.slice(0, 60)}
                    </Card.Text>


                    </Card.Body>

                    <Button 
                        variant="secondary" 
                        onClick={() => handleSendMessage(profile.id)} 
                        className="align-self-center mx-1" 
                        style={{ width: '10%' }}>
                        Send Message
                    </Button>

                    <Button 
                        variant="danger" 
                        onClick={() => handleUnfollowClick(profile)} 
                        className="align-self-center mx-4" 
                        style={{ width: '10%' }}>
                        Unfollow
                    </Button>
                </Card>
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
                    <Button variant="primary" onClick={confirmUnfollow}>
                        Yes, Unfollow
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default FollowingPage;
