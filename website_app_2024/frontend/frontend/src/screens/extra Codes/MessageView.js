import React, { useState, useEffect } from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';  // Importing React Bootstrap components
import { useParams, useNavigate } from 'react-router-dom';

const MessageView = () => {
  const [message, setMessage] = useState(null);
  const { messageId, type } = useParams();
  
  const navigate = useNavigate();
  
  const config = {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  };

  useEffect(() => {
    fetch(`/api/messages/${messageId}/`, { headers: config.headers }) // Corrected this line
      .then(response => response.json())
      .then(data => setMessage(data))
      .catch(error => console.error('Error fetching the message:', error)); // Add this line to handle errors
  }, [messageId, type]);

  useEffect(() => {
    fetch(`/api/messages/${messageId}/`, { headers: config.headers })
        .then(response => response.json())
        .then(data => {
            setMessage(data);
            // If the type is 'inbox' and the message isn't read, mark it as read.
            if (type === 'inbox' && !data.is_read) {
                fetch(`/api/messages/read/${messageId}/`, {
                    method: 'POST',
                    headers: config.headers
                });
            }
        })
        .catch(error => console.error('Error fetching the message:', error));
}, [messageId, type]);

 

  if (!message) return <Container>Loading...</Container>;



  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <Button variant="primary" onClick={() => navigate('/inbox')}>Back to Inbox</Button>  {/* Replaced with React Bootstrap Button */}
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>{message.subject}</h2>
          <p><strong>From:</strong> {message.sender.name}</p>
          <p><strong>To:</strong> {message.recipient.name}</p>
          <p><strong>Date:</strong> {message.created_at}</p>
          <hr />
          <p>{message.body}</p>
        </Col>
      </Row>
    </Container>
  );
}

export default MessageView;