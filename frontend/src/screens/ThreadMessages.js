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

  useEffect(() => {
    const fetchThreads = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("/api/threads/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setThreads(
          response.data.sort(
            (a, b) =>
              new Date(b.latest_message_timestamp) -
              new Date(a.latest_message_timestamp)
          )
        );
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
    if (messages.length === 0) return "No messages yet";
  
    const messageBody = messages[messages.length - 1].body;
    const words = messageBody.split(/\s+/); // Split message into words
    
    if (words.length > 6) {
      return words.slice(0, 6).join(" ") + "..."; // Join first 20 words and append ellipsis
    } else {
      return messageBody; // Return the original message if it's 20 words or less
    }
  };
  

  const getLatestMessageDetails = (messages) => {
    if (messages.length === 0) {
      return { body: "No messages yet", sender: null };
    }
    const lastMessage = messages[messages.length - 1];
    return { body: lastMessage.body, sender: lastMessage.sender };
  };

  const showDeleteModal = (threadId, event) => {
    event.stopPropagation();
    setSelectedThreads([threadId]);
    setShowDeleteConfirm(true);
  };

  const toggleThreadSelection = (threadId) => {
    setSelectedThreads((prevSelected) =>
      prevSelected.includes(threadId)
        ? prevSelected.filter((id) => id !== threadId)
        : [...prevSelected, threadId]
    );
  };

  const selectAllThreads = () => {
    setSelectedThreads(
      selectedThreads.length === threads.length
        ? []
        : threads.map((thread) => thread.id)
    );
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

  const getOtherParticipant = (participants) =>
    participants.find(
      (participant) => participant.username !== auth.user.profile.username
    ) || {};

  return (
    <Container fluid className="my-container">
      <h2 className="text-center mt-3 mb-4">Inbox</h2>
      <div className="d-flex justify-content-between flex-wrap mb-3">
        <Button variant="secondary" onClick={() => navigate("/send")}>
          <i class="fa-solid fa-plus"></i> Create New Message
        </Button>
        <Button
          variant="primary"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={selectedThreads.length === 0}
        >
          Delete Selected
        </Button>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th className="vertical-center" >
                <span
                  onClick={selectAllThreads}
                  style={{
                    textDecoration: "none",
                    cursor: "pointer",
                    color: "#FFA07A",
                  }}
                >
                  {selectedThreads.length === threads.length
                    ? "Deselect All"
                    : "Select All"}
                </span>
              </th>
              <th className="vertical-center">User</th>
              <th className="vertical-center">Message</th>
              <th className="vertical-center" >Date/Time</th>
              <th></th>
              <th className="vertical-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {threads.map((thread) => {
              const otherParticipant = getOtherParticipant(thread.participants);
              const latestMessageDetails = getLatestMessageDetails(
                thread.comm_messages
              );
              const latestMessage =
                thread.comm_messages[thread.comm_messages.length - 1];
              const seenColumn =
                latestMessage.sender.username !== auth.user.profile.username
                  ? latestMessage.viewed
                    ? "Viewed"
                    : "Not Viewed"
                  : "";
              const isBold =
                seenColumn === "Not Viewed" &&
                latestMessage.sender.username !== auth.user.profile.username;
              const rowStyle = isBold ? { fontWeight: "bold" } : {};

              return (
                <tr
                  key={thread.id}
                  onClick={() => handleThreadClick(thread.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="vertical-center">
                    {" "}
                    {/* Center checkbox */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      {" "}
                      {/* Centering wrapper for checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedThreads.includes(thread.id)}
                        onChange={() => toggleThreadSelection(thread.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </td>
                  <td>
                    <div 
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {" "}
                      {/* Adjusted for column layout */}
                      <img
                        src={otherParticipant.profile_image}
                        alt={otherParticipant.username}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          marginBottom: "5px",
                        }}
                      />
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "black",
                          textAlign: "center",
                        }}
                      >
                        {otherParticipant.username}
                      </span>
                    </div>
                  </td>
                  <td className="vertical-center" style={rowStyle}>
                    {getLatestMessage(thread.comm_messages)}
                  </td>{" "}
                  {/* Text center */}
                  <td className="vertical-center" style={rowStyle}>
                    {formatDate(thread.latest_message_timestamp)}
                  </td>{" "}
                  {/* Text center */}
                  <td className="vertical-center" style={rowStyle}>
                    {" "}
                    {/* Center "Your Turn" button if needed */}
                    {latestMessageDetails.sender &&
                      latestMessageDetails.sender.username !==
                        auth.user.profile.username && (
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          {" "}
                          {/* Centering wrapper */}
                          <Button variant="secondary" disabled>
                            Your turn
                          </Button>
                        </div>
                      )}
                  </td>
                  <td className="vertical-center">
                    {" "}
                    {/* Center delete button */}
                    <Button
                      variant="primary"
                      onClick={(e) => showDeleteModal(thread.id, e)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

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
