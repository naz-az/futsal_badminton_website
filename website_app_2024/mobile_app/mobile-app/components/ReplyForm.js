import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReplyForm = ({ parentCommentId, projectId, onReplyPosted, onReplySuccess }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Not logged in", "You need to login to post a reply.");
      return;
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios.post(`http://127.0.0.1:8000/api/comments/post/${projectId}/`, { content, parent_id: parentCommentId }, config)
      .then(() => {
        setContent('');
        if (onReplyPosted) onReplyPosted();
        if (onReplySuccess) onReplySuccess(); // Call the callback on successful reply
      })
      .catch(error => console.error("Error posting reply:", error));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        value={content}
        onChangeText={setContent}
        placeholder="Write a reply..."
      />
      <Button
        title="Post Reply"
        onPress={handleSubmit}
        color="#292929"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    margin: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
  },
});

export default ReplyForm;
