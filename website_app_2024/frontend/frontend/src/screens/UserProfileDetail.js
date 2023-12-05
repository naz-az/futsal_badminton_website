// UserProfileDetail.js
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // Import useParams
import { Card, Button, Container, Dropdown, DropdownButton, Badge,Row, Col, ButtonGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import VotingButtons from "../components/VotingButtons";
import FavoriteButton from "../components/FavoriteButton";
import AuthContext from '../context/authContext';
import AttendButton from "../components/AttendButton";

import moment from 'moment';


function UserProfileDetail() {
  const [profile, setProfile] = useState({});
  const [projects, setProjects] = useState([]); // <-- Add this
  const { id } = useParams();

  const [isFollowing, setIsFollowing] = useState(false);

  const navigate = useNavigate();

  const [blockedUsers, setBlockedUsers] = useState([]);

  const [displayedProjects, setDisplayedProjects] = useState(6); // Change from 4 to 6
  const [sortType, setSortType] = useState('newest'); // New state to track sorting

  const auth = useContext(AuthContext);
  const currentUserId = auth.user ? auth.user.profile.id : null;


    // Function to check if user is authenticated
    const isAuthenticated = () => {
      return localStorage.getItem("token") != null;
    };
  
    // Function to handle redirection to login if not authenticated
    const redirectToLogin = () => {
      navigate('/login');
    };
  
  
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await axios.get(`/api/profiles/${id}/`);
      setProfile(response.data);
    };

    const fetchProjects = async () => {
      const response = await axios.get(`/api/profiles/${id}/projects/`);
      setProjects(response.data);
    };

    const fetchBlockedUsers = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get("/api/blocked-users/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBlockedUsers(res.data);
        } catch (error) {
          if (error.response && error.response.status === 401) {
            console.error("Unauthorized access - User not logged in");
          } else {
            console.error("Error fetching blocked users:", error);
          }
        }
      } else {
        console.log("User is not authenticated");
      }
    };

    fetchProfile();
    fetchProjects();
    fetchBlockedUsers();
  }, [id]);

  const [isUserBlocked, setIsUserBlocked] = useState(false);

  useEffect(() => {
    const checkIfBlocked = async () => {
      if (localStorage.getItem("token")) { // Add this check
        try {
          const response = await axios.get(`/api/profiles/${id}/is_blocked/`, authHeaders);
          setIsUserBlocked(response.data.is_blocked);
        } catch (error) {
          console.error("Error checking if user is blocked:", error);
        }
      }
    };
  
    checkIfBlocked();
  }, [id]);
  
  

  const handleFollow = async () => {
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
  
      await axios.post(`/api/profiles/${id}/follow/`, {}, config);
      setIsFollowing(true);
  
      // Update profile state to reflect new followers count
      setProfile(prevProfile => ({
        ...prevProfile,
        followers_count: prevProfile.followers_count + 1,
      }));
    } catch (error) {
      console.error("Error following the user:", error);
    }
  };
  

  const handleUnfollow = async () => {
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
  
      await axios.post(`/api/profiles/${id}/unfollow/`, {}, config);
      setIsFollowing(false);
  
      // Update profile state to reflect new followers count
      setProfile(prevProfile => ({
        ...prevProfile,
        followers_count: prevProfile.followers_count > 0 ? prevProfile.followers_count - 1 : 0,
      }));
    } catch (error) {
      console.error("Error unfollowing the user:", error);
    }
  };
  
  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (localStorage.getItem("token")) { // Add this check
        try {
          const response = await axios.get(`/api/profiles/${id}/is_following/`, authHeaders);
          setIsFollowing(response.data.is_following);
        } catch (error) {
          console.error("Error checking following status:", error);
        }
      }
    };
  
    checkFollowingStatus();
  }, [id]);
  
  
  

  const sortProjects = (type, order) => {
    setSortType(type);

    setProjects((prevProjects) => {
      let sortedProjects = [...prevProjects];
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
      return sortedProjects;
    });
  };

  const showMoreProjects = () => {
    // Check if the current displayedProjects count plus 4 is less than or equal to the total projects count
    if (displayedProjects + 6 <= projects.length) {
      setDisplayedProjects((prev) => prev + 6);
    }
  };
  
  const showLessProjects = () => {
    // Check if the current displayedProjects count minus 4 is greater than or equal to the minimum count
    if (displayedProjects - 6 >= 6) {
      setDisplayedProjects((prev) => (prev - 6));
    }
  };

  // Prepare sortedProjects for rendering
  const sortedProjects = projects.slice(0, displayedProjects);

  function getButtonClasses(isDisabled) {
    return `btn ${isDisabled ? 'button-disabled' : ''}`;
  }
  

  const [showFullText, setShowFullText] = useState(false);

  const formatMomentDate = (dateString) => {
    return dateString 
      ? moment.utc(dateString).format("DD/MM/YY, (ddd), hh:mm A") + " UTC+8" 
      : "N/A";
  };

  return (
    <Container className="my-md">
      <Row>
        <Col xs={12} md={3} style={{ marginRight: "100px" }}>
        <Card className="text-center profile-card"> {/* Add a custom class for styling */}
            <Card.Body>
            <Card.Img
                variant="top"
                className="avatar avatar--xl profile-image" 
                src={profile.profile_image}
              />
              <Card.Title>{profile.name}</Card.Title>
              <Card.Text>{profile.short_intro}</Card.Text>
              {profile.location && <Card.Text>Based in {profile.location}</Card.Text>}
              <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                {profile.social_facebook && (
                  <li style={{ display: "inline-block", marginRight: "10px" }}>
                    <a
                      href={
                        profile.social_facebook.startsWith("http")
                          ? profile.social_facebook
                          : `https://${profile.social_facebook}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-facebook"></i>
                    </a>
                  </li>
                )}

                {profile.social_twitter && (
                  <li style={{ display: "inline-block", marginRight: "10px" }}>
                    <a
                      href={
                        profile.social_twitter.startsWith("http")
                          ? profile.social_twitter
                          : `https://${profile.social_twitter}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                  </li>
                )}

                {profile.social_instagram && (
                  <li style={{ display: "inline-block", marginRight: "10px" }}>
                    <a
                      href={
                        profile.social_instagram.startsWith("http")
                          ? profile.social_instagram
                          : `https://${profile.social_instagram}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-instagram"></i>
                    </a>
                  </li>
                )}

                {profile.social_youtube && (
                  <li style={{ display: "inline-block", marginRight: "10px" }}>
                    <a
                      href={
                        profile.social_youtube.startsWith("http")
                          ? profile.social_youtube
                          : `https://${profile.social_youtube}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-youtube"></i>
                    </a>
                  </li>
                )}

                {profile.social_website && (
                  <li style={{ display: "inline-block", marginRight: "10px" }}>
                    <a
                      href={
                        profile.social_website.startsWith("http")
                          ? profile.social_website
                          : `https://${profile.social_website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-globe"></i>
                    </a>
                  </li>
                )}
              </ul>

<Row className="mt-3">
  {profile.id !== currentUserId && !isUserBlocked && (
    <Col>
      <Button
        variant="secondary"
        onClick={() => {
          if (!isAuthenticated()) {
            redirectToLogin();
          } else {
            navigate(`/send?recipient=${id}`);
          }
        }}
      >
        Send Message
      </Button>
    </Col>
  )}
</Row>

<Row className="mt-3">
  <Col>
    {profile.id !== currentUserId && !isUserBlocked &&
      (isFollowing ? (
        <Button
          variant="outline-primary"
          onClick={handleUnfollow}
        >
          Unfollow
        </Button>
      ) : (
        <Button variant="primary" onClick={handleFollow}>
          Follow
        </Button>
      ))
    }
  </Col>
</Row>


              <Row className="mt-3 text-center">
    <Col>
        <div>
            <Link to={`/profiles/${id}/followers`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <strong>{profile.followers_count}</strong> Followers
            </Link>
        </div>
    </Col>
    <Col>
        <div>
            <Link to={`/profiles/${id}/following`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <strong>{profile.following_count}</strong> Following
            </Link>
        </div>
    </Col>
</Row>



            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={8}>
          <Card>
            <Card.Header>About Me</Card.Header>
            <Card.Body>
              <Card.Text>{profile.bio}</Card.Text>
            </Card.Body>
          </Card>

          {/* <Card>
                        <Card.Header>Categories</Card.Header>
                        <Card.Body>
                            {topSkills.map(skill => (
                                <div key={skill.name}>
                                    <h4>{skill.name}</h4>
                                    <p>{skill.description}</p>
                                </div>
                            ))}
                            <h3>Other Categories</h3>
                            {otherSkills.map(skill => (
                                <span key={skill}>
                                    <small>{skill}</small>
                                </span>
                            ))}
                        </Card.Body>
                    </Card> */}

<Card>
  <Card.Header>Events</Card.Header>
  <Card.Body>
    {projects && projects.length === 0 ? (
      <p>No events posted by user</p>
    ) : (
      <>
        {/* Add sorting button group before listing the projects */}
        <div className="d-flex justify-content-end align-items-center mb-3" >
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

        <Row>
          {sortedProjects.map((project) => (
            <Col md={4} style={{ paddingRight: '5px', paddingLeft: '5px' }} key={project.id}>
              <Card className="mb-3">
                <Link to={`/project/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Card.Img
                      variant="top"
                      src={project.featured_image}
                      alt="project thumbnail"
                      className="project-thumbnail"
                      style={{ width: '100%', height: '250px', objectFit: 'cover', margin: 0 }}

                    />
                  </Link>
                  <Card.Body style={{ minHeight: "410px", overflow: "auto" }}>
                    <Card.Title>
                      <Link to={`/project/${project.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {project.title}
                      </Link>
                    </Card.Title>

                  <Link to={`/profiles/${project.owner.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Card.Text className="mb-3">
                      <img 
                        src={project.owner.profile_image}
                        alt="Profile"
                        style={{ width: '30px', height: '30px', marginRight: '10px', borderRadius: '50%' }}
                      />
                      By {project.owner.name}
                    </Card.Text>
                  </Link>

                  <VotingButtons projectId={project.id} />

                  <Card.Text style={{ fontSize: "22px", marginTop: "20px" }}>RM {project.price}</Card.Text>
{/* 
                  <div style={{ marginBottom: "15px" }}>
                    <Button
                      variant="warning"
                      onClick={() => {
                        const url =
                          project.deal_link.startsWith("http://") || project.deal_link.startsWith("https://")
                            ? project.deal_link
                            : "http://" + project.deal_link;
                        window.open(url, "_blank");
                      }}
                    >
                      Go to deal <i className="fa-solid fa-up-right-from-square" style={{ marginLeft: '8px' }}></i>
                    </Button>
                  </div> */}



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




<AttendButton projectId={project.id} token={localStorage.getItem("token")} />


                    <div style={{ marginBottom: '20px', marginTop: '20px'}}>

                    <FavoriteButton projectId={project.id} token={localStorage.getItem("token")} />
                    </div>



                  <ButtonGroup>
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

                  {/* <Card.Text style={{ fontSize: '16px', marginTop: '10px' }}>
                    <Badge bg="dark">{project.brand}</Badge>
                </Card.Text>

                    <div>

                    <FavoriteButton projectId={project.id} token={localStorage.getItem("token")} />
                    </div> */}


                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Show more or less projects buttons */}
  <div className="text-center mt-4">
    <Button
      onClick={showMoreProjects}
      className="me-2"
      disabled={displayedProjects >= projects.length} // Disable if all projects are displayed
    >
      Show More
    </Button>
    <Button
      onClick={showLessProjects}
      disabled={displayedProjects <= 6} // Disable if the minimum amount of projects are displayed
    >
      Show Less
    </Button>
  </div>
      </>
    )}
  </Card.Body>
</Card>
        </Col>
      </Row>
    </Container>
  );
}

export default UserProfileDetail;
