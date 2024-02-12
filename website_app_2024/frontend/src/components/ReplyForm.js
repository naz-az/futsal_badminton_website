import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, FormControl } from 'react-bootstrap';

const ReplyForm = ({ parentCommentId, projectId, onReplyPosted, onReplySuccess  }) => {
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

    axios.post(`/api/comments/post/${projectId}/`, { content, parent_id: parentCommentId }, config)
    .then(() => {
        setContent('');
        if (onReplyPosted) onReplyPosted();
        if (onReplySuccess) onReplySuccess(); // Call the callback on successful reply

    })
    .catch(error => console.error("Error posting reply:", error));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormControl
        as="textarea"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write a reply..."
        rows={2}
      />
      <Button variant="primary" type="submit" className="mt-2">
        Post Reply
      </Button>
    </Form>
  );
};

export default ReplyForm;
