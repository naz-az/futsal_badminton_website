import React, { useState, useEffect, useContext } from 'react'; // Add useContext to the import
import ReplyForm from './ReplyForm';
import { Button, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/authContext';

const Comment = ({ comment, projectId, onCommentUpdated, currentUser  }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0); // New state for like count

  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const auth = useContext(AuthContext);

    // Function to determine the profile link path
    const getProfileLinkPath = (commentUserId) => {
      if (auth.user && commentUserId === auth.user.profile.id) {
        return '/user/account';
      }
      return `/profiles/${commentUserId}`;
    };
    
  useEffect(() => {
    // Check if the user is authenticated before fetching the profile
    if (auth.isAuthenticated) {
      const fetchCurrentUserProfile = async () => {
        try {
          const response = await axios.get('/api/user/account/', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setCurrentUserProfile(response.data);
        } catch (error) {
          console.error('Error fetching current user profile:', error);
        }
      };
  
      fetchCurrentUserProfile();
    } else {
      // Handle the scenario when the user is not authenticated
      // For instance, you might want to clear the current user profile
      setCurrentUserProfile(null);
    }
  }, [auth.isAuthenticated]); // Include auth.isAuthenticated in the dependency array
  

  const isCommentOwner = currentUserProfile && comment.user.username === currentUserProfile.profile.username;

  // console.log("Current currentUserProfile:", currentUserProfile);
  // // console.log("Current currentUserProfile:", comment.user.username);
  // console.log("Current currentUserProfile.username:", currentUserProfile.username);


  useEffect(() => {
    // Check if the user is authenticated before making the API call
    if (auth.isAuthenticated) {
      axios.get(`/api/likes/is-liked/${comment.id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      }).then(response => {
        setIsLiked(response.data.isLiked);
        setLikeCount(response.data.likeCount); // Update like count
      }).catch(error => console.error("Error checking like status:", error));
    } else {
      // Handle the scenario when the user is not authenticated
      // For instance, you might want to set default values
      setIsLiked(false);
      setLikeCount(0);
    }
  }, [comment.id, auth.isAuthenticated]); // Include auth.isAuthenticated in the dependency array
  
  const handleLike = async () => {
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };
    try {
      if (isLiked) {
        await axios.delete(`/api/likes/remove/${comment.id}/`, config);
        setLikeCount(prev => prev - 1); // Decrement like count
      } else {
        await axios.post(`/api/likes/add/${comment.id}/`, {}, config);
        setLikeCount(prev => prev + 1); // Increment like count
      }
      setIsLiked(!isLiked);
      if (onCommentUpdated) onCommentUpdated(); // Update comments list if needed
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    if (onCommentUpdated) onCommentUpdated(); // Update the comments if necessary
  };

  const handleDeleteComment = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      axios.delete(`/api/comments/delete/${comment.id}/`, config)
        .then(() => {
          if (onCommentUpdated) onCommentUpdated(); // Refresh comments list
        })
        .catch(error => console.error("Error deleting comment:", error));
    }
  };

  const [showReplies, setShowReplies] = useState(false);


  return (
    <Card className="mb-3">
      <Card.Body>

      <Row>
  {/* Profile image column */}
  <Col xs={2} md={1} className="d-flex align-items-center">
  <Link to={getProfileLinkPath(comment.user.id)}>
      <img
        src={comment.user.profile_image}
        alt={`${comment.user.username}'s profile`}
        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
      />
    </Link>
  </Col>
{/* Username and Date Created column */}
<Col xs={6} md={8} lg={8} className="d-flex flex-column justify-content-center">
<Link to={getProfileLinkPath(comment.user.id)} style={{ textDecoration: 'none' }}>
    <strong>{comment.user.username}</strong>
  </Link>
  <div style={{ fontSize: '0.85em', color: '#666' }}>
    {new Date(comment.created_at).toLocaleString()}
  </div>
</Col>

      {/* Buttons column */}
      <Col xs={4} md={3} lg={3} className="d-flex align-items-center justify-content-end">
      {auth.isAuthenticated && (
  <Button variant="outline-primary" size="sm" onClick={() => setShowReplyForm(!showReplyForm)}>
    Reply
  </Button>
)}

        {isCommentOwner && (
          <Button variant="outline-danger" size="sm" onClick={handleDeleteComment} className="ms-2">
            Delete
          </Button>
        )}
{auth.isAuthenticated && (
  <Button variant={isLiked ? "danger" : "primary"} onClick={handleLike} className="ms-2">
    {isLiked ? 'Unlike' : 'Like'} {likeCount}
  </Button>
)}

      </Col>
    </Row>

    {/* Comment content */}
    <div style={{ fontSize: '1.2em', marginTop: '0.5em', marginBottom: '1.0em', fontFamily: 'Segoe UI, Arial, sans-serif' }}>{comment.content}</div>




    {showReplyForm && auth.isAuthenticated && (
  <ReplyForm 
    parentCommentId={comment.id} 
    projectId={projectId} 
    onReplyPosted={onCommentUpdated} 
    onReplySuccess={handleReplySuccess}
  />
)}

        <div className="mt-3">
        {comment.replies && comment.replies.length > 0 && (
          <>
            {/* Show the first reply */}
            <Comment
              key={comment.replies[0].id}
              comment={comment.replies[0]}
              projectId={projectId}
              onCommentUpdated={onCommentUpdated}
              currentUser={currentUser}
            />

            {/* Button to toggle the visibility of additional replies, only if more than one reply exists */}
            {comment.replies && comment.replies.length > 1 && !showReplies && (
  <Button variant="secondary" size="sm" onClick={() => setShowReplies(true)}>
    See more comments ({comment.replies.length - 1})
  </Button>
)}

            {showReplies && (
              <>
                {comment.replies.slice(1).map((reply) => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    projectId={projectId}
                    onCommentUpdated={onCommentUpdated}
                    currentUser={currentUser}
                  />
                ))}
                <Button variant="secondary" size="sm" onClick={() => setShowReplies(false)}>
                  Show less
                </Button>
              </>
            )}
          </>
        )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Comment;
