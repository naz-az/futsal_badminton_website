import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Row, Col, Image, Button, Form } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';



function extThread() {
  const [thread, setThread] = useState(null);
  const [mainReply, setMainReply] = useState(""); // For replying to the main thread
  const [individualReply, setIndividualReply] = useState(""); // For replying to individual messages
  const [isReplying, setIsReplying] = useState(null); // Keeps track of which message is being replied to
  const { threadId } = useParams();
  const navigate = useNavigate();

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
    const body = parentId ? individualReply : mainReply; // Use the appropriate reply content based on parentId
    try {
      console.log("Sending reply:", body);
      await axios.post(
        "/api/send_message/",
        {
          body,
          threadId,
          parentId,
          recipientId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, },
        }
      );
      if (parentId) {
        setIndividualReply(""); // Reset the individual reply state
      } else {
        setMainReply(""); // Reset the main thread reply state
      }
      fetchThread(); // Re-fetch the thread after sending reply
      setIsReplying(null); // Hide reply box after sending
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


  const renderMessages = (messages, parentId = null) => {
    return messages.filter(m => m.parent === parentId).map(message => (
      <div key={message.id} style={{ marginLeft: parentId ? '20px' : '0px' }}>
        <Row className="mb-4 align-items-start">
          {message.sender.id === thread.messages[0].sender.id ? (
            // Layout for the original sender
            <>
              <Col xs={1}>
              <Link to={`/profiles/${message.sender.id}`}>
    <Image src={message.sender.profile_image} alt={message.sender.username} roundedCircle fluid style={{ maxWidth: '50px' }} />
  </Link>
</Col>
<Col xs={11}>
  <div className="d-flex justify-content-start align-items-center">
    <div>
    <Link to={`/profiles/${message.sender.id}`} style={{ textDecoration: 'none' }}>
        {message.sender.username}
      </Link>
                    <div className="text-muted"><small>{new Date(message.timestamp).toLocaleString()}</small></div>
                  </div>
                  <Button variant="primary" onClick={() => handleReplyClick(message.id)} style={{ marginLeft: '10px' }}>Reply</Button>
                </div>
                <div><strong>{message.body}</strong></div>
              </Col>
            </>
          ) : (
            // Mirrored layout for other participants
            <>
              <Col xs={11}>
                <div className="d-flex justify-content-end align-items-center">
                  <Button variant="primary" onClick={() => handleReplyClick(message.id)} style={{ marginRight: '10px' }}>Reply</Button>
                  <div className="text-end">
                  <Link to={`/profiles/${message.sender.id}`} style={{ textDecoration: 'none' }}>
        {message.sender.username}
      </Link>
                    <div className="text-muted"><small>{new Date(message.timestamp).toLocaleString()}</small></div>
                  </div>
                </div>
                <div className="text-end"><strong>{message.body}</strong></div>
              </Col>
              <Col xs={1} className="d-flex justify-content-end">
              <Link to={`/profiles/${message.sender.id}`}>
    <Image src={message.sender.profile_image} alt={message.sender.username} roundedCircle fluid style={{ maxWidth: '50px' }} />
  </Link>
  </Col>

            </>
          )}
        </Row>
        {isReplying === message.id && (
          <Row>
            <Col xs={12}>
              <Form.Group className="mt-2">
                <Form.Control as="textarea" value={individualReply} onChange={(e) => setIndividualReply(e.target.value)} />
                <Button className="mt-2" onClick={() => sendReply(message.id, message.recipient.id)}>Submit</Button>
              </Form.Group>
            </Col>
          </Row>
        )}
        {/* Recursive call for nested messages */}
        {renderMessages(messages, message.id)}
      </div>
    ));
  };
  
  
  
  
  
  
  


  return (
    <div>
      <h1>Thread</h1>

      <Button variant="primary" onClick={() => navigate("/thread")}>
        Back to Inbox
      </Button>

      {thread && thread.messages ? (
        renderMessages(thread.messages)
      ) : (
        <p>Loading thread...</p>
      )}
      <Form.Group>
        <Form.Control
          as="textarea"
          value={mainReply}
          onChange={(e) => setMainReply(e.target.value)}
          placeholder="Reply to the main thread..."
        />
        <Button
          className="mt-2"
          onClick={() => sendReply(null, thread.participants[1].id)}
        >
          Send 
        </Button>
      </Form.Group>
    </div>
  );
}

export default extThread;