import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Button, Container} from 'react-bootstrap';
import Profile from '../components/Profile';
import axios from 'axios';
import Pagination from '../components/Pagination';
import AuthContext from '../context/authContext';

function ProfileScreen() {
    const [profiles, setProfiles] = useState([]);
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const profilesPerPage = 8; // Limit profiles to 8 per page

    const auth = useContext(AuthContext);
    // const currentUserId = auth.user?.id ?? null;
    const currentUserId = auth.user?.profile?.id || auth.user?.id;

    console.log("user's id", currentUserId);

    const fetchProfiles = async (query = '') => {
        const { data } = await axios.get(`/api/profiles/?search_query=${query}`);
        setProfiles(data);
    };

    useEffect(() => {
        fetchProfiles();  // fetch all profiles on initial load
    }, []);

    useEffect(() => {
        console.log('Current user data in ProfileScreen:', auth.user);
      }, [auth.user]);
      
    const handleSubmit = (e) => {
        e.preventDefault();  // Prevent the default form submission behavior
        fetchProfiles(query);
    };

    // Filter out the current user's profile
    const filteredProfiles = profiles.filter(profile => currentUserId && profile.id !== currentUserId);

    // Get current profiles to display based on current page
    const indexOfLastProfile = currentPage * profilesPerPage;
    const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
    const currentProfiles = filteredProfiles.slice(indexOfFirstProfile, indexOfLastProfile);

    return (
        <Container fluid="lg" className="mt-3"> {/* Use a Container for centering and padding */}

            
            {/* Search Bar */}
<div className="d-flex justify-content-center align-items-center mb-5 mt-5">
    <div className="container">
        <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6">
                <form onSubmit={handleSubmit} className="d-flex align-items-center">
                    <input
                        type="text"
                        placeholder="Search for members"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="form-control"
                    />
                    <button className="btn btn-outline-secondary ms-1" type="submit">Search</button>
                </form>
            </div>
        </div>
    </div>
</div>

            
            {/* Profiles Grid */}
            <Row>
                {currentProfiles.map(profile => (
                    <Col key={profile.id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                        <Profile 
                            profile={profile} 
                            currentUserId={currentUserId} 
                            isCurrentUser={profile.id === currentUserId}
                        />
                    </Col>
                ))}
            </Row>

            {/* Pagination buttons */}
            <Pagination 
                currentPage={currentPage} 
                projectsLength={filteredProfiles.length}  // Adjusted to filteredProfiles
                projectsPerPage={profilesPerPage}
                setCurrentPage={setCurrentPage} 
            />
        </Container>
    );
}

export default ProfileScreen;