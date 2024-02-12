import React from 'react';
import axios from 'axios';

function Logout() {
    const logoutUser = async () => {
        try {
            await axios.post('/api/users/logout/');
            // Clear your tokens here, typically from local storage or context.
            console.log("User logged out");
        } catch (error) {
            console.error("Error logging out:", error.response.data);
        }
    };

    return (
        <div>
            <button onClick={logoutUser}>Logout</button>
        </div>
    );
}

export default Logout;
