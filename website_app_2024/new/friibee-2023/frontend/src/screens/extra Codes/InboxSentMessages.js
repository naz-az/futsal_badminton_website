import React, { useState, useEffect } from "react";
import { Container, Button, Tabs, Tab, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const InboxSentMessages = () => {
  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [selectedInbox, setSelectedInbox] = useState([]);
  const [selectedSent, setSelectedSent] = useState([]);

  const navigate = useNavigate();
  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  useEffect(() => {
    axios.get("/api/messages/inbox/", config)
      .then(response => {
        setInboxMessages(response.data);
      })
      .catch(error => {
        console.error('Error fetching inbox messages:', error);
      });

    axios.get("/api/messages/sent/", config)
      .then(response => {
        setSentMessages(response.data);
      })
      .catch(error => {
        console.error('Error fetching sent messages:', error);
      });
  }, []);

  const toggleSelectAll = (type) => {
    if (type === 'inbox') {
      if (selectedInbox.length === inboxMessages.length) {
        setSelectedInbox([]);
      } else {
        setSelectedInbox(inboxMessages.map(msg => msg.id));
      }
    } else {
      if (selectedSent.length === sentMessages.length) {
        setSelectedSent([]);
      } else {
        setSelectedSent(sentMessages.map(msg => msg.id));
      }
    }
  };

  
  const handleSelectMessage = (type, id) => {
    if (type === 'inbox') {
      setSelectedInbox(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setSelectedSent(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
  };

  const deleteSelectedMessages = (type) => {
    const selected = type === 'inbox' ? selectedInbox : selectedSent;

    if (selected.length === 0) { // Check if any checkboxes are selected
      alert("Please select at least one message to delete.");
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete the selected messages?');
    if (!confirmDelete) return; 

    selected.forEach(id => {
      axios.delete(`/api/messages/delete/${id}/`, config)
        .then(() => {
          setInboxMessages(prev => prev.filter(message => message.id !== id));
          setSentMessages(prev => prev.filter(message => message.id !== id));
        })
        .catch(error => {
          console.error('Error deleting the message:', error);
        });
    });

    if (type === 'inbox') setSelectedInbox([]);
    else setSelectedSent([]);
  };

  return (
    <Container>
      <h1>Messages</h1>
      <Button onClick={() => navigate("/send-message")}>Create New Message</Button>
      <Tabs defaultActiveKey="inbox" id="uncontrolled-tab-example" className="mb-3">
        {['inbox', 'sent'].map(type => (
          <Tab eventKey={type} title={type.charAt(0).toUpperCase() + type.slice(1)}>
            <h2>{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
            <Button onClick={() => deleteSelectedMessages(type)}>Delete Selected</Button>
            <Button onClick={() => toggleSelectAll(type)}>Select All</Button>
            <Table hover>
              <thead>
                <tr>
                  <th></th>
                  <th>{type === 'inbox' ? 'Sender' : 'Recipient'}</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {(type === 'inbox' ? inboxMessages : sentMessages).map((message) => (
                  <tr key={message.id} className="message-row" style={type === 'inbox' && !message.is_read ? { fontWeight: 'bold' } : {}}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={(type === 'inbox' ? selectedInbox : selectedSent).includes(message.id)} 
                        onChange={() => handleSelectMessage(type, message.id)} 
                      />
                    </td>

                    <td onClick={() => navigate(`/message/${message.id}/${type}`)}>{message[type === 'inbox' ? 'sender' : 'recipient'] ? message[type === 'inbox' ? 'sender' : 'recipient'].name : "Unknown"}</td>
                    <td onClick={() => navigate(`/message/${message.id}/${type}`)}>{message.subject}</td>
                    <td onClick={() => navigate(`/message/${message.id}/${type}`)}>{message.created}</td>
                    <td>
                      <Button 
                        variant="danger" 
                        onClick={() => {
                          const confirmDelete = window.confirm('Are you sure you want to delete this message?');
                          if (!confirmDelete) return;
                          axios.delete(`/api/messages/delete/${message.id}/`, config)
                            .then(() => {
                              setInboxMessages(prev => prev.filter(msg => msg.id !== message.id));
                              setSentMessages(prev => prev.filter(msg => msg.id !== message.id));
                            })
                        }}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
        ))}
      </Tabs>
    </Container>
  );
};

export default InboxSentMessages;