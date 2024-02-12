import React, { useState, useEffect } from 'react';
import { Container, Button, Row, Col, Image } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MsgThread = () => {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState('');
  const { thread_id } = useParams(); // Ensure that this matches the parameter name defined in your route

  const config = {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  };

  useEffect(() => {
    if (!thread_id) {
      console.error("Thread ID is undefined");
      return;
    }
    fetchMessages();
  }, [thread_id]);

  const fetchMessages = () => {
    axios.get(`/api/messages/${thread_id}/`, config)
      .then(response => {
        console.log('Fetched Messages:', response.data);  // Log fetched messages
        setMessages(response.data);
      })
      .catch(error => console.error('Error fetching the message:', error));
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

const handleReplySubmit = async () => {
  try {
    if (!replyText.trim()) return;  // Ensure there's text to reply with

    const body = { body: replyText };
    const currentMessage = messages[messages.length - 1];

    const response = await axios.post(`/api/reply/${currentMessage.id}/`, body, config);

    if (response.status === 201) {
      const newMessage = response.data;
      // Update the messages state to include the new message
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        // Find the parent message and add the reply to its 'replies' array
        const parentMessage = updatedMessages.find(msg => msg.id === currentMessage.id);
        if (parentMessage) {
          if (!parentMessage.replies) {
            parentMessage.replies = [];
          }
          parentMessage.replies.push(newMessage);
        } else {
          // If it's a new thread message, add it to the top-level messages
          updatedMessages.push(newMessage);
        }
        return updatedMessages;
      });
      setReplyText('');  // Clear the reply input field
    } else {
      console.error(`Response status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending reply:', error);
  }
};

  
// Helper function to organize messages into a tree structure
const organizeMessages = (messages) => {
  let messageMap = new Map();
  messages.forEach(msg => messageMap.set(msg.id, { ...msg, replies: [] }));

  let rootMessages = [];
  messageMap.forEach((msg, id) => {
    if (msg.parent_msg) {
      messageMap.get(msg.parent_msg).replies.push(msg);
    } else {
      rootMessages.push(msg);
    }
  });

  return rootMessages;
};

useEffect(() => {
  axios.get(`/api/messages/${thread_id}/`, config)
    .then(response => {
      const organizedMessages = organizeMessages(response.data);
      console.log('Organized Messages:', organizedMessages); // New log
      setMessages(organizedMessages);
    })
    .catch(error => console.error('Error fetching the message:', error));
}, [thread_id]);


const renderMessages = (msgs) => {
  return msgs.map(msg => (
    <div key={msg.id}>
      <p><strong>From:</strong> {msg.sender ? msg.sender.name : "Anonymous"}</p>
      <p>{msg.body}</p>
      {msg.replies && msg.replies.length > 0 && (
        <div style={{ marginLeft: '20px' }}>
          <strong>Replies:</strong>
          {renderMessages(msg.replies)}
        </div>
      )}
    </div>
  ));
};


  return (
    <Container>
      <h1>Message Thread</h1>

      <Row className="mb-4">
        <Col>
          <Button variant="primary" onClick={() => navigate('/inbox1')}>Back to Inbox</Button>
        </Col>
      </Row>


      <Row>
        <Col>
          {renderMessages(messages)}
        </Col>
      </Row>

      {/* Reply section */}
      <Row>
        <Col>
          <input type="text" value={replyText} onChange={handleReplyChange} placeholder="Type your message..." />
          <Button variant="primary" onClick={handleReplySubmit}>Submit</Button>
        </Col>
      </Row>
    </Container>
  );
}

export default MsgThread;


