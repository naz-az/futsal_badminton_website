import React, { useState, useEffect } from "react";
import { Container, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const InboxMsg = () => {
  const [inboxMessages, setInboxMessages] = useState([]);
  const [selectedInbox, setSelectedInbox] = useState([]);

  const navigate = useNavigate();
  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  useEffect(() => {
    const threadId = localStorage.getItem("threadId");
  
    // Check if threadId is available
    if (!threadId) {
      console.error("Thread ID is null or undefined.");
      return; // Prevents making an invalid API call
    }
  
    axios.get(`/api/messages/${threadId}/`, config)
      .then(response => {
        setInboxMessages(response.data);
      })
      .catch(error => {
        console.error('Error fetching inbox messages:', error);
      });
  }, []);
  

  const toggleSelectAll = () => {
    if (selectedInbox.length === inboxMessages.length) {
      setSelectedInbox([]);
    } else {
      setSelectedInbox(inboxMessages.map(msg => msg.id));
    }
  };

  const handleSelectMessage = id => {
    setSelectedInbox(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const deleteSelectedMessages = () => {
    if (selectedInbox.length === 0) {
      alert("Please select at least one message to delete.");
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete the selected messages?');
    if (!confirmDelete) return; 

    selectedInbox.forEach(id => {
      axios.delete(`/api/messages/delete/${id}/`, config)
        .then(() => {
          setInboxMessages(prev => prev.filter(message => message.id !== id));
        })
        .catch(error => {
          console.error('Error deleting the message:', error);
        });
    });

    setSelectedInbox([]);
  };

  return (
    <Container>
      <h1>InboxMsg.js</h1>
      <Button onClick={() => navigate("/send-message1")}>Create New Message</Button>
      <h2>Messages</h2>
      <Button onClick={deleteSelectedMessages}>Delete Selected</Button>
      <Button onClick={toggleSelectAll}>Select All</Button>
      <Table hover>
        <thead>
          <tr>
            <th></th>
            <th>User</th>
            <th>Message</th>
            <th>Date</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {inboxMessages.map((message) => (
            <tr key={message.id} className="message-row" style={!message.is_read ? { fontWeight: 'bold' } : {}}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedInbox.includes(message.id)} 
                  onChange={() => handleSelectMessage(message.id)} 
                />
              </td>
              
              <td onClick={() => navigate(`/message1/${message.id}/inbox`)}>
                {message.recipient && message.recipient.profile_image &&
                  <img src={message.recipient.profile_image} alt="Profile" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }} />
                }
                <div>{message.recipient ? message.recipient.name : "Unknown"}</div>
              </td>
              <td onClick={() => navigate(`/message1/${message.id}/inbox`)}>{message.body}</td>
              <td onClick={() => navigate(`/message1/${message.id}/inbox`)}>{new Date(message.created).toLocaleString()}</td>

              <td>
                <Button 
                  variant="danger" 
                  onClick={() => {
                    const confirmDelete = window.confirm('Are you sure you want to delete this message?');
                    if (!confirmDelete) return;
                    axios.delete(`/api/messages/delete/${message.id}/`, config)
                      .then(() => {
                        setInboxMessages(prev => prev.filter(msg => msg.id !== message.id));
                      });
                  }}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default InboxMsg;