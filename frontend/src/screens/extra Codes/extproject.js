import React, { useState, useEffect, useContext } from "react";
import {
  Row,
  Col,
  Image,
  ListGroup,
  Button,
  Card,
  Form,
  ButtonGroup

} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authContext";

import RelatedProjectsSlider from "../components/RelatedProjectsSlider";

function ProjectScreen() {
  const [project, setProject] = useState([]);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const { id } = useParams();
  const auth = useContext(AuthContext);

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");


  const [relatedProjects, setRelatedProjects] = useState([]);

  const [isFavorited, setIsFavorited] = useState(false);



  useEffect(() => {
    async function fetchProject() {
      const { data } = await axios.get(`/api/projects/${id}`);
      setProject(data);

    }

    async function fetchComments() {
      const { data } = await axios.get(`/api/projects/${id}/comments`);
      setComments(data);
    }
    console.log("Fetching project data for project id:", id);
    fetchProject();
    fetchComments();
  }, [id]);

  useEffect(() => {
    async function fetchRelatedProjects(tags) {
        const promises = tags.map(tag => 
            axios.get(`/api/projects/?tag_id=${tag.id}`)
        );
        const responses = await Promise.all(promises);
        const allRelatedProjects = responses.flatMap(response => response.data);

        // Deduplicate related projects
        const uniqueRelatedProjects = Array.from(new Set(allRelatedProjects.map(p => p.id)))
          .map(id => allRelatedProjects.find(p => p.id === id));

        setRelatedProjects(uniqueRelatedProjects);
    }

    if (project && project.tags && project.tags.length) {
        fetchRelatedProjects(project.tags);
    }
}, [project]);



  const postComment = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      const { data } = await axios.post(
        `/api/projects/${id}/comments/`,
        { content },
        config
      );
      setComments([...comments, data]);
      setContent("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const deleteComment = async (commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmed) return;

    // Optimistically update the UI first by removing the parent comment and its direct replies
    const optimisticComments = comments.filter((comment) => {
      if (comment.id === commentId) return false; // filter out the comment itself

      // Check if the comment is a reply to the deleted comment
      if (comment.parent && comment.parent.id === commentId) return false;

      return true;
    });

    setComments(optimisticComments);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      await axios.delete(`/api/projects/${id}/comments/${commentId}/`, config);
    } catch (error) {
      // If the delete call fails, revert the state and display an error
      setComments(comments);
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const toggleLikeComment = async (commentId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      const { data } = await axios.put(
        `/api/projects/${id}/comments/${commentId}/`,
        {},
        config
      );
      const updatedComments = comments.map((comment) =>
        comment.id === data.id ? data : comment
      );
      setComments(updatedComments);
    } catch (error) {
      console.error("Error toggling like for the comment:", error);
    }
  };

  const postReply = async (parentId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      const { data } = await axios.post(
        `/api/projects/${id}/comments/`,
        { content: replyContent, parent: parentId },
        config
      );
      setComments([...comments, data]);
      setReplyingTo(null);
      setReplyContent("");
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };


  useEffect(() => {
  
    async function checkFavoriteStatus() {
        if(auth.isAuthenticated) {  // Only make request if user is authenticated
            const response = await axios.get(`/api/favorites/is-favorite/${id}/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });
            setIsFavorited(response.data.isFavorited);
        }
    }

    checkFavoriteStatus();

}, [id]);


const handleAddFavorite = async () => {
  try {
      const config = {
          headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
      };
      await axios.post(`/api/favorites/add/${id}/`, {}, config);
      setIsFavorited(true);
  } catch (error) {
      console.error("Error adding to favorites:", error);
  }
};

const handleRemoveFavorite = async () => {
  try {
      const config = {
          headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
      };
      await axios.delete(`/api/favorites/remove/${id}/`, config);
      setIsFavorited(false);
  } catch (error) {
      console.error("Error removing from favorites:", error);
  }
};



  return (
    <div>
      <Link to="/" className="btn btn-light my-3">
        Go Back
      </Link>
      <Row>
        <Col md={6}>
          <Image src={project.featured_image} alt={project.title} fluid />
        </Col>

        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h3>{project.title}</h3>
            </ListGroup.Item>

            <ListGroup.Item>Price: ${project.price}</ListGroup.Item>
            <ListGroup.Item>Description: {project.description}</ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={3}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Row>
                  <Col>Price:</Col>
                  <Col>
                    <strong>${project.price}</strong>
                  </Col>
                </Row>
              </ListGroup.Item>

              {/* Add this section for the tags */}
              <ListGroup.Item>
                  <Row>

                      <Col>
                          <ButtonGroup>
                              {project.tags && project.tags.map(tag => (
                                  <Link key={tag.id} to={`/categories?tag_id=${tag.id}`}>
                                      <Button 
                                          variant="primary" 
                                          className="mr-2" 
                                          style={{ 
                                              fontSize: '12px', 
                                              padding: '2px 5px', 
                                              marginRight: '6px'
                                          }}
                                      >
                                          {tag.name}
                                      </Button>
                                  </Link>
                              ))}
                          </ButtonGroup>
                      </Col>
                  </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>
                  <Button variant="primary" onClick={() => {
                        const url = project.deal_link.startsWith('http://') || project.deal_link.startsWith('https://') 
                            ? project.deal_link 
                            : 'http://' + project.deal_link;
                        window.open(url, '_blank');
                    }}>
                        Go to deal
                    </Button>                  
                    </Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                    <Col>
                        {isFavorited ? (
                            <Button variant="danger" onClick={handleRemoveFavorite}>
                                Remove from Favourites
                            </Button>
                        ) : (
                            <Button variant="primary" onClick={handleAddFavorite}>
                                Add to Favourites
                            </Button>
                        )}
                    </Col>
                </Row>
            </ListGroup.Item>


            </ListGroup>
          </Card>
        </Col>
      </Row>


      {/* <Button
        style={userVote === -1 ? redButtonStyle : greyButtonStyle}
        onClick={() => handleVote(userVote === -1 ? 0 : -1)}
      >
        Thumbs Down
      </Button>
      <span>{upvotes - downvotes}</span>
      <Button
        style={userVote === 1 ? greenButtonStyle : greyButtonStyle}
        onClick={() => handleVote(userVote === 1 ? 0 : 1)}
      >
        Thumbs Up
      </Button> */}



      <Row>
        <Col md={12}>
          <h4>Comments</h4>
          <ListGroup variant="flush">
            {comments.map((comment) => (
              <ListGroup.Item key={comment.id}>
                {comment.content} - <b>{comment.user.username}</b>
                <Button
                  variant={
                    comment.likes.includes(auth.user.id)
                      ? "danger"
                      : "outline-danger"
                  }
                  onClick={() => toggleLikeComment(comment.id)}
                >
                  Like {comment.likes.length}
                </Button>
                <Button onClick={() => setReplyingTo(comment.id)}>Reply</Button>
                {replyingTo === comment.id && (
                  <div>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <Button onClick={() => postReply(comment.id)}>
                      Submit Reply
                    </Button>
                  </div>
                )}
                {comment.replies &&
                  comment.replies.map((reply) => (
                    <div key={reply.id} style={{ marginLeft: "20px" }}>
                      {" "}
                      {/* <-- This marginLeft indents the replies */}
                      {reply.content} - <b>{reply.user.username}</b>
                    </div>
                  ))}
                {auth.isAuthenticated &&
                  auth.user.username === comment.user.username && (
                    <Button
                      variant="danger"
                      onClick={() => deleteComment(comment.id)}
                    >
                      Delete
                    </Button>
                  )}
              </ListGroup.Item>
            ))}
          </ListGroup>

          {auth.isAuthenticated && (
            <Form>
              <Form.Group controlId="comment">
                <Form.Label>Post a Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={postComment}>
                Submit
              </Button>
            </Form>
          )}
        </Col>
      </Row>

      <RelatedProjectsSlider relatedProjects={relatedProjects} currentProjectId={id} />



    </div>
  );
}

export default ProjectScreen;
