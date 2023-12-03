import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, ScrollView, Image, TouchableOpacity, FlatList, Picker, StyleSheet, Linking, Modal } from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from "@react-navigation/native";
import VotingButtons from "../components/VotingButtons"; // Adjust as per React Native
import FavoriteButton from "../components/FavoriteButton"; // Adjust as per React Native
import AuthContext from '../context/authContext';
import { FontAwesome5 } from '@fortawesome/react-native-fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faYoutube, faFacebook, faInstagram, faTwitter, faSquareJs } from '@fortawesome/free-brands-svg-icons';
import AttendButton from "../components/AttendButton";
import ProjectComponent from "../components/ProjectComponent";
import CustomButton from "../components/CustomButton";
import SortingComponent from '../components/SortingComponent';


function UserProfileDetail() {
  const [profile, setProfile] = useState({});
  const [projects, setProjects] = useState([]);
  const route = useRoute();
  const { id } = route.params;

  const [isFollowing, setIsFollowing] = useState(false);
  const navigation = useNavigation();

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [displayedProjects, setDisplayedProjects] = useState(6);

  const auth = useContext(AuthContext);
  const currentUserId = auth.user ? auth.user.profile.id : null;

  const [sortedProjects, setSortedProjects] = useState(projects);
  const [selectedSort, setSelectedSort] = useState('newToOld');
  const [token, setToken] = useState(null);

  const [attendees, setAttendees] = useState([]);

  const [currentProjectId, setCurrentProjectId] = useState(null);

    // State to control the visibility of the profile image modal
    const [isProfileImageModalVisible, setProfileImageModalVisible] = useState(false);

    const [sortType, setSortType] = useState('newToOld');

    
    // Function to toggle the profile image modal visibility
    const toggleProfileImageModal = () => {
      setProfileImageModalVisible(!isProfileImageModalVisible);
    };


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
  

  
  useEffect(() => {
    let sortedProjects = [...projects];
  
    switch (sortType) {
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
  }, [sortType, projects]); // Depend on sortType and projects




  useEffect(() => {
    const fetchAttendees = async () => {
      if (projects.length === 0) {
        console.log("No projects found for this profile.");
        return;
      }
  
      const projectId = projects[0].id;  // Fetch attendees for the first project
      console.log("Fetching attendees for project ID:", projectId);
  
      try {
        const authHeaders = await fetchAuthHeaders();
        const response = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/attendees/`, authHeaders);
        console.log("Attendees API response:", response.data);
        setAttendees(response.data);
      } catch (error) {
        console.error('Error fetching attendees:', error);
      }
    };
  
    if (projects.length > 0) {
      fetchAttendees();
    }
  }, [projects]);  // Depend on 'projects' as it contains the project IDs
  



  const navigateToProfile = (attendeeId) => {
    // Determine if the current user is the owner
    const isCurrentUserOwner = currentUserId === attendeeId;

    // Define the route and parameters based on the ownership condition
    const route = isCurrentUserOwner ? 'UserAccount' : 'UserProfileDetail';
    const params = isCurrentUserOwner ? {} : { id: attendeeId };

    // Navigate to the appropriate route with parameters
    navigation.navigate(route, params);
};


  // Function to render each attendee
  const renderAttendee = ({ item }) => (
    <TouchableOpacity 
    style={styles.items} 
    onPress={() => navigateToProfile(item.attendee.id)}
  >
    <Image 
      source={{ uri: processImageUrl(item.attendee.profile_image) }} // Use processImageUrl here
      style={styles.attendimage}
    />
    <Text style={styles.text}>
      {item.attendee.name} (@{item.attendee.username})
    </Text>
  </TouchableOpacity>
);





  

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#ffffff' }}>

<Modal
      animationType="fade"
      transparent={true}
      visible={isProfileImageModalVisible}
      onRequestClose={toggleProfileImageModal}
    >
      <TouchableOpacity
        style={styles.centeredView}
        activeOpacity={1} // Keep this to 1 to avoid the opacity change on press
        onPressOut={toggleProfileImageModal} // This will trigger when the user releases the press on the backdrop
      >
        <View style={styles.modalView} onStartShouldSetResponder={() => true}> {/* This prevents the press from reaching the backdrop when the modal is pressed */}
          <Image
            source={{ uri: processImageUrl(profile.profile_image) }}
            style={styles.modalImage}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleProfileImageModal}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>

    <View style={styles.profileCard}>
      <TouchableOpacity onPress={toggleProfileImageModal}>
        <Image
          source={{ uri: processImageUrl(profile.profile_image) }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{profile.name}</Text>
        <Text>{profile.short_intro}</Text>
        {profile.location && <Text>Based in {profile.location}</Text>}
  
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
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


{profile.id !== currentUserId && !isUserBlocked && (
  <View style={styles.buttonRow}>
    <TouchableOpacity
      onPress={async () => {
        if (!await isAuthenticated()) {
          redirectToLogin();
        } else {
          navigation.navigate('Send', { recipient: id });
        }
      }}
      style={styles.sendMessageButton}
    >
      <Text style={styles.buttonText}>Send Message</Text>
    </TouchableOpacity>

    {isFollowing ? (
      <TouchableOpacity onPress={handleUnfollow} style={[styles.button, styles.outlineButton]}>
        <Text style={styles.buttonText}>Unfollow</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={handleFollow} style={styles.button}>
        <Text style={styles.buttonText}>Follow</Text>
      </TouchableOpacity>
    )}
  </View>
)}



    <View style={styles.followSection}>
  <TouchableOpacity onPress={() => navigation.navigate('OtherUserFollowersPage', { profileId: id })} style={styles.followButton}>
    <Text style={styles.followCount}>{profile.followers_count}</Text>
    <Text>Followers</Text>
  </TouchableOpacity>
  <Text style={styles.separator}></Text>
  <TouchableOpacity onPress={() => navigation.navigate('OtherUserFollowingPage', { profileId: id })} style={styles.followButton}>
    <Text style={styles.followCount}>{profile.following_count}</Text>
    <Text>Following</Text>
  </TouchableOpacity>
</View>
</View>


    <View style={{ marginTop: 10, backgroundColor: '#fff', borderRadius: 10, marginBottom: 20 }}>
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
            <SortingComponent sortType={sortType} setSortType={setSortType} />

            {sortedProjects.map((project) => (
              <ProjectComponent key={project.id} project={project} />
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
    // padding: 15,
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
    backgroundColor: '#ffffff',

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
  attendimage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  text: {
    color: '#000',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    marginVertical: 8,
    // paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  items: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  }, 
  followSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginTop: 10,

  },
  followButton: {
    alignItems: 'center', // Center items vertically
  },
  followCount: {
    fontWeight: 'bold', // Optionally make the count bold
    fontSize: 16,

  },
  
  separator: {
    marginHorizontal: 10, // Adjust spacing between followers and following
  },
  profileCard: {
    backgroundColor: '#ffffff', // White background
    borderRadius: 10, // Rounded corners
    shadowColor: '#000', // Black shadow
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 4, // Shadow blur radius
    elevation: 5, // Elevation for Android
    padding: 15, // Inner padding
    alignItems: 'center', // Center items inside the card
    marginVertical: 20, // Vertical margin
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  button: {
    backgroundColor: '#ece2ff', // Blue background
    borderColor: '#bfbfbf', // Blue border
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5, // Added horizontal margin for spacing
  },
  sendMessageButton: {
    backgroundColor: '#d2e6fb', // Blue background
    borderColor: '#bfbfbf', // Blue border
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5, // Added horizontal margin for spacing
  },

  outlineButton: {
    backgroundColor: '#0aa0a424',
    borderColor: '#bfbfbf', // Blue border
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5, // Added horizontal margin for spacing
  },

  // Ensure buttonText style is set to black
  buttonText: {
    color: 'black',
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.8)', // Fully opaque black background
  },
  modalView: {
    backgroundColor: "transparent", // No need for a background color here
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalImage: {
    width: 300, // You can adjust this as needed
    height: 300, // You can adjust this as needed
    borderRadius: 150, // This should be half of width/height to make it circular
  },
  closeButton: {
    position: 'absolute',
    // top: 30, // Adjust as needed
    right: 20, // Adjust as needed
    backgroundColor: 'lightgrey',
    width: 30, // Set a fixed width
    height: 30, // Ensure height is the same as width to create a circle
    borderRadius: 15, // Half of width/height will be the borderRadius to make it a circle
    justifyContent: 'center', // Center the 'X' text horizontally
    alignItems: 'center', // Center the 'X' text vertically
    elevation: 2
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    // Remove any padding or margin if present
  },

});


export default UserProfileDetail;