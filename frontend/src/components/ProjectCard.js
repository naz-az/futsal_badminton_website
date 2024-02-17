import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../context/authContext";
import { Button, Row, Col, Card, Badge, ButtonGroup, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import VotingButtons from "./VotingButtons";
import AttendButton from "./AttendButton";
import FavoriteButton from "./FavoriteButton";

import moment from 'moment';

function ProjectCard({ project, auth, navigate }) {
  const [isFavorited, setIsFavorited] = useState(false);

  // Retrieve the current user's ID from the AuthContext
  const currentUserId = auth.user?.profile?.id;

  // Determine the profile link path
  const profileLinkPath =
    currentUserId === project.owner.id
      ? "/user/account"
      : `/profiles/${project.owner.id}`;

  const [showFullText, setShowFullText] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      axios
        .get(`/api/favorites/is-favorite/${project.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => setIsFavorited(response.data.isFavorited))
        .catch((error) =>
          console.error("Error checking favorite status:", error)
        );
    }
  }, [project.id, auth.isAuthenticated]);

  const handleAddFavorite = () => {
    if (!auth.isAuthenticated) {
      navigate("/login");
    } else {
      axios
        .post(
          `/api/favorites/add/${project.id}/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then(() => setIsFavorited(true))
        .catch((error) => console.error("Error adding to favorites:", error));
    }
  };

  const handleRemoveFavorite = () => {
    axios
      .delete(`/api/favorites/remove/${project.id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => setIsFavorited(false))
      .catch((error) => console.error("Error removing from favorites:", error));
  };

  const formatMomentDate = (dateString) => {
    return dateString 
      ? moment.utc(dateString).format("DD/MM/YY, (ddd), hh:mm A") + " UTC+8" 
      : "N/A";
  };
  
  // const calculateTimeRemaining = (startDate, endDate) => {
  //   const now = moment();
  //   const start = moment.utc(startDate);
  //   const end = moment.utc(endDate);
  
  //   if (now.isBefore(start)) {
  //     // Calculate difference from now to start date
  //     const duration = moment.duration(start.diff(now));
  //     return `${duration.days()}d:${duration.hours()}h:${duration.minutes()}m`;
  //   } else if (now.isBetween(start, end)) {
  //     // Calculate difference from now to end date
  //     const duration = moment.duration(end.diff(now));
  //     return `${duration.days()}d:${duration.hours()}h:${duration.minutes()}m`;
  //   } else {
  //     return "Event ended";
  //   }
  // };
  
  const timeUntilStart = (startDate) => {
    const now = moment();
    const start = moment.utc(startDate);
  
    if (now.isBefore(start)) {
      // Calculate difference from now to start date
      const duration = moment.duration(start.diff(now));
      return `${duration.days()}d:${duration.hours()}h:${duration.minutes()}m`;
    } 
    return "Event has started";
  };

  const timeUntilEnd = (endDate) => {
    const now = moment();
    const end = moment.utc(endDate);
  
    if (now.isBefore(end)) {
      // Calculate difference from now to end date
      const duration = moment.duration(end.diff(now));
      return `${duration.days()}d:${duration.hours()}h:${duration.minutes()}m`;
    }
    return "Event ended";
  };
  
        // Modal state
        const [showAttendModal, setShowAttendModal] = useState(false);
        const [attendModalMessage, setAttendModalMessage] = useState('');
        const [showAttendButton, setShowAttendButton] = useState(false);
      
        // Method to update modal state
        const handleModalChange = (show, message, showButton) => {
          setShowAttendModal(show);
          setAttendModalMessage(message);
          setShowAttendButton(showButton);
        };


            // State for the favorite modal
            const [showFavoriteModal, setShowFavoriteModal] = useState(false);
            const [favoriteModalMessage, setFavoriteModalMessage] = useState('');
            const [showFavoriteButton, setShowFavoriteButton] = useState(false); // New state for button visibility
            
            
    // Function to handle favorite modal
    const handleFavoriteModal = (isAdded) => {
      const message = isAdded ? "You've bookmarked this event" : "You removed this event from bookmarks";
      setFavoriteModalMessage(message);
      setShowFavoriteModal(true);
      setShowFavoriteButton(isAdded); // Show button only if bookmark is added
      setTimeout(() => setShowFavoriteModal(false), 3000); // Hide modal after 3 seconds
    };


  return (
    <Col key={project.id} sm={12} md={6} lg={4} xl={3}>

                              {/* Modal component */}
                              <Modal show={showAttendModal} onHide={() => setShowAttendModal(false)}>
          <Modal.Body>{attendModalMessage}</Modal.Body>
          {showAttendButton && (
            <Modal.Footer>
              <Button variant="primary" onClick={() => navigate('/attending')}>
                View All Attending Events
              </Button>
            </Modal.Footer>
          )}
        </Modal>

  {/* Favorite Modal */}
  <Modal show={showFavoriteModal} onHide={() => setShowFavoriteModal(false)}>
      <Modal.Body>{favoriteModalMessage}</Modal.Body>
      {showFavoriteButton && (
        <Modal.Footer>
          <Button variant="primary" onClick={() => navigate('/favourites')}>
            View All Bookmarks
          </Button>
        </Modal.Footer>
      )}
  </Modal>

      <Card className="mb-4 mt-4" style={{ padding: "5px", width: "100%" }}>
        <Link to={`/project/${project.id}`} style={{ textDecoration: "none" }}>
          <Card.Img
            variant="top"
            src={project.featured_image}
            alt={project.title}
            style={{
              width: "100%",
              height: "250px",
              objectFit: "cover",
              margin: 0,
            }}
          />
        </Link>
        <Card.Body style={{ minHeight: "250px", overflow: "auto" }}>
          <Link
            to={`/project/${project.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Card.Title>{project.title}</Card.Title>
          </Link>
          <Card.Text>
            <Link
              to={profileLinkPath}
              style={{ textDecoration: "none", color: "brown" }}
            >
              <img
                src={project.owner.profile_image}
                alt="Profile"
                style={{
                  width: "30px",
                  height: "30px",
                  marginRight: "10px",
                  borderRadius: "50%",
                }}
              />
              {project.owner.name}
            </Link>
          </Card.Text>
          <VotingButtons projectId={project.id} />

          <Card.Text style={{ fontSize: "22px", marginTop: "20px" }}>
            RM {project.price}
          </Card.Text>

          {/* <Card.Text>
  <strong>Event starts in:</strong> {calculateTimeRemaining(project.start_date, project.end_date)}
</Card.Text> */}


<Card.Text>
  <strong>Start:</strong>{" "}
  {formatMomentDate(project.start_date)}
  <span style={{ fontStyle: "italic", color: "orange", fontSize: "smaller" , marginLeft: "10px"}}>
    (<strong>Event starts in:</strong> {timeUntilStart(project.start_date)})
  </span>
</Card.Text>

<Card.Text>
  <strong>End:</strong>{" "}
  {formatMomentDate(project.end_date)}
  <span style={{ fontStyle: "italic", color: "orange", fontSize: "smaller" , marginLeft: "10px"}}>
    (<strong>Event ends in:</strong> {timeUntilEnd(project.end_date)})
  </span>
</Card.Text>


          <Card.Text>
            <strong>Location:</strong>{" "}
            {showFullText
              ? project.location
              : `${project.location.split(" ").slice(0, 8).join(" ")}...`}
            <Button
              variant="link"
              onClick={() => setShowFullText(!showFullText)}
            >
              {showFullText ? "Show Less" : "Show More"}
            </Button>
          </Card.Text>

          <AttendButton
            projectId={project.id}
            token={localStorage.getItem("token")}
            onModalChange={handleModalChange}
          />

          <div style={{ marginBottom: "10px" }}>
            {/* <Button variant="warning" onClick={() => {
                const url = project.deal_link.startsWith("http://") || project.deal_link.startsWith("https://") ? project.deal_link : "http://" + project.deal_link;
                window.open(url, "_blank");
              }}>
                Go to deal <i className="fa-solid fa-up-right-from-square" style={{ marginLeft: '8px' }}></i>
              </Button> */}
          </div>

          {/* <Card.Text style={{ fontSize: '16px', marginTop: "10px" }}>
              <Badge bg="dark">{project.brand}</Badge>
            </Card.Text> */}
          <div style={{ marginTop: "15px" }}>
          <FavoriteButton projectId={project.id} token={localStorage.getItem("token")} onFavoriteChange={handleFavoriteModal}/>

          </div>

          <ButtonGroup style={{ marginTop: "15px" }}>
            {" "}
            {/* Add bottom margin to ButtonGroup */}
            {project.tags.map((tag) => (
              <Link key={tag.id} to={`/categories?tag_id=${tag.id}`}>
                <Button
                  variant="danger"
                  className="mr-2"
                  style={{
                    fontSize: "12px",
                    padding: "2px 5px",
                    marginRight: "6px",
                  }}
                >
                  {tag.name}
                </Button>
              </Link>
            ))}
          </ButtonGroup>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default ProjectCard;
