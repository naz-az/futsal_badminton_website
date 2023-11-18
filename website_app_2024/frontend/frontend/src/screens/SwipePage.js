import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Container, Modal, Badge } from "react-bootstrap";
import axios from "axios"; // Import axios for API calls
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import VotingButtons from "../components/VotingButtons"; // The path to your VotingButtons component
import AttendButton from "../components/AttendButton";

function SwipePage() {
  const [projects, setProjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const [isFavorited, setIsFavorited] = useState(false);

  const cardRef = useRef(null); // Reference to the card element
  let dragStartX = 0; // Starting position of the drag

  const [isDragging, setIsDragging] = useState(false);

  const [dragStyle, setDragStyle] = useState({});
  const navigate = useNavigate(); // Initialize navigate

    // Check if user is authenticated
    const isAuthenticated = () => {
      return localStorage.getItem("token") != null;
    };

      // Function to redirect to login if not authenticated
  const redirectToLogin = () => {
    navigate('/login');
  };

  useEffect(() => {
    // Fetch the RANDOM projects from Django backend
    fetch("/api/projects/random/")
      .then((response) => response.json())
      .then((data) => setProjects(data));
  }, []);

  const currentProject = projects[currentIndex] || {};

  const handleDislike = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex + 1 >= projects.length) {
        return 0; // Reset the index to start from the beginning
      } else {
        return prevIndex + 1;
      }
    });
    if (showModal) {
      setShowModal(false); // Close modal if it's open
    }
  };

  const handleLike = () => {
    setShowModal(true);
  };

  // Check if the current project is favorited by the authenticated user
  useEffect(() => {
    async function checkFavoriteStatus() {
      if (isAuthenticated()) { // Check if user is authenticated
        const currentProjectId = currentProject.id;
        if (currentProjectId) {
          try {
            const response = await axios.get(
              `/api/favorites/is-favorite/${currentProjectId}/`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            setIsFavorited(response.data.isFavorited);
          } catch (error) {
            console.error("Error checking favorite status:", error);
          }
        }
      } else {
        setIsFavorited(false); // Set to false or handle as needed for non-authenticated users
      }
    }

    checkFavoriteStatus();
  }, [currentProject]);

  const goToNextProject = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    setShowModal(false); // Close modal
  };

  const handleAddFavorite = async () => {
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }
    const currentProjectId = currentProject.id;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      await axios.post(`/api/favorites/add/${currentProjectId}/`, {}, config);
      setIsFavorited(true);
      goToNextProject(); // Go to next project after adding to favorites
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const handleRemoveFavorite = async () => {
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }
    const currentProjectId = currentProject.id;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      await axios.delete(`/api/favorites/remove/${currentProjectId}/`, config);
      setIsFavorited(false);
      goToNextProject(); // Go to next project after removing from favorites
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const confirmRemoveFavorite = () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this item from your favorites?"
    );
    if (confirmed) {
      handleRemoveFavorite();
    }
  };

  // Helper functions to simulate button clicks
  const simulateAddToFavorites = () => {
    if (!isFavorited) {
      handleAddFavorite();
    }
  };

  const simulateKeepPicking = () => {
    setShowModal(false); // This will act as if the "Keep Picking" button is pressed
  };

  useEffect(() => {
    const handleKeydown = (event) => {
      if (showModal) {
        switch (event.keyCode) {
          case 37: // Left arrow
            simulateKeepPicking();
            break;
          case 39: // Right arrow
            if (isFavorited) {
              confirmRemoveFavorite(); // Simulate clicking "Remove from Favourites"
            } else {
              simulateAddToFavorites();
            }
            break;
          default:
            break;
        }
      } else {
        switch (event.keyCode) {
          case 37: // Left arrow
            handleDislike();
            break;
          case 39: // Right arrow
            handleLike();
            break;
          case 38: // Up arrow
            if (currentProject.deal_link) {
              const url =
                currentProject.deal_link.startsWith("http://") ||
                currentProject.deal_link.startsWith("https://")
                  ? currentProject.deal_link
                  : "http://" + currentProject.deal_link;
              window.open(url, "_blank");
            }
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [showModal, isFavorited, handleDislike, handleLike, currentProject]);


  let dragStartY = 0; // Initialize the variable outside of the function, next to dragStartX

  const handleDragStart = (event) => {
    event.preventDefault();
    dragStartX = event.clientX; // Set the start position X
    dragStartY = event.clientY; // Set the start position Y
    document.addEventListener('mousemove', handleMouseMove); // Listen for mouse move to get continuous drag feedback
    document.addEventListener('mouseup', handleDragEnd); // Listen for the end of the drag
    setIsDragging(true); // Set dragging state to true
  };

  const handleDragEnd = (event) => {
    const dragEndX = event.clientX; // End position of the drag on X axis
    const dragEndY = event.clientY; // End position of the drag on Y axis
    const deltaX = dragEndX - dragStartX; // Calculate the distance dragged on X axis
    const deltaY = dragStartY - dragEndY; // Calculate the distance dragged on Y axis (Note: the Y values are inverted on screens)
  
    if (deltaX > 200) { // Threshold for a 'like' action
      handleLike();
    } else if (deltaX < -200) { // Threshold for a 'dislike' action
      handleDislike();
    } else if (deltaY > 150) { // Threshold for an 'upward' action (go to deal)
      if (currentProject.deal_link) {
        const url = currentProject.deal_link.startsWith("http://") || currentProject.deal_link.startsWith("https://")
          ? currentProject.deal_link
          : "http://" + currentProject.deal_link;
        window.open(url, "_blank");
      }
    }
  
    setIsDragging(false); // Set dragging state to false after drag ends
    document.removeEventListener('mousemove', handleMouseMove); // Remove mouse movement listener
    document.removeEventListener('mouseup', handleDragEnd); // Clean up the event listener
    setDragStyle({}); // Reset the drag style to default
  };
  

  const handleMouseMove = (event) => {
    if (isDragging) {
      const currentX = event.clientX;
      const currentY = event.clientY;
      const deltaX = currentX - dragStartX;
      // Calculate rotation for feedback
      const rotation = deltaX / 10; // This is a simple example, adjust as needed
      
      setDragStyle({
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.1s',
        opacity: 0.7
      });
    }
  };
  
  const [showFullText, setShowFullText] = useState(false);

// Remember to remove the 'mousemove' event listener in `handleDragEnd` as well
// document.removeEventListener('mousemove', handleMouseMove);

  return (
    <Container>
      <h2>Swipe Page</h2>
  
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center", // This makes sure everything is vertically centered
          marginTop: "20px",
        }}
      >
        {/* Dislike Button */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginRight: "50px", // Spacing between the button and the card
          }}
        >
<Button variant="primary" onClick={handleDislike} style={{ fontSize: '30px', padding: '10px 20px' }}>
<i className="fa-solid fa-xmark"></i>
          </Button>
        </div>
  
        {/* Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* {currentProject.deal_link && (
            <Button
              variant="warning"
              style={{ marginBottom: "40px", fontSize: '20px', padding: '10px 20px' }}
              onClick={() => {
                const url =
                  currentProject.deal_link.startsWith("http://") ||
                  currentProject.deal_link.startsWith("https://")
                    ? currentProject.deal_link
                    : "http://" + currentProject.deal_link;
                window.open(url, "_blank");
              }}
            >
              Go to event <i className="fa-solid fa-arrow-up-right-from-square" style={{marginLeft: "8px"}}></i>
            </Button>
          )} */}
  
  <AttendButton projectId={currentProject.id} token={localStorage.getItem("token")} fontSize="22px" />

  <Card
  style={{ ...dragStyle, width: '450px', height: '900px',cursor: isDragging ? 'grabbing' : 'grab', marginTop:"30px" }} // Apply dynamic styles for dragging
  onMouseDown={handleDragStart} // Update the mouse down handler
  onDoubleClick={isFavorited ? confirmRemoveFavorite : handleAddFavorite}
>
  <Link to={`/project/${currentProject.id}/`} style={{ textDecoration: 'none', color: 'black' }}>
    <Card.Img
      variant="top"
      src={currentProject.featured_image}
      alt="project thumbnail"
      style={{ ...dragStyle, width: '100%', height: "450px", objectFit: "cover", cursor: 'grab', opacity: isDragging ? 0.7 : 1, transition: 'opacity 0.2s ease-in-out' }} 
      onMouseDown={handleDragStart} // Add the mouse down event handler only to the image
      draggable="false" // This prevents the default browser image dragging
    />
      </Link>

    <Card.Body onMouseDown={handleDragStart} style={{ cursor: 'grab', minHeight: "300px" }}>
      <Card.Title style={{ fontSize: "30px", marginBottom:"15px" }}>
        {currentProject.title}
      </Card.Title>
      <Card.Text style={{ marginBottom:"20px", fontSize: "18px" }}>
  {currentProject.owner && (
    <img 
      src={currentProject.owner.profile_image} // This will only be attempted if currentProject.owner is not undefined
      alt="Profile"
      style={{ width: '35px', height: '35px', marginRight: '10px', borderRadius: '50%' }}
    />
  )}
  {currentProject.owner && currentProject.owner.name
    ? `${currentProject.owner.name}`
    : ""}
</Card.Text>

<Card.Text style={{ fontSize: "22px" }}>
                    <i
                      className="fas fa-thumbs-up mr-1"
                      style={{ color: "green", fontSize: "22px", marginRight:"3px" }}></i>{" "}
                    {/* Green Thumbs up icon */}
                    {currentProject.upvotes}
                  </Card.Text>

<Card.Text className="my-3" style={{ fontSize: "22px" }}>
                      RM {currentProject.price}
                    </Card.Text>

  
                    <Card.Text>
  <strong>Start:</strong> {currentProject.start_date ? new Date(currentProject.start_date).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : 'N/A'}
</Card.Text>

<Card.Text>
  <strong>End:</strong> {currentProject.end_date ? new Date(currentProject.end_date).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : 'N/A'}
</Card.Text>

<Card.Text>
  <strong>Location:</strong> {currentProject.location ? 
      (showFullText ? currentProject.location : `${currentProject.location.split(' ').slice(0, 8).join(' ')}...`) 
      : 'Location not available'}
  <Button variant="link" onClick={() => setShowFullText(!showFullText)}>
    {showFullText ? 'Show Less' : 'Show More'}
  </Button>
</Card.Text>



                <div>
                  {currentProject.tags &&
                    currentProject.tags.map((tag, index) => (
                      <Button variant="danger" className="me-2" style={{ fontSize: "12px", padding: "5px 10px" }}>
                      {tag.name}
                    </Button>
                    ))}
                </div>
                {/* <Card.Text style={{ fontSize: '16px', marginTop: '10px' }}>
                    <Badge bg="dark">{currentProject.brand}</Badge>
                </Card.Text> */}

                </Card.Body>
</Card>
        </div>
  
        {/* Like Button */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginLeft: "50px", // Spacing between the card and the button
          }}
        >
          <Button variant="success" onClick={handleLike} style={{ fontSize: '30px', padding: '10px 20px' }}>
            <i className="fa-regular fa-heart"></i>
          </Button>
        </div>
      </div>
      
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Pick an action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isFavorited ? (
            <p>
              You have added this item to your favourites list. Would you like
              to remove this project from your favourites or continue browsing
              other projects?
            </p>
          ) : (
            <p>
              Would you like to add this project to your favourites or continue
              browsing other projects?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDislike}>
            Keep Picking
          </Button>
          {isFavorited ? (
            <Button variant="danger" onClick={confirmRemoveFavorite}>
              Remove from Favourites
            </Button>
          ) : (
            <Button variant="primary" onClick={handleAddFavorite}>
              Add to Favourites
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
  
}

export default SwipePage;