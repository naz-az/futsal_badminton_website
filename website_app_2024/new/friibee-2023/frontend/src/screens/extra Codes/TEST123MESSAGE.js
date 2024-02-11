import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Row, Col, Image, Button, Form } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

function Thread() {
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
                <Image src={message.sender.profile_image} alt={message.sender.username} roundedCircle fluid style={{ maxWidth: '50px' }} />
              </Col>
              <Col xs={11}>
                <div className="d-flex justify-content-start align-items-center">
                  <div>
                    {message.sender.username}
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
                    {message.sender.username}
                    <div className="text-muted"><small>{new Date(message.timestamp).toLocaleString()}</small></div>
                  </div>
                </div>
                <div className="text-end"><strong>{message.body}</strong></div>
              </Col>
              <Col xs={1} className="d-flex justify-content-end">
  <Image src={message.sender.profile_image} alt={message.sender.username} roundedCircle fluid style={{ maxWidth: '60px' }} />
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

export default Thread;


import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Table, Container, Button, Modal } from "react-bootstrap";
import AuthContext from "../context/authContext";

function ThreadMessages() {
  const [threads, setThreads] = useState([]);
  const [selectedThreads, setSelectedThreads] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const isAllSelected = selectedThreads.length === threads.length;

  useEffect(() => {
    const fetchThreads = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("/api/threads/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setThreads(response.data.sort((a, b) => 
          new Date(b.latest_message_timestamp) - new Date(a.latest_message_timestamp)
        ));
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };
    fetchThreads();
  }, []);
  

  const handleThreadClick = (threadId) => {
    navigate(`/thread/${threadId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };



  const getLatestMessage = (messages) => {
    if (messages.length === 0) {
      return "No messages yet";
    }
    return messages[messages.length - 1].body;
  };

  const showDeleteModal = (threadId, event) => {
    event.stopPropagation();
    setSelectedThreads([threadId]);
    setShowDeleteConfirm(true);
  };

  const toggleThreadSelection = (threadId) => {
    setSelectedThreads((prevSelected) => {
      if (prevSelected.includes(threadId)) {
        return prevSelected.filter((id) => id !== threadId);
      } else {
        return [...prevSelected, threadId];
      }
    });
  };

  const selectAllThreads = () => {
    if (selectedThreads.length === threads.length) {
      setSelectedThreads([]);
    } else {
      setSelectedThreads(threads.map((thread) => thread.id));
    }
  };

  const deleteSelectedThreads = async () => {
    const token = localStorage.getItem("token");
    try {
      await Promise.all(
        selectedThreads.map((threadId) =>
          axios.delete(`/api/threads/${threadId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setThreads(
        threads.filter((thread) => !selectedThreads.includes(thread.id))
      );
      setSelectedThreads([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting threads:", error);
    }
  };


  const getOtherParticipant = (participants) => {
    const otherParticipant = participants.find(
      (participant) => participant.username !== auth.user.profile.username
    );
    console.log("Logged-in User's Username:", auth.user.profile.username);

    // Log the username of the other participant to the console
    if (otherParticipant) {
      console.log("Other Participant's Username:", otherParticipant.username);
    } else {
      console.log("No other participant found");
    }
  
    return otherParticipant || {};
  };
  

  const renderUserInfo = (thread) => {
    const otherParticipant = getOtherParticipant(thread.participants);
    const { username, profile_image } = otherParticipant;
  };

  const getLatestMessageDetails = (messages) => {
    if (messages.length === 0) {
      return { body: "No messages yet", sender: null };
    }
    const lastMessage = messages[messages.length - 1];
    return { body: lastMessage.body, sender: lastMessage.sender };
  };
  



  return (
    <Container>
      <h1>Inbox</h1>
      <Button onClick={() => navigate("/send")}>Create New Message</Button>

      <Button
        variant="danger"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={selectedThreads.length === 0}
      >
        Delete Selected
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>
              <span
                onClick={selectAllThreads}
                style={{
                  textDecoration: "none",
                  cursor: "pointer",
                  color: "#FFA07A",
                }} // Updated styles here
              >
                {isAllSelected ? "Deselect All" : "Select All"}
              </span>
            </th>
            <th>User</th>
            <th>Message</th>
            <th>Date/Time</th>
            <th>Sender of last message</th>
            <th>Delete</th>
            <th>Seen</th> {/* New column for seen status */}

          </tr>
        </thead>
        <tbody>
          {threads.map((thread) => {
            const { username, profile_image } = getOtherParticipant(
              thread.participants
            );

            const latestMessageDetails = getLatestMessageDetails(thread.messages);
          
            const latestMessage = thread.messages[thread.messages.length - 1];


            return (
              <tr
                key={thread.id}
                onClick={() => handleThreadClick(thread.id)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedThreads.includes(thread.id)}
                    onChange={() => toggleThreadSelection(thread.id)}
                    onClick={(e) => e.stopPropagation()} // Prevent row click when checking/unchecking
                  />
                </td>
                <td>
                  <div>
                    <img
                      src={profile_image}
                      alt={username}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                    <div>{username}</div>
                  </div>
                </td>
                <td>{getLatestMessage(thread.messages)}</td>
                <td>{formatDate(thread.latest_message_timestamp)}</td>

                <td>
          {latestMessageDetails.sender
            ? <>
                {latestMessageDetails.sender.username}
                {latestMessageDetails.sender.username !== auth.user.profile.username && (
                  <Button variant="secondary" disabled style={{ marginLeft: "10px" }}>
                    Your turn
                  </Button>
                )}
              </>
            : "N/A"
          }
        </td>

                <td>
                  <Button
                    variant="danger"
                    onClick={(e) => showDeleteModal(thread.id, e)}
                  >
                    Delete
                  </Button>
                </td>


                <td>
                  {latestMessage}
                </td>

              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Confirmation Modal */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Thread</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this thread?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Close
          </Button>
          <Button variant="danger" onClick={deleteSelectedThreads}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ThreadMessages;



@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def thread_detail(request, thread_id):
    if request.method == 'GET':
        try:
            thread = Thrd.objects.get(id=thread_id, participants=request.user.profile)
            # Mark messages as viewed
            for message in thread.messages.filter(recipient=request.user.profile, viewed=False):
                message.viewed = True
                message.save()
            serializer = ThreadSerializer(thread)
            return Response(serializer.data)
        except Thrd.DoesNotExist:
            return Response({'detail': 'Thread not found'}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'DELETE':
        try:
            thread = Thrd.objects.get(id=thread_id, participants=request.user.profile)
            thread.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Thrd.DoesNotExist:
            return Response({'detail': 'Thread not found'}, status=status.HTTP_404_NOT_FOUND)
        

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    data = request.data
    logger.debug(f"Received data for sending message: {data}")

    sender_profile = request.user.profile
    logger.debug(f"Sender Profile: {sender_profile}")

    try:
        recipient_profile = Profile.objects.get(id=data['recipientId'])
        logger.debug(f"Recipient Profile: {recipient_profile}")
    except Profile.DoesNotExist:
        logger.error(f"Recipient profile with id {data['recipientId']} not found")
        return Response({"detail": "Recipient profile not found"}, status=404)

    thread_id = data.get('threadId')
    parent_id = data.get('parentId', None)
    logger.debug(f"Thread ID: {thread_id}, Parent ID: {parent_id}")

    if not thread_id:
        thread = Thrd.objects.create()
        thread.participants.add(sender_profile, recipient_profile)
        logger.debug(f"New thread created: {thread}")
    else:
        try:
            thread = Thrd.objects.get(id=thread_id, participants=sender_profile)
            logger.debug(f"Found thread: {thread}")
        except Thrd.DoesNotExist:
            logger.error(f"Thread with id {thread_id} not found")
            return Response({"detail": "Thread not found"}, status=404)

    parent_message = None
    if parent_id:
        try:
            parent_message = Messg.objects.get(id=parent_id)
            logger.debug(f"Parent Message: {parent_message}")
        except Messg.DoesNotExist:
            logger.error(f"Parent message with id {parent_id} not found")
            return Response({"detail": "Parent message not found"}, status=404)

    message = Messg.objects.create(
        sender=sender_profile,
        recipient=recipient_profile,
        body=data['body'],
        thread=thread,
        parent=parent_message,
        viewed=False  # Set viewed to False by default

    )

    logger.debug(f"Message created: {message}")

    serialized_data = MessageSerializer(message).data
    logger.debug(f"Serialized message data: {serialized_data}")

    return Response({
        "message": serialized_data,
        "thread": {"id": str(thread.id)}
    }, status=status.HTTP_201_CREATED)


