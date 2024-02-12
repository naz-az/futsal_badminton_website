import React, { useState, useEffect } from 'react';
import { Card, Image, Button } from 'react-bootstrap';
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
        <Card className="mb-4">
 <Card.Body style={{ display: 'flex', alignItems: 'center' }}>
                {/* Redirect to user/account if it's the current user's profile */}
                {
                    isCurrentUser ? (
                        <Link to="/user/account">
                            <Image 
                                src={profile.profile_image} 
                                alt="Profile image" 
                                roundedCircle
                                style={{ width: '80px', height: '80px', marginRight: '10px' }}
                            />
                        </Link>
                    ) : (
                        <Link to={`/profiles/${profile.id}`}>
                            <Image 
                                src={profile.profile_image} 
                                alt="Profile image" 
                                roundedCircle
                                style={{ width: '80px', height: '80px', marginRight: '10px' }}
                            />
                        </Link>
                    )
                }
                <div>
                    <Card.Title>
                        {
                            isCurrentUser ? (
                                <Link to="/user/account" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {profile.name}
                                </Link>
                            ) : (
                                <Link to={`/profiles/${profile.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {profile.name}
                                </Link>
                            )
                        }
                    </Card.Title>
                    <Card.Text>
                        {profile.short_intro?.slice(0, 60) ?? ''}
                    </Card.Text>

                    {/* Conditionally render follow/unfollow button */}
                    {
                    !isCurrentUserProfile && !isUserBlocked && (
                        isFollowing ? (
                                <Button variant="outline-info" size="sm" onClick={handleUnfollow}>Unfollow</Button>
                            ) : (
                                <Button variant="info" size="sm" onClick={handleFollow}>Follow</Button>
                            )
                        )
                    }
                </div>
            </Card.Body>
            <Card.Text style={{ marginLeft: '10px', marginBottom: '30px' }}>
            {profile.bio?.split(" ").slice(0, 30).join(" ") ?? ''}
            </Card.Text>
        </Card>
    );
}

export default Profile;
