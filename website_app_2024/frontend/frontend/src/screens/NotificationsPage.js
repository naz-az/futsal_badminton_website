// NotificationsPage.js

import React, { useState, useEffect, useContext } from 'react';
import { Container, ListGroup, Badge, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/authContext';
import { Link } from 'react-router-dom'; // Import Link if you're using React Router



const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const auth = useContext(AuthContext);

  useEffect(() => {
    
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        // Sort the notifications by timestamp in descending order before setting the state
        const sortedNotifications = response.data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (auth.isAuthenticated) {
      fetchNotifications();
    }
  }, [auth.isAuthenticated]);

  // Clear all "new" styling when the page loads or is revisited
//   useEffect(() => {
//     setNotifications(notifications.map(n => ({ ...n, read: true })));
//   }, []);


  const markAsRead = async (notifId) => {
    try {
      await axios.post('/api/notifications/mark_as_read/', { id: notifId }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Update the notification as read in the state
      setNotifications(notifications.map(notif => 
        notif.id === notifId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };


  // Helper function to format date and time
const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString(); // This will format the date and time according to the locale
};



  // Helper function to render notification item
  const renderNotificationItem = (notif) => {

    console.log('notif', notif);

    const dateTime = formatDateTime(notif.timestamp);

    switch (notif.notification_type) {
      case 'FOLLOWER':
        const profileLink = notif.follower.id === auth.user.profile.id ? '/user/account' : `/profiles/${notif.follower.id}`;

        return (
          <div className="container">
            <div className="row align-items-center">
              <div className="col-auto">
              <Link to={profileLink}>
                  <img 
                    src={notif.follower.profile_image} 
                    alt={notif.follower.username} 
                    className="rounded-circle" 
                    style={{ width: '40px', height: '40px' }} 
                  />
                </Link>
              </div>
              <div className="col">
              <Link to={profileLink} className="no-underline">
                  <strong>{notif.follower.username}</strong>
                </Link>
                <small> started following you.</small>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <small className="text-muted">{dateTime}</small>
              </div>
            </div>
          </div>
        );
      
      
        case 'COMMENT':
          const commentProfileLink = notif.comment.user.id === auth.user.profile.id ? '/user/account' : `/profiles/${notif.comment.user.id}`;

          return (
            <div className="d-flex flex-column" style={{ width: '100%' }}>
              <div className="d-flex justify-content-between">
                <div className="d-flex align-items-center">
                <Link to={commentProfileLink}>
                    <img 
                      src={notif.comment.user.profile_image} 
                      alt={notif.comment.user.username} 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '20px' }} 
                    />
                  </Link>
                  <Link to={commentProfileLink} className="no-underline">
                    <strong>{notif.comment.user.username}</strong>
                  </Link>
                  {/* Added margin-left here */}
                  <small style={{ marginLeft: '5px' }}>commented <strong>"{notif.comment.content}"</strong> on your project: </small>
                </div>
                <div className="d-flex align-items-center">
                  <Link to={`/project/${notif.comment.project.id}`} className="no-underline">
                    <strong>{notif.comment.project.title}</strong>
                  </Link>
                  <Link to={`/project/${notif.comment.project.id}`}>
                    <img
                      src={notif.comment.project.featured_image}
                      alt={notif.comment.project.title}
                      style={{ width: '40px', height: '40px', marginLeft: '10px' }}
                    />
                  </Link>
                </div>
              </div>
              <small className="text-muted">{dateTime}</small>
            </div>
          );
        
        
        

          case 'VOTE':
            const voteProfileLink = notif.voting_user.id === auth.user.profile.id ? '/user/account' : `/profiles/${notif.voting_user.id}`;

            return (
              <div className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                  <Link to={voteProfileLink}>
                      <img 
                        src={notif.voting_user.profile_image} 
                        alt={notif.voting_user.username} 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '20px' }} 
                      />
                    </Link>
                    <Link to={voteProfileLink} className="no-underline">
                      <strong>{notif.voting_user.username}</strong>
                    </Link>
                    <small style={{ marginLeft: '5px' }}>has liked your project:</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <Link to={`/project/${notif.project.id}`} className="no-underline">
                      <strong className="ml-1">{notif.project.title}</strong>
                    </Link>
                    <Link to={`/project/${notif.project.id}`}>
                      <img
                        src={notif.project.featured_image}
                        alt={notif.project.title}
                        style={{ width: '40px', height: '40px', marginLeft: '10px' }}
                      />
                    </Link>
                  </div>
                </div>
                <small className="text-muted">{dateTime}</small>
              </div>
            );
          
          
            case 'REPLY':
              const replyProfileLink = notif.comment.user.id === auth.user.profile.id ? '/user/account' : `/profiles/${notif.comment.user.id}`;

              return (
                <div className="d-flex flex-column">
                  <div className="d-flex justify-content-between">
                    <div className="d-flex align-items-center">
                    <Link to={replyProfileLink}>
                        <img 
                          src={notif.comment.user.profile_image} 
                          alt={notif.comment.user.username} 
                          style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} 
                        />
                      </Link>
                      <Link to={replyProfileLink} className="no-underline">
                        <strong style={{ marginRight: '5px' }}>{notif.comment.user.username}</strong>
                      </Link>
                      <small style={{ marginRight: '5px' }}>has replied</small>
                      <span style={{ marginRight: '5px' }}><strong>"{notif.comment.content}"</strong></span>
                      <small style={{ marginRight: '5px' }}>on your comment</small>
                      <span style={{ marginRight: '5px' }}><strong>"{notif.replied_comment.content}"</strong></span> on project:
                    </div>
                    <div className="d-flex align-items-center">
                      <Link to={`/project/${notif.comment.project.id}`} className="no-underline d-flex align-items-center">
                        <strong className="mr-2">{notif.comment.project.title}</strong>
                      </Link>
            
                      <Link to={`/project/${notif.comment.project.id}`}>
                        <img
                          src={notif.comment.project.featured_image}
                          alt={notif.comment.project.title}
                          style={{ width: '40px', height: '40px', marginLeft: '10px' }} 
                        />
                      </Link>
                    </div>
                  </div>
                  <div style={{ marginLeft: '40px' }}>
                    <small className="text-muted">{dateTime}</small>
                  </div>
                </div>
              );
            
            default:
              return null;
        }
      };


      
    // Group notifications by type
    const followerNotifications = notifications.filter(notif => notif.notification_type === 'FOLLOWER');
    const commentNotifications = notifications.filter(notif => notif.notification_type === 'COMMENT');
    const voteNotifications = notifications.filter(notif => notif.notification_type === 'VOTE');



    return (
        <Container>
          <h1>Notifications</h1>
          <Row>
  <Col sm={12} className="mb-5">
    <Card>
      <Card.Header>Followers</Card.Header>
      <ListGroup variant="flush">
        {followerNotifications.length > 0 ? (
          followerNotifications.map((notif) => (
            <ListGroup.Item 
              key={notif.id}
              action
              onClick={() => markAsRead(notif.id)}
              className={!notif.read ? 'text-danger' : ''}
            >
              {renderNotificationItem(notif)}
              {!notif.read && <Badge bg="primary" pill>New</Badge>}
            </ListGroup.Item>
          ))
        ) : (
          <Card.Body>No new followers.</Card.Body>
        )}
      </ListGroup>
    </Card>
  </Col>
  <Col sm={12} className="mb-5">
    <Card>
      <Card.Header>Comments</Card.Header>
      <ListGroup variant="flush">
        {commentNotifications.length > 0 ? (
          commentNotifications.map((notif) => (
            <ListGroup.Item 
              key={notif.id}
              action
              onClick={() => markAsRead(notif.id)}
              className={!notif.read ? 'text-danger' : ''}
            >
              {renderNotificationItem(notif)}
              {!notif.read && <Badge bg="primary" pill>New</Badge>}
            </ListGroup.Item>
          ))
        ) : (
          <Card.Body>No new comments.</Card.Body>
        )}
      </ListGroup>
    </Card>
  </Col>


  <Col sm={12} className="mb-5">
        <Card>
          <Card.Header>Votes</Card.Header>
          <ListGroup variant="flush">
            {voteNotifications.length > 0 ? (
              voteNotifications.map((notif) => (
                <ListGroup.Item 
                  key={notif.id}
                  action
                  onClick={() => markAsRead(notif.id)}
                  className={!notif.read ? 'text-danger' : ''}
                >
                  {renderNotificationItem(notif)}
                  {!notif.read && <Badge bg="primary" pill>New</Badge>}
                </ListGroup.Item>
              ))
            ) : (
              <Card.Body>No new votes.</Card.Body>
            )}
          </ListGroup>
        </Card>
      </Col>




      <Col sm={12}>
  <Card>
    <Card.Header>Replied Comments</Card.Header>
    <ListGroup variant="flush">
      {/* Filter notifications for 'REPLY' */}
      {notifications.filter(notif => notif.notification_type === 'REPLY').length > 0 ? (
        notifications.filter(notif => notif.notification_type === 'REPLY').map((notif) => (
          <ListGroup.Item 
            key={notif.id}
            action
            onClick={() => markAsRead(notif.id)}
            className={!notif.read ? 'text-danger' : ''}
          >
            {renderNotificationItem(notif)}
            {!notif.read && <Badge bg="primary" pill>New</Badge>}
          </ListGroup.Item>
        ))
      ) : (
        <Card.Body>No replies on your comments.</Card.Body>
      )}
    </ListGroup>
  </Card>
</Col>






</Row>
        </Container>
      );
    };
    
    export default NotificationsPage;