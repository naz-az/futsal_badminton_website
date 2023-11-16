import React, { useState, useEffect,useContext } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Profile from '../components/Profile';
import axios from 'axios';
import Pagination from '../components/Pagination';
import AuthContext from '../context/authContext';


function ProfileScreen() {
    const [profiles, setProfiles] = useState([]);
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const profilesPerPage = 8; // Limit profiles to 4 per page

    const auth = useContext(AuthContext);
    const currentUserId = auth.user?.profile.id; // Ensure this is the correct path to the user ID
    console.log("userz id",currentUserId)


    const fetchProfiles = async (query = '') => {
        const { data } = await axios.get(`/api/profiles/?search_query=${query}`);
        setProfiles(data);
    };

    useEffect(() => {
        fetchProfiles();  // fetch all profiles on initial load
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();  // Prevent the default form submission behavior
        fetchProfiles(query);
    };

    // Get current profiles to display based on current page
    const indexOfLastProfile = currentPage * profilesPerPage;
    const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
    const currentProfiles = profiles.slice(indexOfFirstProfile, indexOfLastProfile);

    return (
        <div>
            <h1>Profiles</h1>
            
            {/* Search Bar */}
            <div className="d-flex justify-content-center align-items-center mb-3">
                <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search for profiles"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="form-control"
                        style={{ width: '300px', marginRight: '10px' }}
                    />
                    <Button variant="outline-secondary" type="submit">Search</Button>
                </form>
            </div>
            
            <Row>
                {currentProfiles.map(profile => (
                    <Col key={profile.id} sm={12} md={6} lg={4} xl={3}>
                        <Profile 
                            profile={profile} 
                            currentUserId={currentUserId} 
                            isCurrentUser={profile.id === currentUserId}  // Pass isCurrentUser prop
                        />
                    </Col>
                ))}
            </Row>

            {/* Pagination buttons */}
            <Pagination 
                currentPage={currentPage} 
                projectsLength={profiles.length}  // rename this prop to something more generic, e.g., itemsLength
                projectsPerPage={profilesPerPage}  // rename this prop as well, e.g., itemsPerPage
                setCurrentPage={setCurrentPage} 
            />
        </div>
    );
}

export default ProfileScreen;
