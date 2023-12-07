import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button, ListGroup, Container, Image } from 'react-bootstrap';
import AuthContext from '../context/authContext';

const BlockedUsersPage = () => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [showProfiles, setShowProfiles] = useState(false);

    const auth = useContext(AuthContext);
    const currentUserId = auth.user ? auth.user.profile.id : null;

    const [searchTerm, setSearchTerm] = useState('');

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
                .then(() => fetchBlockedUsers())
                .catch(err => console.log(err));
        }
    };

    const handleUnblock = userId => {
        if (window.confirm('Are you sure you want to unblock this user?')) {
            axios.post(`/api/unblock-user/${userId}/`, {}, authHeaders)
                .then(() => fetchBlockedUsers())
                .catch(err => console.log(err));
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredProfiles = profiles.filter(profile => 
        profile.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container>
            <h1 className="text-center my-4">Blocked Users</h1>
            <ListGroup>
                {blockedUsers.map(user => (
                    <ListGroup.Item key={user.id} className="d-flex align-items-center">
                        <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
                            <Link to={`/profiles/${user.id}`} style={{ color: 'black', textDecoration: 'none' }}>
                                <Image 
                                    src={user.profile_image} 
                                    alt={`${user.username}'s profile`} 
                                    roundedCircle 
                                    style={{ width: '30px', height: '30px', marginRight: '10px' }}
                                />
                                {user.username}
                            </Link>
                        </div>
                        <Button variant="outline-danger" onClick={() => handleUnblock(user.id)}>Unblock</Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            <Button variant="primary" onClick={() => setShowProfiles(!showProfiles)} className="my-4">
                {showProfiles ? 'Hide Users' : 'Block new user'}
            </Button>

            {showProfiles && (
    <>
    <input 
        type="text" 
        placeholder="Search users..." 
        value={searchTerm}
        onChange={handleSearchChange}
        className="mb-3 form-control"
    />

    <ListGroup>
        {filteredProfiles.map(profile => (  // Use filteredProfiles here
            <ListGroup.Item key={profile.id} className="d-flex align-items-center">
                <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
                    <Link to={`/profiles/${profile.id}`} style={{ color: 'black', textDecoration: 'none' }}>
                        <Image 
                            src={profile.profile_image} 
                            alt={`${profile.username}'s profile`} 
                            roundedCircle 
                            style={{ width: '30px', height: '30px', marginRight: '10px' }}
                        />
                        {profile.username}
                    </Link>
                </div>
                <Button 
                    variant={isUserBlocked(profile.id) ? "outline-success" : "outline-warning"} 
                    onClick={() => toggleUserBlockStatus(profile.id)}>
                    {isUserBlocked(profile.id) ? 'Unblock' : 'Block'}
                </Button>
            </ListGroup.Item>
        ))}
    </ListGroup>
    </>
)}
        </Container>
    );
};

export default BlockedUsersPage;