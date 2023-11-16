import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!email) {
      setMessage('Please enter your email.');
      setVariant('danger');
      return;
    }

    try {
      // Replace with your API endpoint
      await axios.post('/api/forgot-password', { email });
      setMessage('Password reset instructions have been sent to your email.');
      setVariant('success');
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setVariant('danger');
    }
  };

  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title>Forgot Password</Card.Title>
        {message && <Alert variant={variant}>{message}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address:</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Reset Password
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ForgotPasswordForm;
