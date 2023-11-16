import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Button, ListGroup, Container, Row, Col, Card, Image } from 'react-bootstrap';
import AuthContext from '../context/authContext'; // Import AuthContext

const BlockedUsersPage = () => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [showProfiles, setShowProfiles] = useState(false);

    const auth = useContext(AuthContext);
    const currentUserId = auth.user ? auth.user.profile.id : null;

    const authHeaders = {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    };

    useEffect(() => {
        fetchBlockedUsers();
        fetchProfiles();
    }, []);

    const fetchBlockedUsers = () => {
        axios.get('/api/blocked-users/', authHeaders)
            .then(res => setBlockedUsers(res.data))
            .catch(err => console.log(err));
    };

    const fetchProfiles = () => {
        axios.get('/api/profiles/', authHeaders)
            .then(res => {
                // Filter out the current user's profile
                const filteredProfiles = res.data.filter(profile => profile.id !== currentUserId);
                setProfiles(filteredProfiles);
            })
            .catch(err => console.log(err));
    };

    const isUserBlocked = userId => {
        return blockedUsers.some(user => user.id === userId);
    };

    const toggleUserBlockStatus = userId => {
        const action = isUserBlocked(userId) ? handleUnblock : handleBlock;
        action(userId);
    };

    const handleBlock = userId => {
        if (window.confirm('Are you sure you want to block this user?')) {
            axios.post(`/api/block-user/${userId}/`, {}, authHeaders)
                .then(() => {
                    fetchBlockedUsers(); // Refresh the list of blocked users
                })
                .catch(err => console.log(err));
        }
    };

    const handleUnblock = userId => {
        if (window.confirm('Are you sure you want to unblock this user?')) {
            axios.post(`/api/unblock-user/${userId}/`, {}, authHeaders)
                .then(() => {
                    fetchBlockedUsers(); // Refresh the list of blocked users
                })
                .catch(err => console.log(err));
        }
    };

    return (
        <Container>
            <h1 className="text-center my-4">Blocked Users</h1>
            <ListGroup>
    {blockedUsers.map(user => (
        <ListGroup.Item key={user.id} className="d-flex align-items-center">
            <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
                <Image 
                    src={user.profile_image} 
                    alt={`${user.username}'s profile`} 
                    roundedCircle 
                    style={{ width: '30px', height: '30px', marginRight: '10px' }}
                />
                {user.username}
            </div>
            <Button variant="outline-danger" onClick={() => handleUnblock(user.id)}>Unblock</Button>
        </ListGroup.Item>
    ))}
</ListGroup>


          <Row className="my-4">
                <Col className="text-center">
                    <Button variant="primary" onClick={() => setShowProfiles(!showProfiles)}>
                        {showProfiles ? 'Hide Users' : 'Block new user'}
                    </Button>
                </Col>
            </Row>

            {showProfiles && (
                <Card className="my-4">
                    <Card.Body>
                        <Card.Title>Select a User to Block or Unblock</Card.Title>
                        <ListGroup>
    {profiles.map(profile => (
        <ListGroup.Item key={profile.id} className="d-flex align-items-center">
            <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
                <Image 
                    src={profile.profile_image} 
                    alt={`${profile.username}'s profile`} 
                    roundedCircle 
                    style={{ width: '30px', height: '30px', marginRight: '10px' }}
                />
                {profile.username}
            </div>
            <Button 
                variant={isUserBlocked(profile.id) ? "outline-success" : "outline-warning"} 
                onClick={() => toggleUserBlockStatus(profile.id)}>
                {isUserBlocked(profile.id) ? 'Unblock' : 'Block'}
            </Button>
        </ListGroup.Item>
    ))}
</ListGroup>

                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default BlockedUsersPage;