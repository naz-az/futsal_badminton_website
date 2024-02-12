import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function FavoriteButton({ projectId, token, onFavoriteChange  }) {
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
        .then(() => {
            setIsFavorited(!isFavorited);
            onFavoriteChange(!isFavorited); // Pass boolean indicating if bookmark was added
        })
        .catch(error => console.error(`Error ${isFavorited ? 'removing from' : 'adding to'} favorites:`, error));
    };
    

    return (
        <div>
  {isFavorited ? (
    <Button variant="info" onClick={handleFavorite}>
                        <i className="fa-solid fa-bookmark" style={{ marginRight: '0.3rem' }}></i> Remove bookmark
    </Button>
  ) : (
    <Button variant="outline-info" onClick={handleFavorite}>
                        <i className="fa-regular fa-bookmark" style={{ marginRight: '0.3rem' }}></i> Bookmark
    </Button>
  )}
        </div>
    );
}

export default FavoriteButton;
