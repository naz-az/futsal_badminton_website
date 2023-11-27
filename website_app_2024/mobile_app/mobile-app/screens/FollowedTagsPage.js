import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Button, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Example for icons
import CustomButton from '../components/CustomButton';


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
    navigation.navigate('Categories', { tag_id: tagId });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Followed Categories</Text>
      <View style={styles.buttonContainer}>
      <CustomButton title="View all Categories" color="#143e4b" onPress={() => navigation.navigate('Categories')} />
      </View>
      <View>
      {followedTags.map(tag => (
        <TouchableOpacity key={tag.id} style={styles.tagItem} onPress={() => handleTagClick(tag.id)}>
          <Text style={styles.tagText}>{tag.name}</Text>
          <CustomButton title="Unfollow" color="#ad1f1f" onPress={(e) => { e.stopPropagation(); handleUnfollowClick(tag); }} />
        </TouchableOpacity>
      ))}
    </View>
      <Modal
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
        transparent={true}>
        {/* ... Modal content ... */}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    margin: 20,
  },
  buttonContainer: {
    marginHorizontal: 25,
    marginBottom: 10,
  },
  tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  tagText: {
    fontSize: 18,
    flexGrow: 1, // Allows the text to expand and fill the space
  },
});

export default FollowedTagsPage;