import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import AuthContext from '../context/authContext'; // Update this import for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from '@react-navigation/native';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const auth = useContext(AuthContext);

  const navigation = useNavigation();

  const navigateToProfile = (profileLink, profileId) => {
    if (profileLink === 'UserAccount') {
      navigation.navigate('UserAccount');
    } else if (profileLink === 'UserProfileDetail') {
      navigation.navigate('UserProfileDetail', { id: profileId });
    }
  };
  
  const navigateToProject = (id) => {
    navigation.navigate('ProjectScreen', { id: id });
  };
  

  useEffect(() => {

    const fetchNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log("Retrieved Token:", token); // Add this line to log the token

        const response = await axios.get('http://127.0.0.1:8000/api/notifications/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log("Response Data:", response.data); // Add this line to log the response data

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

  const markAsRead = async (notifId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post('http://127.0.0.1:8000/api/notifications/mark_as_read/', { id: notifId }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setNotifications(notifications.map(notif => 
        notif.id === notifId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };


  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };

  


  // Helper function to render notification item
const renderNotificationItem = (notif, authUser) => {
    const dateTime = formatDateTime(notif.timestamp);
  

    switch (notif.notification_type) {
        case 'FOLLOWER':
            const profileLink = notif.follower.id === authUser.profile.id ? 'UserAccount' : 'UserProfileDetail';
            const profileId = notif.follower.id; // Assuming this is the ID you want to pass

    return (
      <View style={styles.card}>
      <View style={styles.leftColumn}>
        <TouchableOpacity onPress={() => navigateToProfile(profileLink, profileId)}>
          <Image 
            source={{ uri: processImageUrl(notif.follower.profile_image) }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.middleColumn}>
        <Text style={styles.cardTitle}>{notif.follower.username} started following you.</Text>
        <Text style={styles.dateTime}>{dateTime}</Text>
      </View>
      {/* Add rightColumn if necessary */}
    </View>
  );


  case 'COMMENT':
    const commentProfileLink = notif.comment.user.id === authUser.profile.id ? 'UserAccount' : 'UserProfileDetail';
    const profileId_comment = notif.comment.user.id; // Assuming this is the ID you want to pass

    return (
      <View key={notif.id} style={styles.card}>
      <View style={styles.leftColumn}>
        <TouchableOpacity onPress={() => navigateToProfile(commentProfileLink, profileId_comment)}>
          <Image 
            source={{ uri: processImageUrl(notif.comment.user.profile_image) }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.middleColumn}>
        <Text style={styles.cardTitle}>{notif.comment.user.username} commented: "{notif.comment.content}"</Text>
        <Text>on your project: {notif.comment.project.title}</Text>
        <Text style={styles.dateTime}>{dateTime}</Text>
      </View>
      <View style={styles.rightColumn}>
        <TouchableOpacity onPress={() => navigateToProject(notif.comment.project.id)}>
          <Image
            source={{ uri: processImageUrl(notif.comment.project.featured_image) }}
            style={styles.projectImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
    case 'VOTE':
      const voteProfileLink = notif.voting_user.id === authUser.profile.id ? 'UserAccount' : 'UserProfileDetail';
      const profileId_vote= notif.voting_user.id; // Assuming this is the ID you want to pass
      // Add console logs here
      console.log("voteProfileLink:", voteProfileLink);
      console.log("profileId_vote:", profileId_vote);

      return (
        <View key={notif.id} style={styles.card}>
          <View style={styles.leftColumn}>
            <TouchableOpacity onPress={() => navigateToProfile(voteProfileLink, profileId_vote)}>
              <Image 
                source={{ uri: processImageUrl(notif.voting_user.profile_image) }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.middleColumn}>
            <Text style={styles.cardTitle}>{notif.voting_user.username} liked your project:</Text>
            <Text style={styles.projectTitle}>{notif.project.title}</Text>
            <Text style={styles.dateTime}>{dateTime}</Text>
          </View>
          <View style={styles.rightColumn}>
            <TouchableOpacity onPress={() => navigateToProject(notif.project.id)}>
              <Image
                source={{ uri: processImageUrl(notif.project.featured_image) }}
                style={styles.projectImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    

      case 'REPLY':
        const replyProfileLink = notif.comment.user.id === authUser.profile.id ? 'UserAccount' : 'UserProfileDetail';
        const profileId_comments = notif.comment.user.id; // Assuming this is the ID you want to pass
      
        return (
          <View key={notif.id} style={styles.card}>
            <View style={styles.leftColumn}>
              <TouchableOpacity onPress={() => navigateToProfile(replyProfileLink, profileId_comments)}>
                <Image 
                  source={{ uri: processImageUrl(notif.comment.user.profile_image) }}
                  style={styles.profileImage}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.middleColumn}>
              <Text style={styles.cardTitle}>{notif.comment.user.username} has replied: "{notif.comment.content}"</Text>
              <Text>on your comment: "{notif.replied_comment.content}"</Text>
              <Text>on project: {notif.comment.project.title}</Text>
              <Text style={styles.dateTime}>{dateTime}</Text>
            </View>
            <View style={styles.rightColumn}>
              <TouchableOpacity onPress={() => navigateToProject(notif.comment.project.id)}>
                <Image
                  source={{ uri: processImageUrl(notif.comment.project.featured_image) }}
                  style={styles.projectImage}
                />
              </TouchableOpacity>
            </View>
          </View>
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
<ScrollView style={{ backgroundColor: '#ffffff', padding: 10 }}>
          <View>
          <Text style={styles.title}>Notifications</Text>


            {/* Followers Section */}
            <Text style={styles.header}>Followers</Text>
            {followerNotifications.length > 0 ? (
              followerNotifications.map((notif) => (
                <TouchableOpacity key={notif.id} onPress={() => markAsRead(notif.id)}>
                  {renderNotificationItem(notif, auth.user)}
                </TouchableOpacity>
              ))
            ) : (
              <Text>No new followers.</Text>
            )}
    
            {/* Comments Section */}
            <Text style={styles.header}>Comments</Text>
            {commentNotifications.length > 0 ? (
              commentNotifications.map((notif) => (
                <TouchableOpacity key={notif.id} onPress={() => markAsRead(notif.id)}>
                  {renderNotificationItem(notif, auth.user)}
                </TouchableOpacity>
              ))
            ) : (
              <Text>No new comments.</Text>
            )}
    
            {/* Votes Section */}
            <Text style={styles.header}>Votes</Text>
            {voteNotifications.length > 0 ? (
              voteNotifications.map((notif) => (
                <TouchableOpacity key={notif.id} onPress={() => markAsRead(notif.id)}>
                  {renderNotificationItem(notif, auth.user)}
                </TouchableOpacity>
              ))
            ) : (
              <Text>No new votes.</Text>
            )}
    
            {/* Replied Comments Section */}
            <Text style={styles.header}>Replied Comments</Text>
            {notifications.filter(notif => notif.notification_type === 'REPLY').length > 0 ? (
              notifications.filter(notif => notif.notification_type === 'REPLY').map((notif) => (
                <TouchableOpacity key={notif.id} onPress={() => markAsRead(notif.id)}>
                  {renderNotificationItem(notif, auth.user)}
                </TouchableOpacity>
              ))
            ) : (
              <Text>No replies on your comments.</Text>
            )}
          </View>
        </ScrollView>
      );
    };





  // Styles
const styles = StyleSheet.create({
    container: {
      padding: 10,

    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,

      },
      title: {
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
        margin: 20,    
        color: '#333333', // Darker color for better readability
      },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      marginLeft: 10,
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    username: {
      fontWeight: 'bold',
    },
    dateTime: {
      color: 'grey',
      fontSize: 12,
    },

    flexRowSpaceBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      strongText: {
        fontWeight: 'bold',
      },
      projectImage: {
        width: 40,
        height: 40,
        marginLeft: 10,
      },
      dateTimeContainer: {
        marginLeft: 40,
      },

      flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Align items to the far ends
      },
      contentContainer: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10, // Adjust margin for spacing
      },
      imageRight: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignSelf: 'flex-end', // Align image to the right
      },

      flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      leftColumn: {
        // Assuming a 20% width for the image column
        width: '20%',
        justifyContent: 'flex-start',
      },
      middleColumn: {
        // Middle content taking up the majority of space
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10, // Padding for spacing
      },
      rightColumn: {
        // Again, 20% width for the right image column
        width: '20%',
        justifyContent: 'flex-end',
      },
      imageStyle: {
        width: 40,
        height: 40,
        borderRadius: 20,
      },
      card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#fcfcff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      },
      leftColumn: {
        flex: 0.5,
        // Add any additional styling if needed
      },
      middleColumn: {
        flex: 2.5,
        // Add any additional styling if needed
      },
      rightColumn: {
        flex: 0.5,
        // Add any additional styling if needed
      },
  });

  export default NotificationsPage;