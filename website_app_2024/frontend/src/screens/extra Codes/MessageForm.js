import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

const MessageForm = () => {
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const config = {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    };

    useEffect(() => {
        // Fetch the profiles from your backend.
        // Make sure to exclude the currently logged in user from this list.
        fetch('/api/profiles', config)  // Update this to the correct endpoint.
            .then(response => response.json())
            .then(data => setProfiles(data));
    }, []);

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
            if(data.id) { // Check if the response contains the message id, indicating success
                alert('Message sent successfully!');
            } else {
                alert('Error sending the message.');
            }
        });
    }
    

    return (
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
    );
}

export default MessageForm