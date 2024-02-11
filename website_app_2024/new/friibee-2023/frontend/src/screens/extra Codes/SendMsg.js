import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

function SendMsg() {
    const [formData, setFormData] = useState({
        subject: '',
        body: '',
        recipientId: ''
    });
    const [profiles, setProfiles] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const recipientFromQuery = params.get('recipient');

    useEffect(() => {
        if (recipientFromQuery) {
            setFormData(prevState => ({
                ...prevState,
                recipientId: recipientFromQuery
            }));
        }
    }, [recipientFromQuery]);

    useEffect(() => {
        axios.get('/api/profiles/')
          .then(response => {
            setProfiles(response.data);
          });
    }, []);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        try {
            console.log("Sending Data:", formData);
            const res = await axios.post(`/api/send/`, formData, config);
            console.log("Response Data:", res.data); // Check the response here

            alert('Message sent successfully');
            navigate(`/message1/${res.data.thread}/`); // Updated to use res.data.thread
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <Container>
            <h1>SendMsg.js</h1>
            <Col>
              <Button variant="primary" onClick={() => navigate('/inbox1')}>Back to Inbox</Button>
            </Col>
            <Form onSubmit={handleSubmit}>
                {!recipientFromQuery && (
                    <Form.Group controlId="recipientId">
                        <Form.Label>Recipient:</Form.Label>
                        <Form.Control 
                            as="select" 
                            name="recipientId" 
                            value={formData.recipientId} 
                            onChange={handleChange}>
                            <option value="">Select Recipient</option>
                            {profiles.map(profile => (
                                <option key={profile.id} value={profile.id}>{profile.name || profile.username}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                )}
                <Form.Group controlId="body">
                    <Form.Label>Body</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        name="body" 
                        value={formData.body} 
                        onChange={handleChange} 
                    />
                </Form.Group>
                <Button variant="primary" type="submit">Submit</Button>
            </Form>
        </Container>
    );
}

export default SendMsg;
