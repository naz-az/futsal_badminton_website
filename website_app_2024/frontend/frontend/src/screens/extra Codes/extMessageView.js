import React, { useState, useEffect } from 'react';
import { Container, Button, Row, Col, Image, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

const extMessageView = () => {
  const [message, setMessage] = useState(null);
  const [replies, setReplies] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [replyText, setReplyText] = useState("");
  const { messageId } = useParams();
  const navigate = useNavigate();

  const config = {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  };

  useEffect(() => {
    // Fetch the profiles from your backend.
    fetch('/api/profiles', config)
        .then(response => response.json())
        .then(data => setProfiles(data));

    if (messageId) {
        fetch(`/api/messages/${messageId}/`, { headers: config.headers })
            .then(response => response.json())
            .then(data => {
                setMessage(data);
                setReplies(data.replies || []);
            })
            .catch(error => console.error('Error fetching the message:', error));
    }
}, [messageId]);


  const handleSubmit = (e) => {
    e.preventDefault();

    const messageData = {
      recipient: selectedProfile,
      subject: subject,
      body: body
    };

    fetch('/api/message/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(messageData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.id) {
          alert('Message sent successfully!');
          // Refetch the message data after successfully sending a new message
          fetch(`/api/messages/${messageId}/`, { headers: config.headers })
            .then(response => response.json())
            .then(data => {
              setMessage(data);
              setReplies(data.replies || []);
              setSubject('');
              setBody('');
              setSelectedProfile('');
            });
        } else {
          alert('Error sending the message.');
        }
      });
  }

const handleReply = () => {
  if (replyText) {
      fetch(`/api/reply-to-message/${messageId}/`, {
          method: 'POST',
          headers: {
              ...config.headers,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              subject: `Re: ${message.subject}`,
              body: replyText
          })
      })
      .then(response => response.json())
      .then(data => {
        // Refetch the message data after successfully posting a reply
        fetch(`/api/messages/${messageId}/`, { headers: config.headers })
            .then(response => response.json())
            .then(data => {
                setMessage(data);
                setReplies(data.replies || []);
                setReplyText("");
            });
    })
    
      .catch(error => console.error('Error sending reply:', error));
  }
};

 

  if (!message) return <Container>Loading...</Container>;



  return (
    <Container>
      {!message ? (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="recipient">
            <Form.Label>Recipient:</Form.Label>
            <Form.Control as="select" value={selectedProfile} onChange={e => setSelectedProfile(e.target.value)}>
              {profiles.map(profile => (
                <option key={profile.id} value={profile.id}>{profile.name}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="subject">
            <Form.Label>Subject</Form.Label>
            <Form.Control type="text" value={subject} onChange={e => setSubject(e.target.value)} />
          </Form.Group>
          <Form.Group controlId="body">
            <Form.Label>Body</Form.Label>
            <Form.Control as="textarea" rows={3} value={body} onChange={e => setBody(e.target.value)} />
          </Form.Group>
          <Button variant="primary" type="submit">Send</Button>
        </Form>
      ) : (
        <div>
          {/* Render the original message */}
          <Row className="mb-4">
            <Col xs={2}>
              <Image src={message.sender.profile_image} alt={message.sender.name} roundedCircle fluid />
              <div className="text-center mt-2">{message.sender.name}</div>
            </Col>
            <Col xs={10}>
              {message.body}
            </Col>
          </Row>

          {/* Render the replies */}
          {replies && replies.map(reply => (
            <Row key={reply.id} className="mb-4">
              <Col xs={10}>
                {reply.body}
              </Col>
              <Col xs={2}>
                <Image src={reply.sender.profile_image} alt={reply.sender.name} roundedCircle fluid />
                <div className="text-center mt-2">{reply.sender.name}</div>
              </Col>
            </Row>
          ))}

          {/* Textbox and Button to reply */}
          <Row>
            <Col xs={10}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows="4"
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={2}>
              <Button onClick={handleReply}>Reply</Button>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
}

export default extMessageView;