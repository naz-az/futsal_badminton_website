import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Form, Button, InputGroup, FormControl, Alert, Card } from 'react-bootstrap';

import AuthContext from '../context/authContext';


function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('danger');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      
      const response = await axios.post('api/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      }, config);

      setMessage('Password changed successfully!');
      setVariant('success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage(error.response?.data.error || 'An error occurred. Please try again.');
    }
  };

  return (
    <Card className="mt-2">
      <Card.Body>
        <h2 className="text-center mb-5">Change Password</h2>

        {message && <Alert variant={variant}>{message}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-shield-lock-fill"></i>
              </InputGroup.Text>
              <FormControl
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-shield-lock-fill"></i>
              </InputGroup.Text>
              <FormControl
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-4">
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-shield-lock-fill"></i>
              </InputGroup.Text>
              <FormControl
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <div className="text-center">

          <Button variant="primary" type="submit">
            Change Password
          </Button>
          </div>

        </Form>
      </Card.Body>
    </Card>
  );
}

export default ChangePasswordForm;
