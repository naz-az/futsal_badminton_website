import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Comment from './Comment';
import { ListGroup } from 'react-bootstrap';

const CommentsList = ({ projectId }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`/api/comments/${projectId}`);
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [projectId]);

  return (
    <ListGroup>
      {comments.map(comment => (
        <ListGroup.Item key={comment.id}>
          <Comment comment={comment} projectId={projectId} />
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default CommentsList;
