import React, { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import axios from 'axios';
import Comment from './Comment'; // Ensure Comment is also converted to React Native

const CommentsList = ({ projectId }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/comments/${projectId}`);
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [projectId]);

  const renderItem = ({ item }) => (
    <View style={{ borderBottomWidth: 1, borderBottomColor: '#ccc', padding: 10 }}>
      <Comment comment={item} projectId={projectId} />
    </View>
  );

  return (
    <FlatList
      data={comments}
      renderItem={renderItem}
      keyExtractor={comment => comment.id.toString()}
    />
  );
};

export default CommentsList;
