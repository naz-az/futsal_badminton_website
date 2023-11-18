import React, { useState, useEffect, useContext, useCallback } from "react";
import { Card, ButtonGroup, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import VotingButtons from './VotingButtons'; // make sure this import path is correct
import axios from 'axios';
import AuthContext from '../context/authContext'; // Adjust the path as needed
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom v6
import AttendButton from "./AttendButton";

function HorizontalProject({ project }) {

    const auth = useContext(AuthContext);
    const [isFavorited, setIsFavorited] = useState(false);
    const navigate = useNavigate();
  
    // Determine if the current user is the owner of the project
    const isCurrentUserOwner = auth.user && auth.user.profile.id === project.owner.id;

    const [showFullText, setShowFullText] = useState(false);


    useEffect(() => {
      // Implement logic to check if the project is already favorited
      // This typically involves an API call to your backend
      if (auth.isAuthenticated) {
        axios.get(`/api/favorites/is-favorite/${project.id}`, { 
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
          .then(response => setIsFavorited(response.data.isFavorited))
          .catch(error => console.error("Error checking favorite status:", error));
      }
    }, [project.id, auth.isAuthenticated]);
    
    const handleAddFavorite = () => {
      if (!auth.isAuthenticated) {
        navigate('/login'); // Redirect to login page
      } else {
        // Logic to add to favorites
        axios.post(`/api/favorites/add/${project.id}/`, {}, { // Added slash at the end
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
          .then(() => setIsFavorited(true))
          .catch(error => console.error("Error adding to favorites:", error));
      }
    };
    
    const handleRemoveFavorite = () => {
      // Logic to remove from favorites
      axios.delete(`/api/favorites/remove/${project.id}/`, { // Added slash at the end
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
        .then(() => setIsFavorited(false))
        .catch(error => console.error("Error removing from favorites:", error));
    };
  
    
    return (
        <Card className="mb-4 d-flex flex-row" style={{ height: '380px', overflow: 'hidden', padding: '5px 5px' }}> {/* Removed all padding from the Card */}
            {/* Image Section */}
            <div style={{ width: '30%', height: '100%', marginRight: '20px', padding: '0' }}> {/* Removed all margin and padding */}
                <Link to={`/project/${project.id}`}>
                    <Card.Img 
                        src={project.featured_image} 
                        alt={project.title + " image"} 
                        style={{ height: '100%', width: '100%', objectFit: 'cover' }} // Ensure no margin
                    />
                </Link>
            </div>

            {/* Title and Owner Name Section */}
            <div style={{ width: '55%', marginRight: '30px'}} className="d-flex flex-column justify-content-between p-2 text-start mt-3 mb-3"> {/* Apply horizontal padding only */}
                <Card.Title>
                    <Link to={`/project/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {project.title}
                    </Link>
                </Card.Title>

                <Card.Text>
          <Link
          to={isCurrentUserOwner ? '/user/account' : `/profiles/${project.owner.id}`}
          style={{ textDecoration: "none", color: "brown" }}
          >
            <img 
              src={project.owner.profile_image} // Use the appropriate property for the image URL
              alt="Profile"
              style={{ width: '30px', height: '30px', marginRight: '10px', borderRadius: '50%' }} // Adjust the styling as necessary
            />
            {project.owner.name}
          </Link>
        </Card.Text>
                <Card.Text style={{ fontSize: '22px' }}>RM {project.price}</Card.Text>

                <Card.Text>
  <strong>Start:</strong> {project.start_date ? new Date(project.start_date).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : 'N/A'}
</Card.Text>

<Card.Text>
  <strong>End:</strong> {project.end_date ? new Date(project.end_date).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : 'N/A'}
</Card.Text>

        <Card.Text>
  <strong>Location:</strong> {showFullText ? project.location : `${project.location.split(' ').slice(0, 8).join(' ')}...`}
  <Button variant="link" onClick={() => setShowFullText(!showFullText)}>
    {showFullText ? 'Show Less' : 'Show More'}
  </Button>
</Card.Text>

                {/* Integrate VotingButtons component */}
                <VotingButtons projectId={project.id} />
            </div>

            {/* Upvotes, Price, and Tags Section */}
            <div style={{ width: '25%', padding: '0 10px' }} className="d-flex flex-column justify-content-center p-2"> {/* Apply horizontal padding only */}

  <div style={{ marginTop: '0px' }} className="mb-2 text-start"> {/* Adding margin here */}
                    {/* <Button
                        variant="warning"
                        onClick={() => {
                            const url =
                                project.deal_link.startsWith("http://") ||
                                project.deal_link.startsWith("https://")
                                ? project.deal_link
                                : "http://" + project.deal_link;
                            window.open(url, "_blank");
                        }}
                    >
                       Go to deal <i className="fa-solid fa-up-right-from-square" style={{ marginLeft: '8px' }}></i>

                    </Button> */}

<AttendButton projectId={project.id} token={localStorage.getItem("token")} style={{ marginRight: '1rem' }} />

{isFavorited ? (
    <Button variant="danger" onClick={handleRemoveFavorite} style={{ marginTop: '1rem' }}>
        <i className="fa-solid fa-bookmark" style={{ marginRight: '0.3rem' }}></i> Remove bookmark
    </Button>
) : (
    <Button variant="outline-danger" onClick={handleAddFavorite} style={{ marginTop: '1rem' }}>
        <i className="fa-regular fa-bookmark" style={{ marginRight: '0.3rem' }}></i> Bookmark
    </Button>
)}

         <br></br>       

                <ButtonGroup>
                    {project.tags.map(tag => (
                        <Link key={tag.id} to={`/categories?tag_id=${tag.id}`}>
                            <Button 
                                variant="primary" 
                                className="mr-2" 
                                style={{ 
                                    fontSize: '12px', 
                                    padding: '2px 5px', 
                                    marginRight: '6px',
                                    marginTop: '20px' ,
                                    marginBottom: '20px' 

                                }}
                            >
                                {tag.name}
                            </Button>
                        </Link>
                    ))}
                </ButtonGroup>

                <Card.Text style={{ fontSize: '16px' }}>
                    <Badge bg="dark">{project.brand}</Badge>
                </Card.Text>


                </div>
            </div>
        </Card>
    );
}

export default HorizontalProject;
