import React, { useState, useEffect, useContext, useCallback } from "react";
import { Card, ButtonGroup, Button, Badge, Modal, Container, Row, Col, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import VotingButtons from "./VotingButtons"; // make sure this import path is correct
import axios from "axios";
import AuthContext from "../context/authContext"; // Adjust the path as needed
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom v6
import AttendButton from "./AttendButton";

import moment from "moment";

function HorizontalProject({ project }) {
  const auth = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(false);
  const navigate = useNavigate();


  const [showFullText, setShowFullText] = useState(false);

  const currentUserId = auth.user?.profile?.id || auth.user?.id;
  console.log("user's id in homepage", currentUserId);

  // Modal state
  const [showAttendModal, setShowAttendModal] = useState(false);
  const [attendModalMessage, setAttendModalMessage] = useState("");
  const [showAttendButton, setShowAttendButton] = useState(false);

  // New state for the bookmark modal
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkModalMessage, setBookmarkModalMessage] = useState("");
  const [showViewAllBookmarks, setShowViewAllBookmarks] = useState(false);

  useEffect(() => {
    // Implement logic to check if the project is already favorited
    // This typically involves an API call to your backend
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
      navigate("/login"); // Redirect to login page
    } else {
      // Logic to add to favorites
      axios
        .post(
          `/api/favorites/add/${project.id}/`,
          {},
          {
            // Added slash at the end
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then(() => {
          setIsFavorited(true); // Update state to indicate the event is favorited
          setBookmarkModalMessage("You've bookmarked this event."); // Set modal message
          setShowViewAllBookmarks(true); // Show the 'View All Bookmarks' button in the modal
          setShowBookmarkModal(true); // Show the modal
          setTimeout(() => setShowBookmarkModal(false), 3000); // Automatically hide modal after 3 seconds
        })
        .catch((error) => {
          console.error("Error adding to favorites:", error);
          // Optionally handle errors, e.g., show a different message in the modal
        });
    }
  };

  const handleRemoveFavorite = () => {
    // Logic to remove from favorites
    axios
      .delete(`/api/favorites/remove/${project.id}/`, {
        // Added slash at the end
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        setIsFavorited(false); // Update state to indicate the event is no longer favorited
        setBookmarkModalMessage("You removed this event from bookmarks."); // Set modal message
        setShowViewAllBookmarks(false); // Don't show the 'View All Bookmarks' button in this modal
        setShowBookmarkModal(true); // Show the modal
        setTimeout(() => setShowBookmarkModal(false), 3000); // Automatically hide modal after 3 seconds
      })
      .catch((error) => {
        console.error("Error removing from favorites:", error);
        // Optionally handle errors, e.g., show a different message in the modal
      });
  };

  const formatMomentDate = (dateString) => {
    return dateString
      ? moment.utc(dateString).format("DD/MM/YY, (ddd), hh:mm A") + " UTC+8"
      : "N/A";
  };

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

  const handleModalChange = (show, message, showButton) => {
    console.log("Modal state changing to:", show, message, showButton);
    setShowAttendModal(show);
    setAttendModalMessage(message);
    setShowAttendButton(showButton);
  };

  return (
    <Container fluid className="mb-4">
    <Card className="mb-3 w-100">
        <Modal show={showAttendModal} onHide={() => setShowAttendModal(false)}>
          <Modal.Body>{attendModalMessage}</Modal.Body>
          {showAttendButton && (
            <Modal.Footer>
              <Button variant="primary" onClick={() => navigate("/attending")}>View All Attending Events</Button>
            </Modal.Footer>
          )}
        </Modal>
        <Modal show={showBookmarkModal} onHide={() => setShowBookmarkModal(false)}>
          <Modal.Body>{bookmarkModalMessage}</Modal.Body>
          {showViewAllBookmarks && (
            <Modal.Footer>
              <Button variant="primary" onClick={() => navigate("/favourites")}>View All Bookmarks</Button>
            </Modal.Footer>
          )}
        </Modal>

        <Row noGutters className="align-items-center">
        <Col xs={12} md={3} className="p-2">
          <Link to={`/project/${project.id}`}>
            <Image
              src={project.featured_image}
              fluid
              className="w-100"
              style={{ height: "210px", objectFit: "cover" }}
            />
          </Link>
        </Col>
        <Col xs={12} md={6} className="p-2">
          <h5>
            <Link
              to={`/project/${project.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {project.title}
            </Link>
          </h5>
          <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>
            <Link
              to={
                project.owner.id === currentUserId
                  ? "/user/account"
                  : `/profiles/${project.owner.id}`
              }
              style={{ textDecoration: "none", color: "brown" }}
            >
              <img
                src={project.owner.profile_image} // Use the appropriate property for the image URL
                alt="Profile"
                style={{
                  width: "25px",
                  height: "25px",
                  marginRight: "10px",
                  borderRadius: "50%",
                }} // Adjust the styling as necessary
              />
              {project.owner.name}
            </Link>{" "}
          </p>
          <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>
            <strong>Price:</strong> {project.price}
          </p>

          <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>
            <strong>Start:</strong> {formatMomentDate(project.start_date)}
            <span
              style={{
                fontStyle: "italic",
                color: "orange",
                fontSize: "smaller",
                marginLeft: "10px",
              }}
            >
              (<strong>Event starts in:</strong>{" "}
              {timeUntilStart(project.start_date)})
            </span>
          </p>

          <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>
            <strong>End:</strong> {formatMomentDate(project.end_date)}
            <span
              style={{
                fontStyle: "italic",
                color: "orange",
                fontSize: "smaller",
                marginLeft: "10px",
              }}
            >
              (<strong>Event ends in:</strong> {timeUntilEnd(project.end_date)})
            </span>
          </p>

          <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>
            <strong>Location:</strong> {project.location}
          </p>

          <VotingButtons projectId={project.id} />

          {project.tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/categories?tag_id=${tag.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
              className="mb-2"
            >
              {" "}
              {/* Right and bottom margin for each tag */}
              <Button
                variant="info"
                style={{ fontSize: "12px", padding: "2px 5px" }}
              >
                {tag.name}
              </Button>
            </Link>
          ))}


        </Col>
        <Col xs={12} md={3} className="p-2 text-center text-md-right">
          <div className="d-flex flex-row justify-content-center justify-content-md-end align-items-center">
            {isFavorited ? (
              <Button
                variant="primary"
                onClick={handleRemoveFavorite}
                style={{ marginRight: "10px" }} // Adding a right margin to the "Remove" button

              >
                <i
                  className="fa-solid fa-bookmark"
                  style={{ marginRight: "0.3rem" }}
                ></i>{" "}
                Remove
              </Button>
            ) : (
              <Button
                variant="outline-primary"
                onClick={handleAddFavorite}
                style={{ marginRight: "10px" }} 
              >
                <i
                  className="fa-regular fa-bookmark"
                  style={{ marginRight: "0.3rem" }}
                ></i>{" "}
                Bookmark
              </Button>
            )}

<AttendButton
  projectId={project.id}
  token={localStorage.getItem("token")} // Pass the token from local storage
  onModalChange={handleModalChange}
  className="m-1"
/>

            <Card.Text style={{ fontSize: "16px" }}>
              <Badge bg="dark">{project.brand}</Badge>
            </Card.Text>


          </div>
        </Col>
      </Row>
      </Card>
    </Container>
  );
}

export default HorizontalProject;
