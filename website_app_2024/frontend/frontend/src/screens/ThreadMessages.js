import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Table, Container, Button, Modal } from "react-bootstrap";
import AuthContext from "../context/authContext";
import { Link } from "react-router-dom";


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
    // Find the thread based on threadId
    const thread = threads.find(t => t.id === threadId);
    // Get the latest message from this thread
    const latestMessage = thread?.messages[thread.messages.length - 1];
  
    // Check if latestMessage is defined and has a 'viewedBy' property
    if (latestMessage && Array.isArray(latestMessage.viewedBy)) {
      latestMessage.viewedBy.forEach(user => {
        console.log(`Message viewed by: ${user}`);
      });
    } else {
      console.log(`Message not viewed yet or no viewers info available.`);
    }
  
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
      console.log("Other Participant's Username:", otherParticipant);
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
  

  const navigateToUserProfile = (userId, event) => {
    // Prevent event from bubbling up to the row click
    event.stopPropagation();
    // Navigate to the user profile using the userId
    navigate(`/profiles/${userId}`);
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
            {/* <th>Sender of last message</th> */}
            {/* <th>Delete</th> */}
            {/* <th>Seen</th> New column for seen status */}

          </tr>
        </thead>
        <tbody>
          {threads.map((thread) => {
            const { username, profile_image } = getOtherParticipant(
              thread.participants
            );

            const otherParticipant = getOtherParticipant(thread.participants);

            const latestMessageDetails = getLatestMessageDetails(thread.messages);
          
            const latestMessage = thread.messages[thread.messages.length - 1];
            // console.log(`Latest message viewed status: ${latestMessage?.viewed}`); // This will log the viewed status

            const isSeenByCurrentUser = latestMessage.sender.username !== auth.user.profile.username && latestMessage.viewed;
            
                // Render "Seen" column only if the current user is not the sender of the last message
            const seenColumn = latestMessage.sender.username !== auth.user.profile.username
            ? (latestMessage.viewed ? "Viewed" : "Not Viewed")
            : "";

            console.log(latestMessage.viewed_timestamp);
            const getViewedInfo = (message) => {
              if (message.viewed_by.length === 0) {
                return "Not Viewed";
              }
              return `Viewed by: ${message.viewed_by.map(profile => profile.username).join(', ')}`;
            };

            // Determine if the row should be bold
            const isBold = seenColumn === "Not Viewed" && latestMessage.sender.username !== auth.user.profile.username;
            const rowStyle = isBold ? { fontWeight: 'bold' } : {};



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
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img
      src={profile_image}
      alt={username}
      style={{
        width: "50px",
        height: "50px",
        objectFit: "cover",
        borderRadius: "50%",
        marginRight: "10px",
        cursor: "pointer",
      }}
      onClick={(e) => navigateToUserProfile(otherParticipant.id, e)}
    />
    <span
      onClick={(e) => navigateToUserProfile(otherParticipant.id, e)}
      style={{ cursor: "pointer", fontWeight: 'bold', color: 'black' }} // Style change here for bold black color
      >
      {username}
    </span>
  </div>
</td>

                <td style={rowStyle}>{getLatestMessage(thread.messages)}</td>
                <td style={rowStyle}>{formatDate(thread.latest_message_timestamp)}</td>

                <td style={rowStyle}>
          {latestMessageDetails.sender
            ? <>
                {/* {latestMessageDetails.sender.username} */}
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


                {/* <td style={rowStyle}>{seenColumn}</td> */}

                {/* <td>
  {latestMessage.viewed
    ? formatDate(latestMessage.viewed_timestamp)  // Use formatDate to display the timestamp properly
    : "Not Viewed"
  }
</td>

<td>
  {latestMessage.viewed
    ? `${formatDate(latestMessage.viewed_timestamp)} (${getViewedInfo(latestMessage)})`
    : "Not Viewed"
  }
</td> */}

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