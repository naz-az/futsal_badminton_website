import React, { useState, useEffect } from 'react';
import { Card, Image, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import { useParams } from "react-router-dom";

function Profile({ profile, currentUserId, isCurrentUser  }) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isUserBlocked, setIsUserBlocked] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate(); // Initialize useNavigate

    // Authorization headers for axios requests
    const authHeaders = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };

        // Function to check if user is authenticated
        const isAuthenticated = () => {
            return localStorage.getItem("token") != null;
        };
    
        // Function to redirect to login if not authenticated
        const redirectToLogin = () => {
            navigate('/login');
        };

    // Check if the current user is following the profile
    useEffect(() => {
        if (isAuthenticated()) {
            const checkFollowingStatus = async () => {
                try {
                    const response = await axios.get(`/api/profiles/${profile.id}/is_following/`, authHeaders);
                    setIsFollowing(response.data.is_following);
                } catch (error) {
                    console.error("Error fetching following status:", error);
                }
            };
            checkFollowingStatus();
        }
    }, [profile.id]);

    // Check if the user is blocked
    useEffect(() => {
        if (isAuthenticated() && profile && profile.id) {
            const checkIfBlocked = async () => {
                try {
                    const response = await axios.get(`/api/profiles/${profile.id}/is_blocked/`, authHeaders);
                    setIsUserBlocked(response.data.is_blocked);
                } catch (error) {
                    console.error("Error checking if user is blocked:", error);
                }
            };
            checkIfBlocked();
        }
    }, [profile]);

    // Event handlers for follow and unfollow actions
    const handleFollow = async () => {
        if (!isAuthenticated()) {
            redirectToLogin();
            return;
        }
        try {
            await axios.post(`/api/profiles/${profile.id}/follow/`, {}, authHeaders);
            setIsFollowing(true);
        } catch (error) {
            console.error("Error following the user:", error);
        }
    };

    const handleUnfollow = async () => {
        if (!isAuthenticated()) {
            redirectToLogin();
            return;
        }
        try {
            await axios.post(`/api/profiles/${profile.id}/unfollow/`, {}, authHeaders);
            setIsFollowing(false);
        } catch (error) {
            console.error("Error unfollowing the user:", error);
        }
    };

        // Add a check to determine if the profile belongs to the current user
        const isCurrentUserProfile = profile.id === currentUserId;

        return (
            <Card className="mb-4 shadow-sm h-100"> {/* Improved design with shadow and height */}
                <Card.Body>
                    <Row className="align-items-center">
                        <Col xs={4} md={3}>
                            <Link to={isCurrentUser ? "/user/account" : `/profiles/${profile.id}`}>
                                <Image 
                                    src={profile.profile_image} 
                                    alt="Profile" 
                                    roundedCircle 
                                    className="img-fluid" // Responsive image
                                    style={{ width: '80px', height: '80px' }} // Adjust size as needed
                                />
                            </Link>
                        </Col>
                        <Col xs={8} md={9}>
                            <Card.Title>
                                <Link to={isCurrentUser ? "/user/account" : `/profiles/${profile.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {profile.name}
                                </Link>
                            </Card.Title>
                            <Card.Text>{profile.short_intro}</Card.Text>
                            {/* Follow/Unfollow button logic... */}
                            {!isCurrentUser && !isUserBlocked && (
                                isFollowing ? (
                                    <Button variant="outline-primary" size="sm" onClick={handleUnfollow}>Unfollow</Button>
                                ) : (
                                    <Button variant="warning" size="sm" onClick={handleFollow}>Follow</Button>
                                )
                            )}
                        </Col>
                    </Row>
                </Card.Body>
                <Card.Footer>
                    <small className="text-muted">{profile.bio?.split(" ").slice(0, 30).join(" ")}</small>
                </Card.Footer>
            </Card>
        );
    }
    
    export default Profile;