import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import AuthContext from '../context/authContext';
import ReplyForm from './ReplyForm';
import { useNavigation } from '@react-navigation/native';

const Comment = ({ comment, projectId, onCommentUpdated, currentUser }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const auth = useContext(AuthContext);
  const navigation = useNavigation();
  const currentUserId = auth.user?.profile.id;
  console.log("Current User ID:", currentUserId);

  const getProfileLinkPath = (commentUserId) => {
    if (auth.user && commentUserId === auth.user.profile.id) {
      return '/user/account';
    }
    return `/profiles/${commentUserId}`;
  };

  const navigateToProfile = () => {
    console.log("Comment User ID:", comment.user.id); // Log comment.user.id

    navigation.navigate('UserProfileDetail', { id: comment.user.id });
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      const fetchCurrentUserProfile = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await axios.get('http://127.0.0.1:8000/api/user/account/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCurrentUserProfile(response.data);
        } catch (error) {
          console.error('Error fetching current user profile:', error);
        }
      };

      fetchCurrentUserProfile();
    } else {
      setCurrentUserProfile(null);
    }
  }, [auth.isAuthenticated]);

  const isCommentOwner = currentUserProfile && comment.user.username === currentUserProfile.profile.username;

  useEffect(() => {
    if (auth.isAuthenticated) {
      const checkLikeStatus = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          const response = await axios.get(`http://127.0.0.1:8000/api/likes/is-liked/${comment.id}/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
          setIsLiked(response.data.isLiked);
          setLikeCount(response.data.likeCount);
        } catch (error) {
          console.error("Error checking like status:", error);
        }
      };

      checkLikeStatus();
    } else {
      setIsLiked(false);
      setLikeCount(0);
    }
  }, [comment.id, auth.isAuthenticated]);

  const handleLike = async () => {
    if (!currentUser) {
      // Navigate to login
      return;
    }
    const config = {
      headers: {
        Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
      },
    };
    try {
      if (isLiked) {
        await axios.delete(`http://127.0.0.1:8000/api/likes/remove/${comment.id}/`, config);
        setLikeCount(prev => prev - 1);
      } else {
        await axios.post(`http://127.0.0.1:8000/api/likes/add/${comment.id}/`, {}, config);
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
      if (onCommentUpdated) onCommentUpdated();
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    if (onCommentUpdated) onCommentUpdated();
  };

  const handleDeleteComment = async () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      const token = await AsyncStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      axios.delete(`http://127.0.0.1:8000/api/comments/delete/${comment.id}/`, config)
        .then(() => {
          if (onCommentUpdated) onCommentUpdated();
        })
        .catch(error => console.error("Error deleting comment:", error));
    }
  };

  const [showReplies, setShowReplies] = useState(false);
 
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Profile image column */}
        <TouchableOpacity onPress={() =>navigation.navigate(currentUserId === comment.user?.id ? 'UserAccount' : 'UserProfileDetail', { id: comment.user.id})}   
        style={styles.profileImageContainer}>
          <Image
            source={{ uri: comment.user.profile_image }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {/* Username and Date Created column */}
        <View style={styles.usernameColumn}>
          <TouchableOpacity onPress={navigateToProfile}>
            <Text style={styles.username}>{comment.user.username}</Text>
          </TouchableOpacity>
          <Text style={styles.date}>{new Date(comment.created_at).toLocaleString()}</Text>
        </View>

        {/* Buttons column */}
        <View style={styles.buttonsColumn}>
          {auth.isAuthenticated && (
            <TouchableOpacity onPress={() => setShowReplyForm(!showReplyForm)} style={styles.button}>
              <Text>Reply</Text>
            </TouchableOpacity>
          )}

          {isCommentOwner && (
            <TouchableOpacity onPress={handleDeleteComment} style={[styles.button, styles.deleteButton]}>
              <Text>Delete</Text>
            </TouchableOpacity>
          )}

          {auth.isAuthenticated && (
            <TouchableOpacity onPress={handleLike} style={[styles.button, isLiked ? styles.likedButton : styles.likeButton]}>
              <Text>{isLiked ? 'Unlike' : 'Like'} {likeCount}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Comment content */}
      <Text style={styles.commentContent}>{comment.content}</Text>

      {/* Add the conditional rendering here */}
{showReplyForm && (
    <ReplyForm 
      parentCommentId={comment.id} 
      projectId={projectId} 
      onReplyPosted={handleReplySuccess} 
      onReplySuccess={handleReplySuccess} 
    />
)}

      {/* Reply Form */}
      <View style={{ marginTop: 10 }}>
  {comment.replies && comment.replies.length > 0 && (
    <>
      {/* Show the first reply */}
      <Comment
        key={comment.replies[0].id}
        comment={comment.replies[0]}
        projectId={projectId}
        onCommentUpdated={onCommentUpdated}
        currentUser={currentUser}
      />

      {/* Button to toggle the visibility of additional replies, only if more than one reply exists */}
      {comment.replies && comment.replies.length > 1 && !showReplies && (
        <TouchableOpacity onPress={() => setShowReplies(true)}>
          <Text>See more comments ({comment.replies.length - 1})</Text>
        </TouchableOpacity>
      )}

      {showReplies && (
        <>
          {comment.replies.slice(1).map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              projectId={projectId}
              onCommentUpdated={onCommentUpdated}
              currentUser={currentUser}
            />
          ))}
          <TouchableOpacity onPress={() => setShowReplies(false)}>
            <Text>Show less</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  )}
</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileImageContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 15,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 20,
  },
  usernameColumn: {
    flex: 6,
    justifyContent: 'center',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  buttonsColumn: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    // marginHorizontal: 5,
    marginRight: 5,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#E8E8E8',
  },
  deleteButton: {
    backgroundColor: '#FFC0CB',
  },
  likeButton: {
    backgroundColor: '#ADD8E6',
  },
  likedButton: {
    backgroundColor: '#66c9cd',
  },
  commentContent: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  // Add additional styles as needed
});


export default Comment;
