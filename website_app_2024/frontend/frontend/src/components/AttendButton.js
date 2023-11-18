import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function AttendButton({ projectId, token, fontSize = '16px' }) { // Default font size is set to 16px
  const [isAttending, setIsAttending] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated
  const isAuthenticated = () => {
    return token != null;
  };

  // Redirect to login if not authenticated
  const redirectToLogin = () => {
    navigate('/login');
  };

  useEffect(() => {
    if (token) {
      axios.get(`/api/attendance/is-attending/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => setIsAttending(response.data.isAttending))
      .catch(error => console.error("Error checking attendance status:", error));
    }
  }, [projectId, token]);

  const handleAttendance = () => {
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }

    const url = isAttending ? `/api/attendance/remove/${projectId}/` : `/api/attendance/add/${projectId}/`;
    const method = isAttending ? 'delete' : 'post';

    axios({ method, url, headers: { Authorization: `Bearer ${token}` } })
    .then(() => setIsAttending(!isAttending))
    .catch(error => console.error(`Error ${isAttending ? 'cancelling attendance' : 'attending'}:`, error));
  };

  return (
    <div>
      {isAttending ? (
        <Button variant="primary" onClick={handleAttendance} style={{ fontSize: fontSize }}>
          <i className="fa-solid fa-xmark" style={{ marginRight: '8px' }}></i>Cancel Attending
        </Button>
      ) : (
        <Button variant="outline-success" onClick={handleAttendance} style={{ fontSize: fontSize }}>
          <i className="fa-solid fa-check" style={{ marginRight: '8px' }}></i> Attend
        </Button>
      )}
    </div>
  );
}

export default AttendButton;
