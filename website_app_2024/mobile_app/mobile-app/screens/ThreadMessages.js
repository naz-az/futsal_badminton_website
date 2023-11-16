import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Modal, Button } from "react-native";
import AuthContext from "../context/authContext";
import { useNavigation } from "@react-navigation/native";

function ThreadMessages() {
  const [threads, setThreads] = useState([]);
  const [selectedThreads, setSelectedThreads] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigation = useNavigation();
  const auth = useContext(AuthContext);

  const isAllSelected = selectedThreads.length === threads.length;

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

  const showDeleteModal = (threadId) => {
    setSelectedThreads([threadId]);
    setShowDeleteConfirm(true);
  };

  const toggleThreadSelection = (threadId) => {
    setSelectedThreads((prevSelected) => {
      if (prevSelected.includes(threadId)) {
        return prevSelected.filter((id) => id !== threadId);
      } else {
        return [...prevSelected, threadId];
      }
    });
  };

  const selectAllThreads = () => {
    if (isAllSelected) {
      setSelectedThreads([]);
    } else {
      setSelectedThreads(threads.map((thread) => thread.id));
    }
  };

  const deleteSelectedThreads = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      await Promise.all(
        selectedThreads.map((threadId) =>
          axios.delete(`http://127.0.0.1:8000/api/threads/${threadId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setThreads(
        threads.filter((thread) => !selectedThreads.includes(thread.id))
      );
      setSelectedThreads([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting threads:", error);
    }
  };

  const getOtherParticipant = (participants) => {
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
        <Text style={styles.username}>{otherParticipant.username}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={() => handleThreadClick(item.id)}
      onLongPress={() => toggleThreadSelection(item.id)}
    >
      {renderUserInfo(item)}
      <View style={styles.messageDetails}>
        <Text style={styles.messagePreview}>{getLatestMessage(item.messages)}</Text>
      </View>
      <View style={styles.messageDateContainer}>
        <Text style={styles.messageDate}>{formatDate(item.latest_message_timestamp)}</Text>
      </View>
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
      <Button 
        title="Create New Message"
        onPress={navigateToSendScreen}
        color="#007bff" // Example color, modify as needed
      />
    </View>
    
          <FlatList
        data={threads}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {/* Add Modal for delete confirmation */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF', // Adding a light background for overall page
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333', // Darker color for better readability
  },
  item: {
    backgroundColor: '#E8F9FD', // Softer color for the item background
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
  username: {
    fontWeight: 'bold',
    color: '#1A202C', // Dark color for username
  },
  messageDetails: {
    flex: 2,
  },
  messagePreview: {
    fontSize: 16,
    color: '#4A5568', // Dark gray for the message preview
  },
  messageDateContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  messageDate: {
    fontSize: 14,
    color: '#A0AEC0', // Lighter color for the date
  },
  // ... add other styles for modal, buttons, etc.
});

export default ThreadMessages;
