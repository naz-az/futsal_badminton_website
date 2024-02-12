import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function MsgForm() {
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
        const fetchProfiles = async () => {
            const response = await axios.get('/api/profiles/');
            setProfiles(response.data);
        }
        fetchProfiles();
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

        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            const body = JSON.stringify(formData);
            const res = await axios.post(`/api/create-message/${formData.recipientId}/`, body, config);

            console.log(res.data);

            alert('Message sent successfully');
            navigate('/inbox');

        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
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

            <Form.Group controlId="subject">
                <Form.Label>Subject</Form.Label>
                <Form.Control 
                    type="text" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                />
            </Form.Group>
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
    );
}

export default MsgForm;
