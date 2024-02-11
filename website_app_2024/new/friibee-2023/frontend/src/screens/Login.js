import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';  // make sure the path is correct

function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();
    const { setLoggedInUser } = useContext(AuthContext);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const loginUser = async () => {
      try {
        const response = await api.post('users/token/', formData);
        if (response.data && response.data.access) {
              localStorage.setItem('accessToken', response.data.access);
              console.log("User logged in:", response.data);
              setLoggedInUser(formData.username);
              navigate('/');  // or you can navigate to a specific route in your React app
          } else {
              setErrorMessage("Username OR password did not work");
          }
      } catch (error) {
          console.error("Error logging in:", error.response && error.response.data);
          setErrorMessage("Failed to login. Please try again.");
      }
  };
  

    return (
        <div>
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
            />
            <button onClick={loginUser}>Login</button>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        </div>
    );
}

export default Login;
