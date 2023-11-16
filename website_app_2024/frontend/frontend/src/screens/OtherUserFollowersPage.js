import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Button } from 'react-bootstrap';
import AuthContext from '../context/authContext';


function OtherUserFollowersPage() {
  const [followers, setFollowers] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const { profileId } = useParams();
  const navigate = useNavigate();


  const { user } = useContext(AuthContext);

    // Add a check to see if the user is authenticated
    const isAuthenticated = user && user.profile && user.profile.id;
    const currentUserId = isAuthenticated ? user.profile.id : null;
// console.log("user id",currentUserId )
// console.log("profileId id",profileId )

const config = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
};


  const fetchFollowers = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get(`/api/profiles/${profileId}/followers/`);
      const followersData = response.data;


                // Only check if the current user follows each of them when authenticated
                if (isAuthenticated) {
                  const config = {
                      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                  };

      const updatedFollowersData = await Promise.all(
        followersData.map(async (follower) => {
          const isFollowingResponse = await axios.get(`/api/profiles/${follower.id}/is_following/`, config);
          return { ...follower, isFollowing: isFollowingResponse.data.is_following };
        })
      );

      setFollowers(updatedFollowersData);
    } else {
      setFollowers(followersData); // Just set the data without checking if the current user follows them

    }
  } catch (error) {
      console.error('Error fetching followers', error);
    } finally {
      setIsFetching(false);
    }
  };



    // Use fetchFollowing in useEffect
    useEffect(() => {
      fetchFollowers();
  }, [profileId, isAuthenticated]);

const handleFollowToggle = async (followerProfileId, isFollowing) => {
      // Add check for authentication
      if (!isAuthenticated) {
        navigate('/login'); // Redirect or show a message
        return;
      }

  if (isFollowing) {
    // Show confirmation dialog when trying to unfollow
    const confirmUnfollow = window.confirm("Are you sure you want to unfollow this user?");
    if (!confirmUnfollow) {
      // If the user cancels, early return and do nothing
      return;
    }
  }
  
  const endpoint = isFollowing ? `/api/profiles/${followerProfileId}/unfollow/` : `/api/profiles/${followerProfileId}/follow/`;
  try {
    // Use config in the axios.post request to pass the Authorization header
    await axios.post(endpoint, {}, config);
    setFollowers(
      followers.map(follower =>
        follower.id === followerProfileId ? { ...follower, isFollowing: !isFollowing } : follower
      )
    );
  } catch (error) {
    console.error('Error toggling follow state', error);
  }
};


  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="my-md">

<h1>Followers</h1>

  <h2>This user has {followers.length} {followers.length === 1 ? 'follower' : 'followers'}</h2>

  {followers.map(profile => (
  <Card key={profile.id} className="mb-3 d-flex flex-row align-items-center">
    <div style={{ width: '10%', marginRight: '20px' }}>
      {/* Conditionally render Link based on whether the profile belongs to the current user */}
      {currentUserId === profile.id ? (
        <Link to="/user/account">
          <Card.Img src={profile.profile_image} style={{ width: '150px', height: '200px', objectFit: 'cover' }}/>
        </Link>
      ) : (
        <Link to={`/profiles/${profile.id}`}>
          <Card.Img src={profile.profile_image} style={{ width: '150px', height: '200px', objectFit: 'cover' }}/>
        </Link>
      )}
    </div>
    <Card.Body className="d-flex flex-column justify-content-center" style={{ width: '50%' }}>
      <Card.Title>
        {/* Conditionally render Link based on whether the profile belongs to the current user */}
        {currentUserId === profile.id ? (
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
    {currentUserId !== profile.id && ( // Add this condition
        <Button 
          variant={profile.isFollowing ? "secondary" : "primary"} 
          onClick={() => handleFollowToggle(profile.id, profile.isFollowing)}
          className="mx-4">
          {profile.isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      )}
    </div>
  </Card>
))}

    </Container>
  );
}

export default OtherUserFollowersPage;
