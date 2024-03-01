import React, { useState, useEffect, useContext } from "react";
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/authContext';

import friibeeLogo from '../assets/images/friibee.png';

import kickmates from '../assets/images/1kickmates-high-resolution-logo-black.png';

import axios from 'axios'; // Ensure axios is imported

function Header() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext); 

  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
 
  const [isNotificationLinkBold, setIsNotificationLinkBold] = useState(false);

  const location = useLocation(); // Use location here

  const [hasUnreadCommentNotifications, setHasUnreadCommentNotifications] = useState(false);
  const [hasUnreadFollowerNotifications, setHasUnreadFollowerNotifications] = useState(false);
  const [hasUnreadMessageNotifications, setHasUnreadMessageNotifications] = useState(false);
  const [hasUnreadVoteNotifications, setHasUnreadVoteNotifications] = useState(false);

  const [hasUnreadReplyNotifications, setHasUnreadReplyNotifications] = useState(false);


  useEffect(() => {
    console.log('Component mounted, checking notifications...');
    checkNotifications();
  }, []);


    
  // // Function to fetch notifications
  // const checkNotifications = async () => {
  //   try {
  //     console.log('Checking notifications...');
  //     const response = await axios.get('/api/notifications/', {
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`,
  //       }
  //     });
  //     console.log('Notifications response:', response.data);
      
  //     setHasUnreadNotifications(response.data.length > 0);
  //   } catch (error) {
  //     console.error('Error fetching notifications:', error);
  //   }
  // };


    // Function to fetch notifications
    const checkNotifications = async () => {
      if (!auth.isAuthenticated) {
        // If not authenticated, don't make the API call
        console.log('User not authenticated, skipping notifications check.');
        return;
      }
      try {
        console.log('Checking notifications...');

        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        

        const response = await axios.get('/api/notifications', config);

        console.log('Notifications response:', response.data);

        const followerNotifications = response.data.filter(
          (notif) => notif.notification_type === 'FOLLOWER' && notif.read === false
        );
        const commentNotifications = response.data.filter(
          (notif) => notif.notification_type === 'COMMENT' && notif.read === false
        );
  
        const messageNotifications = response.data.filter(
          (notif) => notif.notification_type === 'MESSAGE' && notif.read === false
        );

        const voteNotifications = response.data.filter(
          (notif) => notif.notification_type === 'VOTE' && notif.read === false
        );

        const replyNotifications = response.data.filter(
          (notif) => notif.notification_type === 'REPLY' && notif.read === false
        );

        setHasUnreadFollowerNotifications(followerNotifications.length > 0);
        setHasUnreadCommentNotifications(commentNotifications.length > 0);
        setHasUnreadMessageNotifications(messageNotifications.length > 0);
        setHasUnreadVoteNotifications(voteNotifications.length > 0);
        setHasUnreadReplyNotifications(replyNotifications.length > 0);

        // Set hasUnreadNotifications to true if either has unread follower or comment notifications
        setHasUnreadNotifications(
          followerNotifications.length > 0 || 
          commentNotifications.length > 0 ||
          messageNotifications.length > 0 ||
          voteNotifications.length > 0 ||
          replyNotifications.length > 0
        );

      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };


    // This effect runs when the auth.user changes - for example, after logging in
    useEffect(() => {
      if (auth.user) {
        console.log('User logged in, checking for notifications...');
        checkNotifications();
      }
      
    }, [auth.user]); // Dependency array includes auth.user


  const handleLogout = () => {
    auth.logout();
    localStorage.setItem('justLoggedOut', 'true'); // set a flag in local storage
    navigate('/login');
  };
  
  // console.log("Auth context:", auth);


  let profileImageUrl = '';
  if (auth.isAuthenticated && auth.user) {
    profileImageUrl = auth.user.profile_image || (auth.user.profile && auth.user.profile.profile_image);
    // console.log("User profile image in Header:", profileImageUrl);
  }
  


  const clearNotifications = async () => {
    if (!auth.isAuthenticated) {
      // If we're not authenticated, there's no point in trying to clear notifications
      console.log('Not authenticated, skipping clearing notifications.');
      return;
    }
    
    try {
      await axios.post('/api/notifications/clear/', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setHasUnreadNotifications(false);
      setIsNotificationLinkBold(false);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // If we're unauthorized, log the error and possibly handle it by logging out the user or similar
        console.error('Unauthorized, could not clear notifications:', error);
        // Here you could also force logout or redirect to login
      } else {
        // If it's another kind of error, handle it as well
        console.error('Error clearing notifications:', error);
      }
    }
  };
  
// Click handler for the profile image
const handleProfileClick = () => {
  console.log('Profile image clicked.');
  // Notifications are not cleared here anymore
};

// Click handler for the notification link
const handleNotificationClick = () => {

  navigate('/notifications');

  // clearNotifications();
  // setIsNotificationLinkBold(false);

};



useEffect(() => {
  console.log('Notification state updated:', hasUnreadNotifications);
  setIsNotificationLinkBold(hasUnreadFollowerNotifications || hasUnreadCommentNotifications || hasUnreadVoteNotifications || hasUnreadReplyNotifications);
  if (!hasUnreadNotifications) {
    console.log('CSS should now hide the notification alert!');
  }
}, [hasUnreadFollowerNotifications, hasUnreadCommentNotifications, hasUnreadVoteNotifications, hasUnreadReplyNotifications]);


console.log('isNotificationLinkBold:', isNotificationLinkBold);

  
useEffect(() => {
  // Whenever the location changes, check if we are at '/notifications'
  if (location.pathname === '/notifications') {
    setHasUnreadNotifications(false);
    setIsNotificationLinkBold(hasUnreadFollowerNotifications || hasUnreadCommentNotifications || hasUnreadVoteNotifications || hasUnreadReplyNotifications);
  }
}, [location, hasUnreadFollowerNotifications, hasUnreadCommentNotifications, hasUnreadVoteNotifications, hasUnreadReplyNotifications]);




useEffect(() => {
  if (location.pathname === '/thread' && hasUnreadMessageNotifications) {
    // If the user navigates to the '/thread' route and there are unread message notifications
    clearMessageNotifications();
  }
}, [location, hasUnreadMessageNotifications]);

// This function will be responsible for clearing message notifications
const clearMessageNotifications = async () => {
  try {
    // Call the API to mark message notifications as read
    await axios.post('/api/notifications/clear_message/', {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    setHasUnreadMessageNotifications(false);
    // Update hasUnreadNotifications state if necessary
    setHasUnreadNotifications(hasUnreadCommentNotifications || hasUnreadFollowerNotifications || hasUnreadVoteNotifications);
  } catch (error) {
    console.error('Error clearing message notifications:', error);
  }
};





  return (
<Navbar bg="light" variant="light" expand="lg" collapseOnSelect className="d-flex align-items-center">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>
            <img src={kickmates} alt="Friibee" height="40" />
          </Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <LinkContainer to="/">
              <Nav.Link>Events</Nav.Link>
            </LinkContainer>

            {auth.isAuthenticated && (
    <LinkContainer to="/profiles">
      <Nav.Link>Members</Nav.Link>
    </LinkContainer>
  )}

            <LinkContainer to="/swipe-page">
              <Nav.Link>Swipe</Nav.Link>
            </LinkContainer>



            <LinkContainer to="/categories">
              <Nav.Link>Categories</Nav.Link>
            </LinkContainer>

            {/* {hasUnreadNotifications && (
      <span className="notification-alert-icon" onClick={handleProfileClick}>!</span>
    )} */}


{auth.isAuthenticated ? (
  <NavDropdown title={
    <>
      <span style={{ position: 'relative' }}> {/* This wrapper should be positioned relatively */}
        {hasUnreadNotifications && <span className="notification-alert-icon">!</span>}
        <img src={profileImageUrl} alt={auth.user.username} style={{ width: '35px', height: '35px', borderRadius: '50%', position: 'relative', zIndex: 0 }} />
      </span>
    </>
  } id="username" onClick={handleProfileClick}>


        <LinkContainer to="/user/account">
                  <NavDropdown.Item>Profile</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/following">
                  <NavDropdown.Item>Following</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/followers">
                  <NavDropdown.Item>Followers</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/favourites">
                  <NavDropdown.Item>Bookmarks</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/attending">
                <NavDropdown.Item>Attending</NavDropdown.Item>
            </LinkContainer>

                <LinkContainer to="/thread">
  <NavDropdown.Item 
    className={hasUnreadMessageNotifications ? 'bold-notification-link' : ''}
    onClick={() => hasUnreadMessageNotifications && clearMessageNotifications()}

  >
    Inbox
  </NavDropdown.Item>
</LinkContainer>


                <LinkContainer to="/notifications">
                <NavDropdown.Item 
  onClick={handleNotificationClick} 
  className={isNotificationLinkBold ? 'bold-notification' : ''}
>
  Notifications
</NavDropdown.Item>



        </LinkContainer>
                <LinkContainer to="/settings">
                  <NavDropdown.Item>Settings</NavDropdown.Item>
                </LinkContainer>



                <NavDropdown.Divider />
                <LinkContainer to="/login">
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            ) : (
              <LinkContainer to="/login">
                <Nav.Link><i className="fas fa-user"></i>Login</Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}



export default Header;
