import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../context/authContext";
import { Button, Row, Col, Card, Badge, ButtonGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import VotingButtons from "./VotingButtons";
import AttendButton from "./AttendButton";
import FavoriteButton from "./FavoriteButton";

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

  return (
    <Col key={project.id} sm={12} md={6} lg={4} xl={3}>
      <Card className="mb-4 mt-4" style={{ padding: "5px", width: "105%" }}>
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

          <Card.Text>
            <strong>Start:</strong>{" "}
            {project.start_date
              ? new Date(project.start_date).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })
              : "N/A"}
          </Card.Text>

          <Card.Text>
            <strong>End:</strong>{" "}
            {project.end_date
              ? new Date(project.end_date).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })
              : "N/A"}
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
          <FavoriteButton projectId={project.id} token={localStorage.getItem("token")} />

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
