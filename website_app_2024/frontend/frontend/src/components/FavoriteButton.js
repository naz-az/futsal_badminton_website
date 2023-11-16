import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function FavoriteButton({ projectId, token }) {
    const [isFavorited, setIsFavorited] = useState(false);
    const navigate = useNavigate(); // Initialize navigate

    // Function to check if user is authenticated
    const isAuthenticated = () => {
        return token != null;
    };

    // Function to redirect to login if not authenticated
    const redirectToLogin = () => {
        navigate('/login');
    };

    useEffect(() => {
        if (token) {
            axios.get(`/api/favorites/is-favorite/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => setIsFavorited(response.data.isFavorited))
            .catch(error => console.error("Error checking favorite status:", error));
        }
    }, [projectId, token]);

    const handleFavorite = () => {
        if (!isAuthenticated()) {
            redirectToLogin();
            return;
        }

        const url = isFavorited ? `/api/favorites/remove/${projectId}/` : `/api/favorites/add/${projectId}/`;
        const method = isFavorited ? 'delete' : 'post';

        axios({ method, url, headers: { Authorization: `Bearer ${token}` } })
        .then(() => setIsFavorited(!isFavorited))
        .catch(error => console.error(`Error ${isFavorited ? 'removing from' : 'adding to'} favorites:`, error));
    };

    return (
        <div>
            {isFavorited ? (
                <Button variant="danger" onClick={handleFavorite}>
                    Remove Favourite <i className="fa-solid fa-heart-crack" style={{ marginLeft: "5px" }}></i>
                </Button>
            ) : (
                <Button variant="outline-danger" onClick={handleFavorite}>
                    Add Favourite <i className="fa-regular fa-heart" style={{ marginLeft: "5px" }}></i>
                </Button>
            )}
        </div>
    );
}

export default FavoriteButton;
