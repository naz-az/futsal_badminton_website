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
    <Container fluid>
      <Row className="justify-content-center my-4">
        <h2 className="text-center">Bookmarks</h2>
        <p className="text-center">{favorites.length} bookmark item{favorites.length > 1 ? "s" : ""}</p>

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
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '50px' }}>
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
          <Card className="mb-3 w-100">
            <Row noGutters className="align-items-center">
              <Col xs={12} md={3} className="p-2">
                <Link to={`/project/${favorite.project.id}`}>
                  <Image src={favorite.project.featured_image} fluid className="w-100" style={{ height: '210px', objectFit: 'cover' }} />
                </Link>
              </Col>
              <Col xs={12} md={5} className="p-2">
                <h5>
                  <Link to={`/project/${favorite.project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {favorite.project.title}
                  </Link>
                </h5>
                <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>
                <Link
                to={favorite.project.owner.id === currentUserId ? '/user/account' : `/profiles/${favorite.project.owner.id}`}
                style={{ textDecoration: "none", color: "brown" }}
      >
        <img 
          src={favorite.project.owner.profile_image} // Use the appropriate property for the image URL
          alt="Profile"
          style={{ width: '25px', height: '25px', marginRight: '10px', borderRadius: '50%' }} // Adjust the styling as necessary
        />
        {favorite.project.owner.name}
      </Link>                </p>
                <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>Price: {favorite.project.price}</p>
                <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>Start: {moment(favorite.project.start_date).format("DD/MM/YYYY")}</p>
                <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>End: {moment(favorite.project.end_date).format("DD/MM/YYYY")}</p>
                <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>Location: {favorite.project.location}</p>
               
                {favorite.project.tags.map(tag => (
      <Link key={tag.id} to={`/categories?tag_id=${tag.id}`} style={{ textDecoration: 'none', color: 'inherit' }} className="mb-2"> {/* Right and bottom margin for each tag */}
        <Button variant="info" style={{ fontSize: '12px', padding: '2px 5px' }}>
          {tag.name}
        </Button>
      </Link>
    ))}
              </Col>
              <Col xs={12} md={4} className="p-2 text-center text-md-right">
  <div className="d-flex flex-row justify-content-center justify-content-md-end align-items-center">
    <Button variant="primary" onClick={() => handleRemove(favorite.project.id)} className="m-1" style={{ fontSize: '14px', padding: '8px 12px' }}>Remove</Button>
    <AttendButton projectId={favorite.project.id} onModalChange={handleModalChange} className="m-1"/>
  </div>
</Col>


            </Row>
          </Card>
        ))}
      </Row>

      {/* Attend Modal */}
      <Modal show={showAttendModal} onHide={() => setShowAttendModal(false)}>
        <Modal.Body>{attendModalMessage}</Modal.Body>
        {showAttendButton && (
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAttendModal(false)}>Close</Button>
            <Button variant="primary" onClick={() => navigate('/attending')}>View All Attending Events</Button>
          </Modal.Footer>
        )}
      </Modal>
    </Container>
  );
}