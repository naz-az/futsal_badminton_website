import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Container, Modal, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function FollowedTagsPage() {
  const [followedTags, setFollowedTags] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFollowedTags();
  }, []);

  const fetchFollowedTags = async () => {
    try {
      const { data } = await axios.get('/api/followed-tags', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setFollowedTags(data);
    } catch (error) {
      console.error('Error fetching followed tags', error);
    }
  };

  const handleUnfollowClick = (tag) => {
    setSelectedTag(tag);
    setShowConfirmModal(true);
  };

  const confirmUnfollow = async () => {
    try {
      await axios.post(`/api/unfollow-tag/${selectedTag.id}/`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setShowConfirmModal(false);
      fetchFollowedTags();
    } catch (error) {
      console.error('Error unfollowing tag', error);
    }
  };

    // Add this function inside FollowedTagsPage component
const handleTagClick = (tagId) => {
    navigate(`/categories?tag_id=${tagId}`);
  };
  
  return (
    <Container>
      <h2 className="text-center mt-4 mb-5">Followed Categories</h2>

      <div style={{ marginBottom: '25px' }}> {/* Container with margin */}
        <Button variant="secondary" onClick={() => navigate('/categories')}>View all Categories</Button>
      </div>

      <div>
        {followedTags.map(tag => (
          <Card key={tag.id} style={{ marginBottom: '10px' }}>
            <Card.Body>
              <Row className="align-items-center">
                <Col xs={9} lg={11} onClick={() => handleTagClick(tag.id)}>
                  <Card.Title style={{ cursor: 'pointer' }}>{tag.name}</Card.Title>
                </Col>
                <Col xs={3} lg={1}>
                  <Button  variant="primary" onClick={(e) => { e.stopPropagation(); handleUnfollowClick(tag); }}>Unfollow</Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Unfollow</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to unfollow this tag?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Close
                    </Button>
                    <Button variant="outline-primary" onClick={confirmUnfollow}>
                        Yes, Unfollow
                    </Button>
                </Modal.Footer>
            </Modal>      
    </Container>
  );
}

export default FollowedTagsPage;