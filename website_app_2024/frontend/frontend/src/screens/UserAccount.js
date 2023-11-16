import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, ButtonGroup, DropdownButton, Dropdown, Badge } from "react-bootstrap";
import { Link } from "react-router-dom"; // Don't forget to import Link to handle navigation
import { useNavigate } from "react-router-dom";
import VotingButtons from "../components/VotingButtons";
import FavoriteButton from "../components/FavoriteButton";

function UserAccount() {
  const [accountData, setAccountData] = useState({
    profile: {},
    projects: [],
  });

  const [projects, setProjects] = useState([]); // <-- Add this

  const [displayedProjects, setDisplayedProjects] = useState(6); // New state for managing displayed projects
  const [sortType, setSortType] = useState('newest'); // New state to track sorting


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
        sortProjects('newest');
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
  
    setAccountData(prevState => {
      let sortedProjects = [...prevState.projects];
      if (type === 'top') {
        sortedProjects.sort((a, b) => (order === 'topToLow' ? b.upvotes - a.upvotes : a.upvotes - b.upvotes));
      } else if (type === 'price') {
        sortedProjects.sort((a, b) => (order === 'highToLow' ? b.price - a.price : a.price - b.price));
      } else { // 'date' or any other type
        sortedProjects.sort((a, b) => {
          return order === 'newToOld'
            ? new Date(b.created) - new Date(a.created)
            : new Date(a.created) - new Date(b.created);
        });
      }
      return { ...prevState, projects: sortedProjects };
    });
  };
  

    // Prepare sortedProjects for rendering
    const sortedProjects = accountData.projects.slice(0, displayedProjects);



  
    
  return (
    <Container>
      <Row>
        {/* Display profile data on the left inside a Card */}
        <Col md={4}>
        <Card className="profile-card">
                      <Link to="/user/edit-account" className="btn btn-primary mb-3">
              Edit Account
            </Link>

            <Card.Img
              variant="top"
              src={accountData.profile.profile_image}
              alt="Profile"
              className="profile-image"

            />
            <Card.Body>
              <Card.Title>{accountData.profile.name}</Card.Title>
              <Card.Text>{accountData.profile.location}</Card.Text>

              <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                {accountData.profile.social_facebook && (
                  <li style={{ display: "inline-block", marginRight: "10px" }}>
                    <a
                      href={
                        accountData.profile.social_facebook.startsWith("http")
                          ? accountData.profile.social_facebook
                          : `https://${accountData.profile.social_facebook}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-facebook"></i>
                    </a>
                  </li>
                )}

                {accountData.profile.social_twitter && (
                  <li style={{ display: "inline-block", marginRight: "10px" }}>
                    <a
                      href={
                        accountData.profile.social_twitter.startsWith("http")
                          ? accountData.profile.social_twitter
                          : `https://${accountData.profile.social_twitter}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                  </li>
                )}

                {accountData.profile.social_instagram && (
                  <li style={{ display: "inline-block", marginRight: "10px" }}>
                    <a
                      href={
                        accountData.profile.social_instagram.startsWith("http")
                          ? accountData.profile.social_instagram
                          : `https://${accountData.profile.social_instagram}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-instagram"></i>
                    </a>
                  </li>
                )}

                {accountData.profile.social_youtube && (
                  <li style={{ display: "inline-block", marginRight: "10px" }}>
                    <a
                      href={
                        accountData.profile.social_youtube.startsWith("http")
                          ? accountData.profile.social_youtube
                          : `https://${accountData.profile.social_youtube}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-youtube"></i>
                    </a>
                  </li>
                )}

                {accountData.profile.social_website && (
                  <li style={{ display: "inline-block", marginRight: "10px" }}>
                    <a
                      href={
                        accountData.profile.social_website.startsWith("http")
                          ? accountData.profile.social_website
                          : `https://${accountData.profile.social_website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-globe"></i>
                    </a>
                  </li>
                )}
              </ul>

              <Card.Text>
                <Link to="/followers">
                  {accountData.profile.followers_count} Followers
                </Link>{" "}
                ·{" "}
                <Link to="/following">
                  {accountData.profile.following_count} Following
                </Link>
              </Card.Text>
            </Card.Body>
          </Card>

          <Button onClick={() => navigate("/followed-tags")}>
            View Followed Tags
          </Button>
        </Col>

      {/* Display projects on the right */}
      {/* Display projects on the right */}
<Col md={8}>
{/* First Row for "Deals Posted" title and count */}
<Row className="mb-2">
  <Col>
    <h5>Deals Posted ({accountData.projects.length})</h5>
  </Col>
</Row>

{/* Second Row for buttons */}
<Row className="mb-3">
  <Col md={3} className="d-flex align-items-center">
    {/* "Add Deal" button aligned to the left */}
    <Link to="/add-project" className="btn btn-warning">
      <i className="fa-solid fa-plus"></i> Add Deal
    </Link>

    
  </Col>
  <Col md={9}>
    <div className="d-flex justify-content-end align-items-center">
      {/* Button group for sort buttons aligned to the right */}
      <ButtonGroup>
            {/* Top Dropdown */}
            <DropdownButton id="dropdown-basic-button" title="Top" className="me-2" variant="info">
              <Dropdown.Item onClick={() => sortProjects('top', 'topToLow')}>High to Low</Dropdown.Item>
              <Dropdown.Item onClick={() => sortProjects('top', 'lowToTop')}>Low to High</Dropdown.Item>
            </DropdownButton>
            {/* Price Dropdown */}
            <DropdownButton id="dropdown-basic-button" title="Price" className="me-2" variant="success">
              <Dropdown.Item onClick={() => sortProjects('price', 'highToLow')}>High to Low</Dropdown.Item>
              <Dropdown.Item onClick={() => sortProjects('price', 'lowToHigh')}>Low to High</Dropdown.Item>
            </DropdownButton>
            {/* Date Dropdown */}
            <DropdownButton id="dropdown-basic-button" title="Date" className="me-2" variant="dark">
              <Dropdown.Item onClick={() => sortProjects('date', 'newToOld')}>New to Old</Dropdown.Item>
              <Dropdown.Item onClick={() => sortProjects('date', 'oldToNew')}>Old to New</Dropdown.Item>
            </DropdownButton>
          </ButtonGroup>
    </div>
  </Col>
</Row>


  <Row>
            {sortedProjects.map((project) => (
              <Col md={4} key={project.id}>
                <Card className="mb-4">
                  <Link to={`/project/${project.id}`}>
                    <Card.Img
                      variant="top"
                      src={project.featured_image}
                      alt="project thumbnail"
                      className="project-thumbnail"
                      style={{ width: '100%', height: '250px', objectFit: 'cover', margin: 0 }}

                    />
                  </Link>
                  <Card.Body style={{ minHeight: "400px", overflow: "auto" }}>
                    <Card.Title>
                      <Link to={`/project/${project.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {project.title}
                      </Link>
                    </Card.Title>

                    <Link to="/user/account" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Card.Text className="mb-3">
                      <img 
              src={project.owner.profile_image} // Use the appropriate property for the image URL
              alt="Profile"
              style={{ width: '30px', height: '30px', marginRight: '10px', borderRadius: '50%' }} // Adjust the styling as necessary
            />
                        {project.owner.name}
                      </Card.Text>
                    </Link>

                    <VotingButtons projectId={project.id} />

                    <Card.Text className="my-3" style={{ fontSize: "22px" }}>
                      RM {project.price}
                    </Card.Text>

                    <div className="mb-3">
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
                    </div>

                    <ButtonGroup className="mb-3">
                      {project.tags.map((tag) => (
                        <Link key={tag.id} to={`/categories?tag_id=${tag.id}`}>
                          <Button variant="primary" className="me-2" style={{ fontSize: "12px", padding: "2px 5px" }}>
                            {tag.name}
                          </Button>
                        </Link>
                      ))}
                    </ButtonGroup>

                    <Card.Text style={{ fontSize: '16px' }}>
                    <Badge bg="dark">{project.brand}</Badge>
                </Card.Text>

                    <div style={{ marginBottom: '20px'}}>

                    <FavoriteButton projectId={project.id} token={localStorage.getItem("token")} />
                    </div>

            <div>
              <Button
                variant="info"
                size="sm"
                onClick={() => editProject(project.id)}
              >
                Edit
              </Button>{" "}
              <Button
                variant="danger"
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
  {displayedProjects < accountData.projects.length && (
    <Button onClick={showMoreProjects}>Show More</Button>
  )}
  {displayedProjects > 4 && (
    <Button onClick={showLessProjects}>Show Less</Button>
  )}
</Col>
              

      </Row>
    </Container>
  );
}

export default UserAccount;
