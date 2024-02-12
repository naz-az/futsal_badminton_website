import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Row, Col, Image, Button, Form } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';
import AuthContext from "../context/authContext";


function Thread() {
  const [thread, setThread] = useState(null);
  const [mainReply, setMainReply] = useState(""); // For replying to the main thread
  const [individualReply, setIndividualReply] = useState(""); // For replying to individual messages
  const [isReplying, setIsReplying] = useState(null); // Keeps track of which message is being replied to
  const { threadId } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext); // This line gets the auth object from your AuthContext

  const fetchThread = async () => {
    const token = localStorage.getItem("token");
    try {
      console.log("Fetching thread for ID:", threadId);
      const response = await axios.get(`/api/threads/${threadId}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, },
      });
      // console.log("Thread data received:", response.data);
      // console.log(
      //   "Full Response Data:",
      //   JSON.stringify(response.data, null, 2)
      // );

      if (
        response.data &&
        "messages" in response.data &&
        "participants" in response.data
      ) {
        setThread(response.data);
      } else {
        console.error("Invalid thread data structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching thread:", error);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [threadId]);

  const sendReply = async (parentId, recipientId) => {
    const token = localStorage.getItem("token");
    const body = parentId ? individualReply : mainReply; 
    // Use the appropriate reply content based on parentId
    try {
      console.log("Sending reply:", body);
      await axios.post(
        "/api/send_message/",
        {
          body,
          threadId,
          parentId,
          recipientId,
          isReply: !!parentId, // This will determine if the message is a reply

        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, },
        }
      );
      setMainReply("");
      setIndividualReply("");
      fetchThread(); 
      setIsReplying(null);
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleReplyClick = (messageId) => {
    if (isReplying === messageId) {
      setIsReplying(null); // If we're already replying to this message, hide the reply box
    } else {
      setIsReplying(messageId); // Otherwise, show the reply box for this message
    }
  };

// Add this function within your Thread component
// Add this function within your Thread component
const findParentMessage = (parentId) => {
  return thread.messages.find(message => message.id === parentId);
};


const renderMessages = (messages) => {
  return messages.map((message) => (
    <div key={message.id}>
      <Row className="align-items-center">
        {message.sender.id === thread.messages[0].sender.id ? (
          // Layout for the original sender
          <>
            <Col xs={1} className="d-flex justify-content-start">
            <Link 
          to={auth.user.profile.id === message.sender.id ? '/user/account' : `/profiles/${message.sender.id}`} 
          style={{ textDecoration: 'none', color: 'black' }}
        >
                      <Image src={message.sender.profile_image} alt={message.sender.username} roundedCircle fluid style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                <strong style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
  {message.sender.username}
</strong>

              </Link>
            </Col>
            <Col xs={3} className="speech-bubble right">
              <div className="message-content">
                <strong>{message.body}</strong>
                <div className="text-muted"><small>{new Date(message.timestamp).toLocaleString()}</small></div>
              </div>
            </Col>
            <Col xs={8}>
              <Button variant="primary" onClick={() => handleReplyClick(message.id)}>Reply</Button>
            </Col>
          </>
        ) : (
          // Mirrored layout for other participants
          <>
            <Col xs={7}></Col> {/* Empty space to push the content to the right */}
            <Col xs={1}>
              <Button variant="primary" onClick={() => handleReplyClick(message.id)}>Reply</Button>
            </Col>
            <Col xs={3} className="speech-bubble left">
              <div className="message-content">
                <strong>{message.body}</strong>
                <div className="text-muted"><small>{new Date(message.timestamp).toLocaleString()}</small></div>
              </div>
            </Col>
            <Col xs={1} className="d-flex justify-content-end">
            <Link 
          to={auth.user.profile.id === message.sender.id ? '/user/account' : `/profiles/${message.sender.id}`} 
          style={{ textDecoration: 'none', color: 'black' }}
        >
                      <Image src={message.sender.profile_image} alt={message.sender.username} roundedCircle fluid style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                <strong style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
  {message.sender.username}
</strong>
              </Link>
            </Col>
          </>
        )}
      </Row>

      {isReplying === message.id && (
        <Row>
          {message.sender.id === thread.messages[0].sender.id ? (
            <Col xs={6}>
              <Form.Group className="mt-2">
                <Form.Control as="textarea" value={individualReply} onChange={(e) => setIndividualReply(e.target.value)} />
                <Button className="mt-2" onClick={() => sendReply(message.id, message.recipient.id)}>Submit</Button>
              </Form.Group>
            </Col>
          ) : (
            <Col xs={{ span: 6, offset: 6 }}>
              <Form.Group className="mt-2">
                <Form.Control as="textarea" value={individualReply} onChange={(e) => setIndividualReply(e.target.value)} />
                <Button className="mt-2" onClick={() => sendReply(message.id, message.recipient.id)}>Submit</Button>
              </Form.Group>
            </Col>
          )}
        </Row>
      )}
    </div>
  ));
};

  
  
  
  
  


  return (
    <div className="thread-container">

    <div>
      <h1>Thread</h1>

      <Button style={{ marginBottom: '30px' }} variant="primary" onClick={() => navigate("/thread")}>
        Back to Inbox
      </Button>

      {thread && thread.messages ? (
        renderMessages(thread.messages)
      ) : (
        <p>Loading thread...</p>
      )}
      <Form.Group style={{ marginTop: '30px' }}>
        <Form.Control
          as="textarea"
          value={mainReply}
          onChange={(e) => setMainReply(e.target.value)}
          placeholder="Write a message..."
        />
        <Button
          className="mt-2"
          onClick={() => sendReply(null, thread.participants[1].id)}
        >
          Send 
        </Button>
      </Form.Group>
    </div>
    </div>

  );
}

export default Thread;