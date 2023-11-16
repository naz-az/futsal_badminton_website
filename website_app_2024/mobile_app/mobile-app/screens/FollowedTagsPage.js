import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Button, Modal, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

function FollowedTagsPage() {
  const [followedTags, setFollowedTags] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchFollowedTags();
  }, []);

  const fetchFollowedTags = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.get('http://127.0.0.1:8000/api/followed-tags', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFollowedTags(data);
    } catch (error) {
      console.error('Error fetching followed tags', error);
    }
  };

  const handleUnfollowClick = (tag) => {
    setSelectedTag(tag);
    setShowConfirmModal(true);
  };

  const confirmUnfollow = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`http://127.0.0.1:8000/api/unfollow-tag/${selectedTag.id}/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowConfirmModal(false);
      fetchFollowedTags();
    } catch (error) {
      console.error('Error unfollowing tag', error);
    }
  };

  const handleTagClick = (tagId) => {
    navigation.navigate('/categories', { tag_id: tagId });
  };

  return (
    <ScrollView>
      <Text style={{ fontSize: 24, textAlign: 'center' }}>Followed Tags</Text>
      <View style={{ margin: 25 }}>
        <Button title="View all Tags" onPress={() => navigation.navigate('Categories')} />
      </View>
      <View>
        {followedTags.map(tag => (
          <TouchableOpacity key={tag.id} style={{ margin: 10 }} onPress={() => handleTagClick(tag.id)}>
            <Text style={{ fontSize: 18 }}>{tag.name}</Text>
            <Button title="Unfollow" color="red" onPress={(e) => { e.stopPropagation(); handleUnfollowClick(tag); }} />
          </TouchableOpacity>
        ))}
      </View>
      <Modal
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}>
        {/* ... Modal content ... */}
      </Modal>
    </ScrollView>
  );
}

export default FollowedTagsPage;
