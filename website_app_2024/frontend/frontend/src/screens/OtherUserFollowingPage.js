import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/authContext';

function OtherUserFollowingPage() {
    const { profileId } = useParams();
    const [following, setFollowing] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const isAuthenticated = user && user.profile && user.profile.id;

    // Fetching following list for the user profile being viewed
    // Fetching following list for the user profile being viewed
    const fetchFollowing = async () => {
      setIsFetching(true);
      try {
          const response = await axios.get(`/api/profiles/${profileId}/following/`); // Removed auth header
          const followingData = response.data;

          // Only check if the current user follows each of them when authenticated
          if (isAuthenticated) {
              const config = {
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              };
              const updatedFollowingData = await Promise.all(
                  followingData.map(async (profile) => {
                      const isFollowingResponse = await axios.get(`/api/profiles/${profile.id}/is_following/`, config);
                      return { ...profile, is_following: isFollowingResponse.data.is_following };
                  })
              );
              setFollowing(updatedFollowingData);
          } else {
              setFollowing(followingData); // Just set the data without checking if the current user follows them
          }
      } catch (error) {
          console.error('Error fetching following', error);
      } finally {
          setIsFetching(false);
      }
  };

    // Use fetchFollowing in useEffect
    useEffect(() => {
      fetchFollowing();
  }, [profileId, isAuthenticated]);
  
    const handleFollowUnfollow = async (profile, isFollowing) => {
      if (!isAuthenticated) {
        
        navigate('/login'); // Redirect to login if not authenticated
        return;
    }
        if (isFollowing) {
            // Show confirmation dialog only when trying to unfollow
            const confirmUnfollow = window.confirm("Are you sure you want to unfollow this user?");
            if (!confirmUnfollow) {
                // If the user cancels, early return and do nothing
                return;
            }
        }
        const config = {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        };
        const endpoint = isFollowing ? `/api/profiles/${profile.id}/unfollow/` : `/api/profiles/${profile.id}/follow/`;
        try {
            await axios.post(endpoint, {}, config);
            await fetchFollowing(); // After follow/unfollow, fetch following list again to update the UI
        } catch (error) {
            console.error('Error toggling follow state', error);
        }
    };
  
    if (isFetching) {
      return <div>Loading...</div>;
    }
  
    return (
        <div className="my-md">
            <h1>Following</h1>

            <h2>This user is following {following.length} {following.length === 1 ? 'user' : 'users'}</h2>

            {following.map(profile => (
  <Card key={profile.id} className="mb-3 d-flex flex-row align-items-center">
    <div style={{ width: '10%', marginRight: '20px' }}>
      {/* Conditionally render Link based on whether the profile belongs to the current user */}
      {user.profile.id === profile.id ? (
        <Link to="/user/account">
          <Card.Img src={profile.profile_image} style={{ width: '150px', height: '200px', objectFit: 'cover' }} />
        </Link>
      ) : (
        <Link to={`/profiles/${profile.id}`}>
          <Card.Img src={profile.profile_image} style={{ width: '150px', height: '200px', objectFit: 'cover' }} />
        </Link>
      )}
    </div>
    <Card.Body className="d-flex flex-column justify-content-center" style={{ width: '50%' }}>
      <Card.Title>
        {/* Conditionally render Link based on whether the profile belongs to the current user */}
        {user.profile.id === profile.id ? (
          <Link to="/user/account" style={{ textDecoration: 'none', color: 'inherit' }}>
            {profile.name}
          </Link>
        ) : (
          <Link to={`/profiles/${profile.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {profile.name}
          </Link>
        )}
      </Card.Title>
      <Card.Text>
        {profile.short_intro?.slice(0, 60) ?? ''}
      </Card.Text>
    </Card.Body>
    <div className="d-flex justify-content-center align-items-center" style={{ width: '40%' }}>
      {user.profile.id !== profile.id && (
        <Button 
          variant={profile.is_following ? "secondary" : "primary"} 
          onClick={() => handleFollowUnfollow(profile, profile.is_following)}
          className="mx-4">
          {profile.is_following ? 'Unfollow' : 'Follow'}
        </Button>
      )}
    </div>
  </Card>
))}


        </div>
    );
}

export default OtherUserFollowingPage;
