import React, { useState, useEffect, useContext, useCallback } from "react";
import { Card, Badge, ButtonGroup, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from 'axios';
import SearchBox from "./SearchBox";
import VotingButtons from "./VotingButtons"; // make sure this import path is correct
import AuthContext from '../context/authContext'; // Adjust the path as needed
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom v6
import AttendButton from "./AttendButton";

import moment from 'moment';


function Project({ project }) {
  const auth = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(false);
  const navigate = useNavigate();

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
  
  const formatMomentDate = (dateString) => {
    return dateString 
      ? moment.utc(dateString).format("DD/MM/YY, (ddd), hh:mm A") + " UTC+8" 
      : "N/A";
  };
  return (
<Card className="mb-4" style={{ padding: "5px" }}>
      <Link to={`/project/${project.id}`}>
        <Card.Img
          variant="top"
          src={project.featured_image}
          alt="project thumbnail"
          className="project-thumbnail"
          style={{ width: '100%', height: '250px', objectFit: 'cover', margin: 0 }}
          />
      </Link>

      <Card.Body style={{ minHeight: '400px', overflow: 'auto' }}> {/* Adjust min-height as needed */}
        <Card.Title>
          <Link
            to={`/project/${project.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
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

        {/* Integrate VotingButtons component */}
        <VotingButtons projectId={project.id} />

        {/* 
  <Card.Text>
      <i className="fas fa-thumbs-up mr-1" style={{ color: 'green' }}></i>
      <strong>{project.upvotes}</strong>
  </Card.Text>
  */}

        <Card.Text style={{ fontSize: "22px", marginTop: "20px" }}>RM {project.price}</Card.Text>

        <Card.Text>
  <strong>Start:</strong> {formatMomentDate(project.start_date)}
</Card.Text>

<Card.Text>
  <strong>End:</strong> {formatMomentDate(project.end_date)}
</Card.Text>

        <Card.Text>
  <strong>Location:</strong> {showFullText ? project.location : `${project.location.split(' ').slice(0, 8).join(' ')}...`}
  <Button variant="link" onClick={() => setShowFullText(!showFullText)}>
    {showFullText ? 'Show Less' : 'Show More'}
  </Button>
</Card.Text>






        {
  /* <div style={{ marginBottom: "10px" }}>
    <Button
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
    </Button>
  </div> */
}



        <AttendButton projectId={project.id} token={localStorage.getItem("token")} />




{/* <Card.Text style={{ fontSize: '16px', marginTop: "10px" }}>
                    <Badge bg="dark">{project.brand}</Badge>
                </Card.Text> */}

<div style={{ marginTop: "15px" }}> 
  {isFavorited ? (
    <Button variant="info" onClick={handleRemoveFavorite}>
                        <i className="fa-solid fa-bookmark" style={{ marginRight: '0.3rem' }}></i> Remove bookmark
    </Button>
  ) : (
    <Button variant="outline-info" onClick={handleAddFavorite}>
                        <i className="fa-regular fa-bookmark" style={{ marginRight: '0.3rem' }}></i> Bookmark
    </Button>
  )}
</div>


<ButtonGroup style={{ marginTop: "15px" }}> {/* Add bottom margin to ButtonGroup */}
  {project.tags.map((tag) => (
    <Link key={tag.id} to={`/categories?tag_id=${tag.id}`}>
      <Button
        variant="danger"
        className="mr-2"
        style={{
          fontSize: "12px",
          padding: "2px 5px",
          marginRight: "6px", // Add or adjust margin as required
        }}
      >
        {tag.name}
      </Button>
    </Link>
  ))}
</ButtonGroup>

      </Card.Body>
    </Card>
  );
}

export default Project;