import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Modal, Button } from "react-native";
import AuthContext from "../context/authContext";
import { useNavigation } from "@react-navigation/native";

import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dimensions } from 'react-native';

function ThreadMessages() {
  const [threads, setThreads] = useState([]);
  const [selectedThreads, setSelectedThreads] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigation = useNavigation();
  const auth = useContext(AuthContext);

  const isAllSelected = selectedThreads.length === threads.length;

  const [deleteCandidate, setDeleteCandidate] = useState(null);  // Add this state

  useEffect(() => {
    const fetchThreads = async () => {
      const token = await AsyncStorage.getItem("token");
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/threads/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setThreads(response.data.sort((a, b) => 
          new Date(b.latest_message_timestamp) - new Date(a.latest_message_timestamp)
        ));
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };
    fetchThreads();
  }, []);

  const handleThreadClick = (threadId) => {
    navigation.navigate('Thread', { threadId });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getLatestMessage = (messages) => {
    if (messages.length === 0) {
      return "No messages yet";
    }
    return messages[messages.length - 1].body;
  };

  // Simplified function to show delete confirmation modal
  const showDeleteModal = async (threadId) => {
    const token = await AsyncStorage.getItem("token");
    try {
      await axios.delete(`http://127.0.0.1:8000/api/threads/${threadId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setThreads(threads.filter((thread) => thread.id !== threadId));
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };
  

  // Function to actually delete the thread
  const deleteThread = async () => {
    console.log("deleteCandidate:",deleteCandidate);

    if (!deleteCandidate) return;  // Check if deleteCandidate is set
    const token = await AsyncStorage.getItem("token");
    try {
      await axios.delete(`http://127.0.0.1:8000/api/threads/${deleteCandidate}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setThreads(threads.filter((thread) => thread.id !== deleteCandidate));
      setShowDeleteConfirm(false);
      setDeleteCandidate(null);  // Reset the deleteCandidate
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };



  const getOtherParticipant = (participants) => {
    if (!auth.user || !auth.user.profile) {
      console.error("Auth user or profile is undefined");
      return {};
    }
    return participants.find(
      (participant) => participant.username !== auth.user.profile.username
    ) || {};
  };
  

  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };

  const renderUserInfo = (thread) => {
    const otherParticipant = getOtherParticipant(thread.participants);
    const processedImageUrl = processImageUrl(otherParticipant.profile_image);

    return (
      <View style={styles.userInfo}>
        <Image source={{ uri: processedImageUrl }} style={styles.profileImage} />
        {/* <Text style={styles.username}>{otherParticipant.username}</Text> */}
      </View>
    );
  };

  const handleDeleteClick = (threadId) => {
    console.log("Delete clicked for thread ID:", threadId);
    setSelectedThreads([threadId]);
    setShowDeleteConfirm(true);
  };
  

      
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={() => handleThreadClick(item.id)}
      onLongPress={() => toggleThreadSelection(item.id)}
    >
      {renderUserInfo(item)}
      <View style={styles.messageSection}>
        <Text style={styles.username}>{getOtherParticipant(item.participants).username}</Text>
        <Text style={styles.messagePreview}>{getLatestMessage(item.messages)}</Text>
      </View>
      <View style={styles.messageDateContainer}>
        <Text style={styles.messageDate}>{formatDate(item.latest_message_timestamp)}</Text>
      </View>
      <Icon 
          name="more-vert" 
          size={20} 
          onPress={() => handleDeleteClick(item.id)} 
          style={styles.moreIcon} // You need to add this style
        />
    </TouchableOpacity>
  );
  
  const navigateToSendScreen = async () => {
    // Perform any logic here if needed
    navigation.navigate('Send'); // Make sure 'SendScreen' is defined in your navigator
  };





  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inbox</Text>

      <View>
      <TouchableOpacity 
  style={styles.createButton} 
  onPress={navigateToSendScreen}
>
  <Icon name="add" size={20} color="#ffffff" />
  <Text style={styles.createButtonText}>Create New Message</Text>
</TouchableOpacity>

    </View>
    
          <FlatList
        data={threads}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {/* Add Modal for delete confirmation */}
      <Modal
        visible={showDeleteConfirm}
        onRequestClose={() => setShowDeleteConfirm(false)}
        transparent={true} // Make the modal transparent so that we can style the background
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text>Are you sure you want to delete this thread?</Text>
            <Button
              title="Delete"
              onPress={() => {
                setDeleteCandidate(selectedThreads[0]);
                showDeleteModal(selectedThreads[0]);
              }}
            />
            <Button title="Cancel" onPress={() => setShowDeleteConfirm(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: 20,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF', // Adding a light background for overall page
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    margin: 20,    
    color: '#333333', // Darker color for better readability
  },
  messageSection: {
    flex: 3,
    justifyContent: 'center',
    // marginLeft: 20,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1A202C',
  },
  messagePreview: {
    fontSize: 16,
    color: '#4A5568',
  },

  item: {
    backgroundColor: '#ffffff', // Softer color for the item background
    padding: 15,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10, // Rounded corners for a modern look
    shadowColor: "#000", // Adding shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },

  messageDetails: {
    flex: 2,
  },

  messageDateContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  messageDate: {
    fontSize: 14,
    color: '#A0AEC0', // Lighter color for the date
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d555e',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    alignSelf: 'center', // Changed from 'flex-start' to 'center' to center the button
    margin: 5, // Optional, adjust as needed
  },
  
  createButtonText: {
    color: '#fff',
    marginLeft: 5,

  },
  moreIcon: {
    marginLeft: 15, // Adjust as needed
    // Add any additional styling you need
  },
  // Add this style for the modal background
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },

  // Update this style for the modal content
  modalContent: {
    width: Dimensions.get('window').width - 40, // Adjust as needed
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default ThreadMessages;
