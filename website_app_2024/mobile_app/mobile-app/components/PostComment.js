import React, { useState } from 'react';
import axios from 'axios';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostComment = ({ projectId, onCommentPosted, navigation }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      navigation.navigate('Login');
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      await axios.post(`http://127.0.0.1:8000/api/comments/post/${projectId}/`, { content }, config);
      setContent('');
      if (onCommentPosted) {
        onCommentPosted();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <View>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={4}
        onChangeText={text => setContent(text)}
        value={content}
        placeholder="Write a comment..."
      />
      <Button
        onPress={handleSubmit}
        title="Post Comment"
        color="#292929"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 10,
    marginTop: 12,
    marginBottom: 12,
  },
});

export default PostComment;
