import React, { useState, useContext } from "react";
import { Container, Row, Col, Button, Modal, Form, FormControl  } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // make sure axios is imported
import AuthContext from "../context/authContext";


const SettingsPage = () => {

  const [showModal, setShowModal] = useState(false);
  const auth = useContext(AuthContext); // Get the auth context
  const navigate = useNavigate(); // This hook provides navigation in function components

  const [password, setPassword] = useState(''); // State to hold the password input

  // Inside a React component where the user initiates account deactivation

  const handleDeactivateAccount = async () => {
    console.log("Attempting to deactivate account");
    try {
      const response = await axios.delete('/api/deactivate-account/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    
      // Check for success response code (204 No Content)
      if (response.status === 204) {
        // Successfully deleted the account
        localStorage.removeItem('token');
        auth.logout();
        navigate('/login');
        alert('Your account has been deactivated successfully.');
      } else {
        // Handle any other status codes appropriately
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      // Check if the error object has a response property
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      console.error('Error config:', error.config);
      alert('There was an error while deactivating your account.');
    }
    
  };
  

  const handleDeactivateClick = () => {
    setShowModal(true);
  };

  const handleCancelDeactivation = () => {
    setShowModal(false);
  };



  const handleConfirmDeactivation = async () => {
    if (!password) {
      alert('Please enter your password to confirm deactivation.');
      return;
    }

    try {
      // Add a call to your backend API to verify the password before deactivating the account
      // For instance, using the change_password endpoint or another endpoint that can verify passwords
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      };
      const response = await axios.post('/api/verify-password/', { password }, config);

      // Assuming your backend sends a 200 status for a successful password verification
      if (response.status === 200) {
        handleDeactivateAccount(); // Only deactivate the account if the password is correct
        setShowModal(false);
      } else {
        alert('Incorrect password.');
      }
    } catch (error) {
      alert(error.response?.data.error || 'An error occurred. Please try again.');
    }
  };
  







  return (
    <Container style={{ marginTop: "50px", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Row className="justify-content-center">
      <Col style={{ textAlign: 'center' }}> {/* Adjusted for central alignment */}
          <h2 style={{ marginTop: '20px', marginBottom: '40px' }}>Settings</h2>
          <div>
            <h5>Edit Account</h5>
            <Link to="/user/edit-account" className="btn btn-light">
              Edit Account
            </Link>
          </div>
          <br />
          <div>
            <h5>Privacy Settings</h5>
            <Link to="/blocked-users">
              <Button variant="light">Manage Blocked Users</Button>
            </Link>
          </div>
          <br />
          <div>
            <h5>Notification Settings</h5>
            <Link to="/notification-settings">
              <Button variant="light">Notification Settings</Button>
            </Link>
          </div>
          <br />
          <div>
            <h5>Change Password</h5>
            <Link to="/change-password">
              <Button variant="light">Change Password</Button>
            </Link>
          </div>
          <br />
          <div>
            <h5>Deactivate Account</h5>
            <Button variant="primary" onClick={handleDeactivateClick}>
              Deactivate Account
            </Button>
          </div>
          <br />
          <Modal show={showModal} onHide={handleCancelDeactivation}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Account Deactivation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to deactivate your account? This action is not reversible and all your data will be permanently deleted.</p>
              <Form>
                <Form.Group controlId="passwordConfirmation">
                  <Form.Label>Confirm your password to continue</Form.Label>
                  <FormControl
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCancelDeactivation}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDeactivation}>
                Confirm Deactivation
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsPage;