import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, FormControl } from 'react-bootstrap';

const PostComment = ({ projectId, onCommentPosted }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };

    axios.post(`/api/comments/post/${projectId}/`, { content }, config)
    .then(() => {
        setContent('');
        if (onCommentPosted) {
            onCommentPosted();
        }
    })
    .catch(error => {
        console.error("Error posting comment:", error);
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormControl
        as="textarea"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write a comment..."
        rows={3}
      />
      <Button variant="dark" type="submit" className="mt-2">
        Post Comment
      </Button>
    </Form>
  );
};

export default PostComment;
