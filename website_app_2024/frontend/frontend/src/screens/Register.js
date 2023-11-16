import React, { useState } from 'react';
import axios from 'axios';

function Register() {
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const registerUser = async () => {
        try {
            const response = await axios.post('/api/users/register/', formData);
            console.log("User registered:", response.data);
        } catch (error) {
            console.error("Error registering user:", error.response.data);
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
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
            />
            <button onClick={registerUser}>Register</button>
        </div>
    );
}

export default Register;
