import React, { useState, useEffect, useContext } from "react";
import { Container, Card, Dropdown, Image, Row, Col, Badge, Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";

import axios from "axios";
import VotingButtons from "../components/VotingButtons";
import AuthContext from '../context/authContext';

import AttendButton from "../components/AttendButton";
import FavoriteButton from "../components/FavoriteButton";

import moment from 'moment';
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom v6


export default function FavouritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext); // Access the AuthContext
  const currentUserId = auth.user?.profile.id; // Get the current user's ID

  const [showFullText, setShowFullText] = useState(false);
  const navigate = useNavigate();

  const formatMomentDate = (dateString) => {
    return dateString 
      ? moment.utc(dateString).format("DD/MM/YY, (ddd), hh:mm A") + " UTC+8" 
      : "N/A";
  };
  
  const fetchFavorites = async (sortOption, order = 'desc') => {
    try {
      let url = `/api/favorites/?sort_by=${sortOption}&order=${order}`;

      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      const response = await axios.get(url, config);
      setFavorites(response.data);
      setLoading(false);
    } catch (err) {
      setError("An error occurred while fetching favorites.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites('created'); 
  }, []);



    // Create a function to handle the sorting options
    const handleSort = (sortField, sortOrder) => {
      fetchFavorites(sortField, sortOrder);
    };

  const handleRemove = async (projectId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        };
        const response = await axios.delete(
          `/api/favorites/remove/${projectId}/`,
          config
        ); // Instead of api.delete

        if (response.data && response.data.detail) {
          console.log(response.data.detail);
          setFavorites((prevFavorites) =>
            prevFavorites.filter((fav) => fav.project.id !== projectId)
          );
        }
      } catch (error) {
        console.error("Error removing project from favorites:", error);
      }
    }
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
    const [attendModalMessage, setAttendModalMessage] = useState('');
    const [showAttendButton, setShowAttendButton] = useState(false);

    
  const handleModalChange = (show, message, showButton) => {
    setShowAttendModal(show);
    setAttendModalMessage(message);
    setShowAttendButton(showButton);
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!favorites || favorites.length === 0) {
    return <div>You have no bookmarks.</div>;
  }


  return (
    <Container>
      <section className="text-center">
        <h2>Bookmarks</h2>
        <p>{favorites.length} bookmark item{favorites.length > 1 ? "s" : ""}</p>

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

        {/* Dropdown for sorting by newest */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          {/* Dropdown for sorting by newest */}
          <Dropdown onSelect={(e) => handleSort('created', e)}> {/* Use 'created' for sorting by newest */}
            <Dropdown.Toggle variant="outline-info" id="dropdown-new">
              Date
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="asc">Old to New</Dropdown.Item>
              <Dropdown.Item eventKey="desc">New to Old</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Dropdown for sorting by top */}
          <Dropdown onSelect={(e) => handleSort('upvotes', e)}>
            <Dropdown.Toggle variant="outline-dark" id="dropdown-upvote">
              Top
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="asc">Low to Top</Dropdown.Item>
              <Dropdown.Item eventKey="desc">Top to Low</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

                    {/* Dropdown for sorting by price */}
                    <Dropdown onSelect={(e) => handleSort('price', e)}>
            <Dropdown.Toggle variant="outline-success" id="dropdown-price">
              Price
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="asc">Low to High</Dropdown.Item>
              <Dropdown.Item eventKey="desc">High to Low</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

        </div>


        {favorites.map((favorite) => (
          <Card className="mb-4 mt-4" key={favorite.project.id} style={{ padding: '5px 5px', marginRight: '20px' }}> {/* No need for explicit height style, let content define it */}
            <Row noGutters={true}>
              {/* Image Section */}
              <Col xs={3} md={3} className="d-flex align-items-center justify-content-center">
                <Link to={`/project/${favorite.project.id}`}>
                <Image
  src={favorite.project.featured_image}
  alt={favorite.project.title + " image"}
  style={{ width: '300px', height: '450px', objectFit: 'cover' }} // Fixed size with objectFit
/>

                </Link>
              </Col>
              {/* Title, Voting Buttons Section */}
              <Col xs={5} md={5} style={{ marginLeft: '15px'  }} className="d-flex flex-column justify-content-between p-2 text-start mt-3 mb-3">
                <Card.Title>
                  <Link to={`/project/${favorite.project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {favorite.project.title}
                  </Link>
                </Card.Title>

                <Card.Text>
      <Link
                to={favorite.project.owner.id === currentUserId ? '/user/account' : `/profiles/${favorite.project.owner.id}`}
                style={{ textDecoration: "none", color: "brown" }}
      >
        <img 
          src={favorite.project.owner.profile_image} // Use the appropriate property for the image URL
          alt="Profile"
          style={{ width: '30px', height: '30px', marginRight: '10px', borderRadius: '50%' }} // Adjust the styling as necessary
        />
        {favorite.project.owner.name}
      </Link>
    </Card.Text>
    <Card.Text style={{ fontSize: '22px' }}>RM {favorite.project.price}</Card.Text>


<Card.Text>
  <strong>Start:</strong>{" "}
  {formatMomentDate(favorite.project.start_date)}
  <span style={{ fontStyle: "italic", color: "orange", fontSize: "smaller" , marginLeft: "10px"}}>
    (<strong>Event starts in:</strong> {timeUntilStart(favorite.project.start_date)})
  </span>
</Card.Text>

<Card.Text>
  <strong>End:</strong>{" "}
  {formatMomentDate(favorite.project.end_date)}
  <span style={{ fontStyle: "italic", color: "orange", fontSize: "smaller" , marginLeft: "10px"}}>
    (<strong>Event ends in:</strong> {timeUntilEnd(favorite.project.end_date)})
  </span>
</Card.Text>

          <Card.Text>
            <strong>Location:</strong>{" "}
            {showFullText
              ? favorite.project.location
              : `${favorite.project.location.split(" ").slice(0, 8).join(" ")}...`}
            <Button
              variant="link"
              onClick={() => setShowFullText(!showFullText)}
            >
              {showFullText ? "Show Less" : "Show More"}
            </Button>
          </Card.Text>


                <VotingButtons projectId={favorite.project.id} />

                </Col>

                <Col xs={2} md={2} className="d-flex flex-column justify-content-center p-2" style={{ marginRight: '50px' }}>
  <div className="mb-2 text-start"> {/* div wrapper with margin-bottom and left text alignment */}
    {/* <Button
      variant="warning"
      onClick={() => {
        const url =
          favorite.project.deal_link.startsWith("http://") ||
          favorite.project.deal_link.startsWith("https://")
          ? favorite.project.deal_link
          : "http://" + favorite.project.deal_link;
        window.open(url, "_blank");
      }}
    >
      Go to deal <i className="fa-solid fa-up-right-from-square"></i>
    </Button> */}

    <AttendButton projectId={favorite.project.id} onModalChange={handleModalChange} token={localStorage.getItem("token")} style={{ marginRight: '1rem' }} />




  </div>

  {/* Wrap tags in their own div and apply d-flex and flex-wrap for horizontal layout and wrapping */}
  <div className="d-flex flex-wrap mb-2 mt-3">
    {favorite.project.tags.map(tag => (
      <Link key={tag.id} to={`/categories?tag_id=${tag.id}`} className="me-2 mb-2"> {/* Right and bottom margin for each tag */}
        <Button variant="danger" style={{ fontSize: '12px', padding: '2px 5px' }}>
          {tag.name}
        </Button>
      </Link>
    ))}
  </div>

  <div className="mb-2 text-start"> {/* div wrapper with margin-bottom and left text alignment */}
    <Badge bg="dark">{favorite.project.brand}</Badge>
  </div>
</Col>


              {/* Remove Button */}
              <Col xs={1} md={1} className="d-flex justify-content-center align-items-center">
  <Button
    variant="primary"
    onClick={() => handleRemove(favorite.project.id)}
  >
    Remove
  </Button>
</Col>

            </Row>
          </Card>
        ))}
      </section>
    </Container>
  );
}