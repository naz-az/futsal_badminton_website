import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthContext from '../context/authContext';
import ConfirmationModal from '../components/ConfirmationModal';


function OtherUserFollowersPage() {
  const [followers, setFollowers] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const profileId = route.params.profileId;

  const { user } = useContext(AuthContext);
  const isAuthenticated = user && user.profile && user.profile.id;
  const currentUserId = isAuthenticated ? user.profile.id : null;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);




    // Process image URL function
    const processImageUrl = (imageUrl) => {
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        return `http://127.0.0.1:8000${imageUrl}`;
      }
      return imageUrl;
    };

  const fetchToken = async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (e) {
      console.error('Error reading token', e);
    }
  };

  const fetchFollowers = async () => {
    setIsFetching(true);
    const token = await fetchToken();
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/profiles/${profileId}/followers/`, config);
      let followersData = response.data;

      if (isAuthenticated) {
        const updatedFollowersData = await Promise.all(
          followersData.map(async (follower) => {
            const isFollowingResponse = await axios.get(`http://127.0.0.1:8000/api/profiles/${follower.id}/is_following/`, config);
            return { ...follower, isFollowing: isFollowingResponse.data.is_following };
          })
        );
        setFollowers(updatedFollowersData);
      } else {
        setFollowers(followersData);
      }
    } catch (error) {
      console.error('Error fetching followers', error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, [profileId, isAuthenticated]);


  const handleFollowToggle = async (followerProfileId, isFollowing) => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
  
    if (isFollowing) {
      // When unfollowing, show confirmation modal
      setSelectedProfile({ id: followerProfileId, isFollowing });
      setModalVisible(true);
    } else {
      // Logic for following a user
      const token = await fetchToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const endpoint = `http://127.0.0.1:8000/api/profiles/${followerProfileId}/follow/`;
  
      try {
        await axios.post(endpoint, {}, config);
        setFollowers(
          followers.map((follower) =>
            follower.id === followerProfileId ? { ...follower, isFollowing: true } : follower
          )
        );
      } catch (error) {
        console.error('Error toggling follow state', error);
      }
    }
  };
  
  const handleUnfollowConfirm = async () => {
    if (selectedProfile) {
      // Logic for unfollowing a user
      const token = await fetchToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const endpoint = `http://127.0.0.1:8000/api/profiles/${selectedProfile.id}/unfollow/`;
  
      try {
        await axios.post(endpoint, {}, config);
        setFollowers(
          followers.map((follower) =>
            follower.id === selectedProfile.id ? { ...follower, isFollowing: false } : follower
          )
        );
      } catch (error) {
        console.error('Error toggling follow state', error);
      }
  
      // Reset the selected profile and hide the modal
      setSelectedProfile(null);
      setModalVisible(false);
    }
  };

  const isCurrentUserOwner = (profileId) => {
    return user && user.profile && user.profile.id === profileId;
};

  if (isFetching) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Followers</Text>
      <Text style={styles.subHeader}>{user.profile.username} has {followers.length} {followers.length === 1 ? 'follower' : 'followers'}</Text>

      {followers.map((profile) => (
        <View key={profile.id} style={styles.card}>
                    <TouchableOpacity onPress={() => navigation.navigate(isCurrentUserOwner(profile.id) ? 'UserAccount' : 'UserProfileDetail', { id: profile.id })}>
            <Image source={{ uri: processImageUrl(profile.profile_image) }} style={styles.profileImage} />
          </TouchableOpacity>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{profile.name}</Text>
            <Text>{profile.short_intro?.slice(0, 60) ?? ''}</Text>
          </View>
          {currentUserId !== profile.id && (
            <TouchableOpacity 
            style={profile.isFollowing ? styles.unfollowButton : styles.followButton}
            onPress={() => handleFollowToggle(profile.id, profile.isFollowing)}
          >
            <Text style={styles.buttonText}>{profile.isFollowing ? 'Unfollow' : 'Follow'}</Text>
          </TouchableOpacity>
          )}
        </View>
      ))}

            {/* Confirmation Modal */}
            <ConfirmationModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onConfirm={handleUnfollowConfirm}
        actionType="unfollow this user"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  subHeader: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  followButton: {
    backgroundColor: '#333361',
    padding: 10,
    borderRadius: 5,
  },
  unfollowButton: {
    backgroundColor: 'grey',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  }
});

export default OtherUserFollowersPage;
