import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, TextInput, Button, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthContext from '../context/authContext';

const Thread = () => {
  const [thread, setThread] = useState(null);
  const [mainReply, setMainReply] = useState('');
  const [individualReply, setIndividualReply] = useState('');
  const [isReplying, setIsReplying] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { threadId } = route.params;
  const auth = useContext(AuthContext);

  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };

  const fetchThread = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/threads/${threadId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.messages && response.data.participants) {
        setThread(response.data);
      } else {
        console.error('Invalid thread data structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching thread:', error);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [threadId]);

  const sendReply = async (parentId, recipientId) => {
    const token = await AsyncStorage.getItem('token');
    const body = parentId ? individualReply : mainReply;

    try {
      await axios.post(
        'http://127.0.0.1:8000/api/send_message/',
        { body, threadId, parentId, recipientId, isReply: !!parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMainReply('');
      setIndividualReply('');
      fetchThread();
      setIsReplying(null);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const handleReplyClick = (messageId) => {
    setIsReplying(isReplying === messageId ? null : messageId);
  };

  const findParentMessage = (parentId) => {
    return thread?.messages.find(message => message.id === parentId);
  };


  const renderMessages = (messages, thread, auth, handleReplyClick, isReplying, individualReply, setIndividualReply, sendReply) => {
    return (
      <ScrollView>
        {messages.map((message) => {
          const isOriginalSender = message.sender.id === thread.messages[0].sender.id;
          return (
            <View key={message.id} style={{ flexDirection: 'row', justifyContent: isOriginalSender ? 'flex-start' : 'flex-end', marginVertical: 5 }}>
              <View style={{ flexDirection: isOriginalSender ? 'row' : 'row-reverse', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => {/* Navigate to user profile */}}>
                  <Image source={{ uri: processImageUrl(message.sender.profile_image) }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                  <Text style={{ textAlign: 'center' }}>{message.sender.username}</Text>
                </TouchableOpacity>
                <View style={{ marginLeft: isOriginalSender ? 10 : 0, marginRight: isOriginalSender ? 0 : 10 }}>
                  <Text>{message.body}</Text>
                  <Text style={{ fontSize: 12, color: 'grey' }}>{new Date(message.timestamp).toLocaleString()}</Text>
                </View>
                <TouchableOpacity onPress={() => handleReplyClick(message.id)} style={{ marginLeft: isOriginalSender ? 10 : 0, marginRight: isOriginalSender ? 0 : 10 }}>
                  <Text style={{ color: 'blue' }}>Reply</Text>
                </TouchableOpacity>
              </View>
  
              {isReplying === message.id && (
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  <TextInput
                    style={{ flex: 1, borderWidth: 1, borderColor: 'grey', padding: 10 }}
                    multiline
                    value={individualReply}
                    onChangeText={setIndividualReply}
                  />
                  <TouchableOpacity onPress={() => sendReply(message.id, message.recipient.id)}>
                    <Text style={{ color: 'blue', marginLeft: 10 }}>Submit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };
  

 // Main component render
 return (
<View style={styles.container}>
  <Text style={styles.header}>Thread</Text>
  <TouchableOpacity onPress={() => navigation.navigate('Inbox')}>
    <Text style={styles.linkText}>Back to Inbox</Text>
  </TouchableOpacity>

  {thread && thread.messages ? (
    renderMessages(thread.messages, thread, auth, handleReplyClick, isReplying, individualReply, setIndividualReply, sendReply)
  ) : (
    <Text>Loading thread...</Text>
  )}

  <View style={{ marginTop: 20 }}>
    <TextInput
      style={styles.replyInput}
      multiline
      value={mainReply}
      onChangeText={setMainReply}
      placeholder="Reply to the main thread..."
    />
    <TouchableOpacity onPress={() => sendReply(null, thread.participants[1].id)}>
      <Text style={styles.submitButtonText}>Send</Text>
    </TouchableOpacity>
  </View>
</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  linkText: {
    color: '#007BFF',
    marginTop: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  messageText: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    color: '#4A4A4A',
  },
  timestamp: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  submitButton: {
    marginLeft: 10,
  },
  submitButtonText: {
    color: '#007BFF',
  },
 
}
);

export default Thread;