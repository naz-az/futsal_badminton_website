import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, ScrollView, Image, TouchableOpacity, Picker, StyleSheet, Linking } from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from "@react-navigation/native";
import VotingButtons from "../components/VotingButtons"; // Adjust as per React Native
import FavoriteButton from "../components/FavoriteButton"; // Adjust as per React Native
import AuthContext from '../context/authContext';
import { FontAwesome5 } from '@fortawesome/react-native-fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faYoutube, faFacebook, faInstagram, faTwitter, faSquareJs } from '@fortawesome/free-brands-svg-icons';

function UserProfileDetail() {
  const [profile, setProfile] = useState({});
  const [projects, setProjects] = useState([]);
  const route = useRoute();
  const { id } = route.params;

  const [isFollowing, setIsFollowing] = useState(false);
  const navigation = useNavigation();

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [displayedProjects, setDisplayedProjects] = useState(6);
  const [sortType, setSortType] = useState('newest');

  const auth = useContext(AuthContext);
  const currentUserId = auth.user ? auth.user.profile.id : null;

  const [sortedProjects, setSortedProjects] = useState(projects);
  const [selectedSort, setSelectedSort] = useState('newToOld');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await AsyncStorage.getItem("token");
      setToken(fetchedToken);
    };
  
    fetchToken();
  }, []); // Empty dependency array means this runs once on component mount

  
  // Process image URL function
  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };

  // Function to check if user is authenticated
  const isAuthenticated = async () => {
    const token = await AsyncStorage.getItem("token");
    return token != null;
  };

  // Function to handle redirection to login if not authenticated
  const redirectToLogin = () => {
    navigation.navigate('Login');
  };

  const fetchAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      const authHeaders = await fetchAuthHeaders();

      const fetchProfile = async () => {
        const response = await axios.get(`http://127.0.0.1:8000/api/profiles/${id}/`, authHeaders);
        setProfile(response.data);
      };

      const fetchProjects = async () => {
        const response = await axios.get(`http://127.0.0.1:8000/api/profiles/${id}/projects/`, authHeaders);
        setProjects(response.data);
      };

      const fetchBlockedUsers = async () => {
        if (await isAuthenticated()) {
          try {
            const res = await axios.get("http://127.0.0.1:8000/api/blocked-users/", authHeaders);
            setBlockedUsers(res.data);
          } catch (error) {
            console.error("Error fetching blocked users:", error);
          }
        } else {
          console.log("User is not authenticated");
        }
      };

      fetchProfile();
      fetchProjects();
      fetchBlockedUsers();
    };

    fetchData();
  }, [id]);

  const [isUserBlocked, setIsUserBlocked] = useState(false);

  useEffect(() => {
    const checkIfBlocked = async () => {
      if (await isAuthenticated()) {
        try {
          const authHeaders = await fetchAuthHeaders();
          const response = await axios.get(`http://127.0.0.1:8000/api/profiles/${id}/is_blocked/`, authHeaders);
          setIsUserBlocked(response.data.is_blocked);
        } catch (error) {
          console.error("Error checking if user is blocked:", error);
        }
      }
    };
  
    checkIfBlocked();
  }, [id]);

  const handleFollow = async () => {
    if (!await isAuthenticated()) {
      redirectToLogin();
      return;
    }
    try {
      const config = await fetchAuthHeaders();
  
      await axios.post(`http://127.0.0.1:8000/api/profiles/${id}/follow/`, {}, config);
      setIsFollowing(true);
  
      // Update profile state to reflect new followers count
      setProfile(prevProfile => ({
        ...prevProfile,
        followers_count: prevProfile.followers_count + 1,
      }));
    } catch (error) {
      console.error("Error following the user:", error);
    }
  };

  const handleUnfollow = async () => {
    if (!await isAuthenticated()) {
      redirectToLogin();
      return;
    }
    try {
      const config = await fetchAuthHeaders();
    
      await axios.post(`http://127.0.0.1:8000/api/profiles/${id}/unfollow/`, {}, config);
      setIsFollowing(false);
  
      // Update profile state to reflect new followers count
      setProfile(prevProfile => ({
        ...prevProfile,
        followers_count: prevProfile.followers_count > 0 ? prevProfile.followers_count - 1 : 0,
      }));
    } catch (error) {
      console.error("Error unfollowing the user:", error);
    }
  };
  
  useEffect(() => {
    const checkFollowingStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        try {
          const authHeaders = await fetchAuthHeaders();
          const response = await axios.get(`http://127.0.0.1:8000/api/profiles/${id}/is_following/`, authHeaders);
          setIsFollowing(response.data.is_following);
        } catch (error) {
          console.error("Error checking following status:", error);
        }
      }
    };
  
    checkFollowingStatus();
  }, [id]);
  
  const sortProjects = (selectedSort) => {
    let sortedProjects = [...projects];
  
    switch (selectedSort) {
      case 'topToLow':
        sortedProjects.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'lowToTop':
        sortedProjects.sort((a, b) => a.upvotes - b.upvotes);
        break;
      case 'highToLow':
        sortedProjects.sort((a, b) => b.price - a.price);
        break;
      case 'lowToHigh':
        sortedProjects.sort((a, b) => a.price - b.price);
        break;
      case 'newToOld':
        sortedProjects.sort((a, b) => new Date(b.created) - new Date(a.created));
        break;
      case 'oldToNew':
        sortedProjects.sort((a, b) => new Date(a.created) - new Date(b.created));
        break;
      default:
        break;
    }
  
    setSortedProjects(sortedProjects);
  };
  

  useEffect(() => {
    sortProjects(selectedSort);
  }, [selectedSort, projects]);
  

  

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>

      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Image
          source={{ uri: processImageUrl(profile.profile_image) }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{profile.name}</Text>
        <Text>{profile.short_intro}</Text>
        {profile.location && <Text>Based in {profile.location}</Text>}
  
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
  {profile.social_facebook && (
    <TouchableOpacity onPress={() => Linking.openURL(profile.social_facebook)}>
      <FontAwesomeIcon icon={faFacebook} size={24} color="blue" style={{ marginHorizontal: 10 }} />
    </TouchableOpacity>
  )}

  {profile.social_twitter && (
    <TouchableOpacity onPress={() => Linking.openURL(profile.social_twitter)}>
      <FontAwesomeIcon icon={faTwitter} size={24} color="#1DA1F2" style={{ marginHorizontal: 10 }} />
    </TouchableOpacity>
  )}

  {profile.social_instagram && (
    <TouchableOpacity onPress={() => Linking.openURL(profile.social_instagram)}>
      <FontAwesomeIcon icon={faInstagram} size={24} color="#C13584" style={{ marginHorizontal: 10 }} />
    </TouchableOpacity>
  )}

  {profile.social_youtube && (
    <TouchableOpacity onPress={() => Linking.openURL(profile.social_youtube)}>
      <FontAwesomeIcon icon={faYoutube} size={24} color="red" style={{ marginHorizontal: 10 }} />
    </TouchableOpacity>
  )}

  {profile.social_website && (
    <TouchableOpacity onPress={() => Linking.openURL(profile.social_website)}>
      <FontAwesomeIcon icon={faSquareJs} size={24} color="black" style={{ marginHorizontal: 10 }} />
    </TouchableOpacity>
  )}
</View>

      </View>

      {profile.id !== currentUserId && !isUserBlocked && (
        <TouchableOpacity
  onPress={async () => {
    if (!await isAuthenticated()) {
      redirectToLogin();
    } else {
      navigation.navigate('Send', { recipient: id });
    }
  }}
  style={styles.button}
>
  <Text style={styles.buttonText}>Send Message</Text>
</TouchableOpacity>

    )}

    {profile.id !== currentUserId && !isUserBlocked && (
      isFollowing ? (
        <TouchableOpacity onPress={handleUnfollow} style={styles.outlineButton}>
          <Text style={styles.buttonText}>Unfollow</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleFollow} style={styles.button}>
          <Text style={styles.buttonText}>Follow</Text>
        </TouchableOpacity>
      )
    )}

    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 20 }}>
      <TouchableOpacity onPress={() => navigation.navigate('OtherUserFollowersPage', { profileId: id })}>
        <Text style={{ textAlign: 'center' }}>
          <Text style={{ fontWeight: 'bold' }}>{profile.followers_count}</Text> Followers
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('OtherUserFollowingPage', { profileId: id })}>
        <Text style={{ textAlign: 'center' }}>
          <Text style={{ fontWeight: 'bold' }}>{profile.following_count}</Text> Following
        </Text>
      </TouchableOpacity>
    </View>


    <View style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 10, padding: 10 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>About Me</Text>
      <Text>{profile.bio}</Text>
    </View>


    <View style={styles.card}>
      <Text style={styles.cardHeader}>Deals</Text>
      <View style={styles.cardBody}>
        {projects && projects.length === 0 ? (
          <Text>No deals posted by user</Text>
        ) : (
          <>
            {/* Sorting functionality (can use Picker or custom dropdown) */}
            {/* Implement sorting UI and logic */}

            <Picker
  selectedValue={selectedSort}
  onValueChange={(itemValue) => setSelectedSort(itemValue)}
  style={{ height: 50, width: 150 }}
>
  <Picker.Item label="New to Old" value="newToOld" />
  <Picker.Item label="Old to New" value="oldToNew" />
  <Picker.Item label="Top to Low (Hotness)" value="topToLow" />
  <Picker.Item label="Low to Top (Hotness)" value="lowToTop" />
  <Picker.Item label="High to Low (Price)" value="highToLow" />
  <Picker.Item label="Low to High (Price)" value="lowToHigh" />
</Picker>


        {sortedProjects.map((project) => (
              <View key={project.id}>
                <TouchableOpacity onPress={() => navigation.navigate('ProjectScreen', { id: project.id })}>
                  <Image
                    source={{ uri: processImageUrl(project.featured_image) }}
                    style={{ width: '100%', height: 250 }}
                  />
                  <Text style={styles.projectTitle}>{project.title}</Text>


                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetail', { id: profile.id })}>

                {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}> */}
                    <Image
                      source={{ uri: processImageUrl(project.owner.profile_image) }}
                      style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10 }}
                    />
                    <Text>By {project.owner.name}</Text>
                  {/* </View> */}
                  </TouchableOpacity>


                <VotingButtons projectId={project.id} />

                <Text style={{ fontSize: 22, marginTop: 20 }}>RM {project.price}</Text>

                <TouchableOpacity
                  onPress={() => {
                    const url = project.deal_link.startsWith("http://") || project.deal_link.startsWith("https://")
                      ? project.deal_link
                      : "http://" + project.deal_link;
                    Linking.openURL(url);
                  }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Go to deal</Text>
                </TouchableOpacity>

                {/* Tags */}
                <View style={{ flexDirection: 'row', marginTop: 10, flexWrap: 'wrap' }}>
                  {project.tags.map((tag) => (
                    <TouchableOpacity key={tag.id} onPress={() => navigation.navigate('Categories', { tag_id: tag.id })}
                      style={[styles.tagButton, { marginRight: 6 }]}
                    >
                      <Text style={styles.tagButtonText}>{tag.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ fontSize: 16, marginTop: 10 }}>
                  <Text style={styles.badge}>{project.brand}</Text>
                </Text>

                {/* Adapt FavoriteButton component for React Native */}
                <FavoriteButton projectId={project.id} token={token} />
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  </ScrollView>
);
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: 'blue',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'black',
  },
  tagButton: {
    backgroundColor: '#007BFF',
    padding: 5,
    marginRight: 6,
    borderRadius: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 14,
  },
  projectTitle: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  shortIntro: {
    fontSize: 16,
    marginBottom: 5,
  },
  socialIcon: {
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
  },
  badge: {
    backgroundColor: '#FF4500', // Badge background color
    borderRadius: 15, // Rounded corners
    paddingVertical: 4, // Vertical padding
    paddingHorizontal: 8, // Horizontal padding
    marginTop: 5, // Space above the badge
    alignSelf: 'flex-start', // Align badge to start
  },
  badgeText: {
    color: 'white', // Text color
    fontSize: 12, // Font size for the badge text
  },
});


export default UserProfileDetail;