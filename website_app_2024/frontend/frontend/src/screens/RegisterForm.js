import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Form, Button, Container, Image, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import friibeeLogo from '../assets/images/friibee-logo.png';
import AuthContext from '../context/authContext';
import kickmates from '../assets/images/1kickmates-high-resolution-logo-black.png';


function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    password2: '', // Confirm password
  });

  const auth = useContext(AuthContext);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      alert("Passwords don't match");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('token', response.data.access);

      // Fetch the user's profile with the token
      const profileResponse = await axios.get('http://127.0.0.1:8000/api/user/account/', {
        headers: {
          Authorization: `Bearer ${response.data.access}`
        }
      });

      // Update the AuthContext
      auth.login(profileResponse.data);

      navigate('/user/edit-account');  // Navigate to edit profile after registration
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle registration failure
    }
  };
  
  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md="auto">
          <Image src={kickmates} alt="Friibee logo" width={250} className="mx-auto d-block mb-3" />
          <h3 className="text-center">Register an Account</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange} 
                placeholder="Enter your name..." />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange} 
                placeholder="Enter your email..." />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange} 
                placeholder="Choose a username..." />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange} 
                placeholder="Enter your password..." />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password confirmation</Form.Label>
              <Form.Control 
                type="password" 
                name="password2"
                value={formData.password2}
                onChange={handleChange} 
                placeholder="Confirm your password..." />
            </Form.Group>

            <Button variant="info" type="submit" className="w-100 mb-2">Register</Button>

            {/* Social Login Buttons */}
            <div className="mt-3">
              {/* Social buttons would need their own handlers */}
              <Button variant="outline-info" className="w-10 mb-2">
                <i className="fab fa-facebook-f"></i> Sign Up with Facebook
              </Button>
              <Button variant="outline-success" className="w-10 mb-2">
                <i className="fab fa-google"></i> Sign Up with Google
              </Button>
              <Button variant="outline-dark" className="w-10 mb-2">
                <i className="fab fa-apple"></i> Sign Up with Apple
              </Button>
            </div>
            
            <p className="text-center">
              Already have an Account? <Button variant="link" onClick={() => navigate("/login")}>Log In</Button>
            </p>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterForm;
