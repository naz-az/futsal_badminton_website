import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Image, Col, Row, Alert } from 'react-bootstrap'; // Import Alert

import AuthContext from '../context/authContext';

import friibeeLogo from '../assets/images/friibee-logo.png';
import kickmates from '../assets/images/1kickmates-high-resolution-logo-black.png';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false); // New state to control alert visibility
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(''); 

  const auth = useContext(AuthContext);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/user/account/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log("User profile data:", response.data); // Add this line

      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Modify handleSubmit to use fetchUserProfile
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      username,
      password,
    };
  
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/token/', formData);
  
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        const userProfile = await fetchUserProfile();
  
        if (userProfile) {
          auth.login(userProfile);
          navigate('/');
        } else {
          setAlertMessage("Failed to fetch user profile.");
        }
      } else {
        setAlertMessage("Username or password is incorrect.");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // This is where the server would return a 401 if credentials are wrong
        setAlertMessage("Username or password is incorrect.");
      } else {
        // For other types of errors, you can still show a generic error message
        setAlertMessage("An error occurred during login. Please try again.");
      }
    }
  };


  
  
  useEffect(() => {
    if (localStorage.getItem('justLoggedOut') === 'true') {
      setAlertMessage("Successfully logged out!");
      localStorage.removeItem('justLoggedOut');
    }
  }, []);

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
      <Col md="auto">
          {alertMessage && 
            <Alert variant={alertMessage === "Successfully logged out!" ? "success" : "danger"} onClose={() => setAlertMessage('')} dismissible>
              {alertMessage}
            </Alert>
          }
        <Image src={kickmates} alt="kickmates logo" width={250} className="mx-auto d-block mb-4" />
          {/* <h2 className="text-center">FRIIBEE</h2> */}
          <h4 className="text-center mb-4">Account Login</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username:</Form.Label>
              <Form.Control 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="Enter your username..." 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password:</Form.Label>
              <Form.Control 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Enter your password..." 
              />
            </Form.Group>

            <p className="text-center">
              <a href="/forgot-password">Forget Password?</a>
            </p>
            
            
            <Button variant="info" type="submit" className="w-100 mb-2">Log In</Button>

            {/* Social Login Buttons */}
            <div className="mt-3">
              <Button variant="outline-info" className="w-10 mb-2">
                <i className="fab fa-facebook-f"></i> Login with Facebook
              </Button>
              <Button variant="outline-success" className="w-10 mb-2">
                <i className="fab fa-google"></i> Login with Google
              </Button>
              <Button variant="outline-dark" className="w-10 mb-2">
                <i className="fab fa-apple"></i> Login with Apple
              </Button>
            </div>



            <p className="text-center">
              Don't have an Account? <Button variant="link" onClick={() => navigate("/signup")}>Sign Up</Button>

            </p>

          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginForm;
