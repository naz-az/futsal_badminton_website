import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ButtonGroup,
  Modal,
  DropdownButton,
  Dropdown,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom"; // Don't forget to import Link to handle navigation
import { useNavigate } from "react-router-dom";
import VotingButtons from "../components/VotingButtons";
import FavoriteButton from "../components/FavoriteButton";
import AttendButton from "../components/AttendButton";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faYoutube,
  faFacebook,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import moment from "moment";

function UserAccount() {
  const [accountData, setAccountData] = useState({
    profile: {},
    projects: [],
  });

  const [projects, setProjects] = useState([]); // <-- Add this

  const [displayedProjects, setDisplayedProjects] = useState(6); // New state for managing displayed projects
  const [sortType, setSortType] = useState("newest"); // New state to track sorting

  const showMoreProjects = () => {
    setDisplayedProjects((prev) => prev + 6);
  };

  const showLessProjects = () => {
    setDisplayedProjects((prev) => (prev - 6 >= 6 ? prev - 6 : 6));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/user/account/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAccountData(response.data);
        sortProjects("newest");
      } catch (error) {
        console.error("Error fetching user account data", error);
      }
    };

    const fetchProjects = async () => {
      const id = accountData.profile.id; // Make sure this is correct based on your state structure

      const response = await axios.get(`/api/profiles/${id}/projects/`);
      setProjects(response.data);
    };

    fetchData();
    // You should only call fetchProjects if the id is available
    if (accountData.profile.id) {
      fetchProjects();
    }
  }, [accountData.profile.id]);

  const navigate = useNavigate();

  const editProject = (projectId) => {
    navigate(`/edit-project/${projectId}`);
  };

  const deleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(`/api/projects/${projectId}/delete/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Something went wrong");
        }

        // Remove the project from the accountData state
        setAccountData((prevState) => ({
          ...prevState,
          projects: prevState.projects.filter(
            (project) => project.id !== projectId
          ),
        }));

        console.log("Project deleted successfully");
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const sortProjects = (type, order) => {
    setSortType(type);

    setAccountData((prevState) => {
      let sortedProjects = [...prevState.projects];
      if (type === "top") {
        sortedProjects.sort((a, b) =>
          order === "topToLow" ? b.upvotes - a.upvotes : a.upvotes - b.upvotes
        );
      } else if (type === "price") {
        sortedProjects.sort((a, b) =>
          order === "highToLow" ? b.price - a.price : a.price - b.price
        );
      } else {
        // 'date' or any other type
        sortedProjects.sort((a, b) => {
          return order === "newToOld"
            ? new Date(b.created) - new Date(a.created)
            : new Date(a.created) - new Date(b.created);
        });
      }
      return { ...prevState, projects: sortedProjects };
    });
  };

  // Prepare sortedProjects for rendering
  const sortedProjects = accountData.projects.slice(0, displayedProjects);

  const [showFullText, setShowFullText] = useState(false);

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

  // Modal state
  const [showAttendModal, setShowAttendModal] = useState(false);
  const [attendModalMessage, setAttendModalMessage] = useState("");
  const [showAttendButton, setShowAttendButton] = useState(false);

  const handleModalChange = (show, message, showButton) => {
    setShowAttendModal(show);
    setAttendModalMessage(message);
    setShowAttendButton(showButton);
  };

  // State for the favorite modal
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [favoriteModalMessage, setFavoriteModalMessage] = useState("");
  const [showFavoriteButton, setShowFavoriteButton] = useState(false); // New state for button visibility

  // Function to handle favorite modal
  const handleFavoriteModal = (isAdded) => {
    const message = isAdded
      ? "You've bookmarked this event"
      : "You removed this event from bookmarks";
    setFavoriteModalMessage(message);
    setShowFavoriteModal(true);
    setShowFavoriteButton(isAdded); // Show button only if bookmark is added
    setTimeout(() => setShowFavoriteModal(false), 3000); // Hide modal after 3 seconds
  };

  return (
    <Container fluid>
      {/* Modal component */}
      <Modal show={showAttendModal} onHide={() => setShowAttendModal(false)}>
        <Modal.Body>{attendModalMessage}</Modal.Body>
        {showAttendButton && (
          <Modal.Footer>
            <Button variant="primary" onClick={() => navigate("/attending")}>
              View All Attending Events
            </Button>
          </Modal.Footer>
        )}
      </Modal>

      {/* Favorite Modal */}
      <Modal
        show={showFavoriteModal}
        onHide={() => setShowFavoriteModal(false)}
      >
        <Modal.Body>{favoriteModalMessage}</Modal.Body>
        {showFavoriteButton && (
          <Modal.Footer>
            <Button variant="primary" onClick={() => navigate("/favourites")}>
              View All Bookmarks
            </Button>
          </Modal.Footer>
        )}
      </Modal>

      <Row className="g-4">
        {/* Display profile data on the left inside a Card */}
        <Col xs={12} md={4} lg={3}>
          <Card className="mb-3">
            <Link to="/user/edit-account" className="btn btn-danger mb-3">
              Edit Account
            </Link>

            <Card.Img variant="top" src={accountData.profile.profile_image} alt="Profile" />

            <Card.Body>


            <div className="text-center">
            <Card.Title style={{ fontWeight: 'bold' }}>{accountData.profile.name}</Card.Title>
    <Card.Text>{accountData.profile.short_intro}</Card.Text>
    <Card.Text>{accountData.profile.location}</Card.Text>

    </div>


                <div className="d-flex justify-content-center">
    {accountData.profile.social_facebook && (
      <a
        href={accountData.profile.social_facebook}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon
          icon={faFacebook}
          color="#4267B2"
          style={{ margin: "0 10px" }}
        />
      </a>
    )}

    {accountData.profile.social_twitter && (
      <a
        href={accountData.profile.social_twitter}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon
          icon={faTwitter}
          color="#1DA1F2"
          style={{ margin: "0 10px" }}
        />
      </a>
    )}

    {accountData.profile.social_instagram && (
      <a
        href={accountData.profile.social_instagram}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon
          icon={faInstagram}
          color="#C13584"
          style={{ margin: "0 10px" }}
        />
      </a>
    )}

    {accountData.profile.social_youtube && (
      <a
        href={accountData.profile.social_youtube}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon
          icon={faYoutube}
          color="red"
          style={{ margin: "0 10px" }}
        />
      </a>
    )}

    {accountData.profile.social_website && (
      <a
        href={accountData.profile.social_website}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon
          icon={faGlobe}
          color="black"
          style={{ margin: "0 10px" }}
        />
      </a>
    )}
  </div>

              <Row className="mt-3 text-center">
                <Col>
                  <div>
                    <Link
                      to="/followers"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div>
                        <strong>{accountData.profile.followers_count}</strong>
                      </div>
                      <div>Followers</div>
                    </Link>
                  </div>
                </Col>
                <Col>
                  <div>
                    <Link
                      to="/following"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div>
                        <strong>{accountData.profile.following_count}</strong>
                      </div>
                      <div>Following</div>
                    </Link>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <div className="d-flex justify-content-center">
  <Button variant="secondary" onClick={() => navigate("/followed-tags")}>
    View Followed Categories
  </Button>
</div>

        </Col>

        {/* Display projects on the right */}
        <Col xs={12} md={8} lg={9}>
          {/* First Row for "Deals Posted" title and count */}
          <Row className="mb-2">
            <Col>
              <h5>Events Posted ({accountData.projects.length})</h5>
            </Col>
          </Row>

          {/* Second Row for buttons */}
          <Row className="mb-3">
            <Col md={3} className="d-flex align-items-center">
              {/* "Add Deal" button aligned to the left */}
              <Link to="/add-project" className="btn btn-warning">
                <i className="fa-solid fa-plus"></i> Add Event
              </Link>
            </Col>
            <Col md={9}>
              <div className="d-flex justify-content-end align-items-center">
                {/* Button group for sort buttons aligned to the right */}
                <ButtonGroup>
                  {/* Top Dropdown */}
                  <DropdownButton
                    id="dropdown-basic-button"
                    title="Top"
                    className="me-2"
                    variant="info"
                  >
                    <Dropdown.Item
                      onClick={() => sortProjects("top", "topToLow")}
                    >
                      High to Low
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => sortProjects("top", "lowToTop")}
                    >
                      Low to High
                    </Dropdown.Item>
                  </DropdownButton>
                  {/* Price Dropdown */}
                  <DropdownButton
                    id="dropdown-basic-button"
                    title="Price"
                    className="me-2"
                    variant="success"
                  >
                    <Dropdown.Item
                      onClick={() => sortProjects("price", "highToLow")}
                    >
                      High to Low
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => sortProjects("price", "lowToHigh")}
                    >
                      Low to High
                    </Dropdown.Item>
                  </DropdownButton>
                  {/* Date Dropdown */}
                  <DropdownButton
                    id="dropdown-basic-button"
                    title="Date"
                    className="me-2"
                    variant="dark"
                  >
                    <Dropdown.Item
                      onClick={() => sortProjects("date", "newToOld")}
                    >
                      New to Old
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => sortProjects("date", "oldToNew")}
                    >
                      Old to New
                    </Dropdown.Item>
                  </DropdownButton>
                </ButtonGroup>
              </div>
            </Col>
          </Row>

          <Row xs={1} sm={2} md={2} lg={3} className="g-4">
            {sortedProjects.map((project) => (
              <Col key={project.id}>
                <Card>
                  <Link to={`/project/${project.id}`}>
                    <Card.Img
                      variant="top"
                      src={project.featured_image}
                      alt="project thumbnail"
                      className="project-thumbnail"
                      style={{
                        width: "100%",
                        height: "250px",
                        objectFit: "cover",
                        margin: 0,
                      }}
                    />
                  </Link>
                  <Card.Body style={{ minHeight: "400px", overflow: "auto" }}>
                    <Card.Title>
                      <Link
                        to={`/project/${project.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {project.title}
                      </Link>
                    </Card.Title>

                    <Link
                      to="/user/account"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Card.Text className="mb-3">
                        <img
                          src={project.owner.profile_image} // Use the appropriate property for the image URL
                          alt="Profile"
                          style={{
                            width: "30px",
                            height: "30px",
                            marginRight: "10px",
                            borderRadius: "50%",
                          }} // Adjust the styling as necessary
                        />
                        {project.owner.name}
                      </Card.Text>
                    </Link>

                    <VotingButtons projectId={project.id} />

                    <Card.Text className="my-3" style={{ fontSize: "22px" }}>
                      RM {project.price}
                    </Card.Text>

                    {/* <div className="mb-3">
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
                    </div> */}

                    <Card.Text>
                      <strong>Start:</strong>{" "}
                      {formatMomentDate(project.start_date)}
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
                    </Card.Text>

                    <Card.Text>
                      <strong>End:</strong> {formatMomentDate(project.end_date)}
                      <span
                        style={{
                          fontStyle: "italic",
                          color: "orange",
                          fontSize: "smaller",
                          marginLeft: "10px",
                        }}
                      >
                        (<strong>Event ends in:</strong>{" "}
                        {timeUntilEnd(project.end_date)})
                      </span>
                    </Card.Text>

                    <Card.Text>
                      <strong>Location:</strong>{" "}
                      {showFullText
                        ? project.location
                        : `${project.location
                            .split(" ")
                            .slice(0, 8)
                            .join(" ")}...`}
                      <Button
                        variant="link"
                        onClick={() => setShowFullText(!showFullText)}
                      >
                        {showFullText ? "Show Less" : "Show More"}
                      </Button>
                    </Card.Text>

                    <AttendButton
                      projectId={project.id}
                      onModalChange={handleModalChange}
                      token={localStorage.getItem("token")}
                    />

                    <div style={{ marginBottom: "20px", marginTop: "20px" }}>
                      <FavoriteButton
                        projectId={project.id}
                        token={localStorage.getItem("token")}
                        onFavoriteChange={handleFavoriteModal}
                      />
                    </div>

                    <ButtonGroup style={{ marginBottom: "20px" }}>
                      {project.tags.map((tag) => (
                        <Link key={tag.id} to={`/categories?tag_id=${tag.id}`}>
                          <Button
                            variant="danger"
                            className="me-2"
                            style={{ fontSize: "12px", padding: "2px 5px" }}
                          >
                            {tag.name}
                          </Button>
                        </Link>
                      ))}
                    </ButtonGroup>

                    {/* <Card.Text style={{ fontSize: '16px' }}>
                    <Badge bg="dark">{project.brand}</Badge>
                </Card.Text> */}

                    <div>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => editProject(project.id)}
                      >
                        Edit
                      </Button>{" "}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {/* Show More/Less Buttons */}
          <div className="d-flex justify-content-center">
            {displayedProjects < accountData.projects.length && (
              <Button onClick={showMoreProjects} className="m-2">Show More</Button>
            )}
            {displayedProjects > 6 && (
              <Button onClick={showLessProjects} className="m-2">Show Less</Button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default UserAccount;
