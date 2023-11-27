import React, { useState, useEffect } from "react";
import axios from "axios";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, Modal, Picker, Linking  } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Button, ButtonGroup  } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import VotingButtons from "../components/VotingButtons";
import AttendButton from '../components/AttendButton';
import ProjectComponent from "../components/ProjectComponent";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import { faYoutube, faFacebook, faInstagram, faTwitter, faSquareJs } from '@fortawesome/free-brands-svg-icons';


function UserAccount() {
  const [accountData, setAccountData] = useState({ profile: {}, projects: [] });
  const [projects, setProjects] = useState([]);
  const [displayedProjects, setDisplayedProjects] = useState(6);
  const [sortType, setSortType] = useState('newest');
  
  const navigation = useNavigation();

  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [selectedSortType, setSelectedSortType] = useState('');
  const [selectedSortOrder, setSelectedSortOrder] = useState('');

  const [attendees, setAttendees] = useState([]);

  const [token, setToken] = useState(null); // State to store the token


  useEffect(() => {
    // Fetch and set the token
    const getToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      console.log("Token fetched: ", storedToken); // Debugging log
      setToken(storedToken);
    };

    getToken();
  }, []);
  
  const toggleSortModal = () => {
    setSortModalVisible(!isSortModalVisible);
  };

  const applySort = () => {
    sortProjects(selectedSortType, selectedSortOrder);
    toggleSortModal();
  };

  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/api/user/account/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAccountData(response.data);
        sortProjects('newest');
      } catch (error) {
        console.error("Error fetching user account data", error);
      }
    };

    const fetchProjects = async () => {
      const id = accountData.profile.id;
    
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/profiles/${id}/projects/`);
        setProjects(response.data);
    
        // Fetch attendees for each project
        response.data.forEach(project => {
          fetchAttendees(project.id);
        });
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    
  
    fetchData();
    if (accountData.profile.id) {
      fetchProjects();
    }
  }, [accountData.profile.id]);

  const editProject = (projectId) => {
    navigation.navigate('EditProject', { projectId });
  };

  const deleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/delete/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Something went wrong");
        }

        setAccountData((prevState) => ({
          ...prevState,
          projects: prevState.projects.filter((project) => project.id !== projectId),
        }));

        console.log("Project deleted successfully");
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  // Add more UI components and styles as per mobile design needs


  const sortProjects = (type, order) => {
    setSortType(type);
  
    setAccountData(prevState => {
      let sortedProjects = [...prevState.projects];
      if (type === 'top') {
        sortedProjects.sort((a, b) => (order === 'topToLow' ? b.upvotes - a.upvotes : a.upvotes - b.upvotes));
      } else if (type === 'price') {
        sortedProjects.sort((a, b) => (order === 'highToLow' ? b.price - a.price : a.price - b.price));
      } else { // 'date' or any other type
        sortedProjects.sort((a, b) => {
          return order === 'newToOld'
            ? new Date(b.created) - new Date(a.created)
            : new Date(a.created) - new Date(b.created);
        });
      }
      return { ...prevState, projects: sortedProjects };
    });
  };


  const renderSocialLinks = (profile) => {
    const socialPlatforms = [
      { type: 'facebook', icon: 'facebook' },
      { type: 'twitter', icon: 'twitter' },
      { type: 'instagram', icon: 'instagram' },
      { type: 'youtube', icon: 'youtube' },
      { type: 'website', icon: 'globe' },
    ];

    return socialPlatforms.map(platform => {
      const url = profile[`social_${platform.type}`];
      if (url) {
        return (
          <TouchableOpacity key={platform.type} onPress={() => Linking.openURL(url.startsWith('http') ? url : `https://${url}`)}>
            <Icon name={platform.icon} size={20} style={{ marginRight: 10 }} />
          </TouchableOpacity>
        );
      }
    });
  };

  // Navigation to different screens
  const navigateToFollowers = () => {
    navigation.navigate('FollowersPage');
  };

  const navigateToFollowing = () => {
    navigation.navigate('FollowingPage');
  };

  const navigateToFollowedTags = () => {
    navigation.navigate('FollowedTagsPage');
  };

  const navigateToAddProject = () => {
    navigation.navigate('AddProject');
  };

  const navigateToUserAccount = () => {
    navigation.navigate('UserAccount');
  };

  // Function to navigate to project details
  const navigateToProject = (projectId) => {
    navigation.navigate('ProjectScreen', { projectId });
  };

  // Function to open external deal link
  const openDealLink = (url) => {
    const fullUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `http://${url}`;
    Linking.openURL(fullUrl);
  };

    // Function to fetch attendees
    const fetchAttendees = async (projectId) => {
      console.log('Fetching attendees for project ID:', projectId); // Log when function is called
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token:', token); // Check if the token is retrieved successfully
        const response = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/attendees/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Attendees Response:', response); // Log entire response
        setAttendees(response.data);
        console.log('Attendees:', response.data); // Log attendees data
      } catch (error) {
        console.error('Error fetching attendees:', error);
        console.log(error.response ? error.response.data : 'No response data'); // Log response data on error
      }
    };
  
    // Function to render each attendee
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
  
    // Navigate to user profile
    const navigateToProfile = (userId) => {
      navigation.navigate('UserProfileDetail', { id: userId });
    };

    
  // Function to render each project card
  const renderProject = (project) => {
    return (
      <View key={project.id} style={styles.projectCard}>
        <TouchableOpacity onPress={() => navigation.navigate('ProjectScreen', { id: project.id })}>
          <Image
            source={{ uri: processImageUrl(project.featured_image) }}
            style={styles.projectImage}
          />
        </TouchableOpacity>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{project.title}</Text>
          <TouchableOpacity onPress={() => navigateToUserAccount()}>
            <View style={styles.ownerInfo}>
              <Image
                source={{ uri: processImageUrl(project.owner.profile_image) }}
                style={styles.ownerImage}
              />
              <Text>{project.owner.name}</Text>
            </View>
          </TouchableOpacity>

          <VotingButtons projectId={project.id} />





          {/* Add VotingButtons and FavoriteButton Components as per your implementation */}
          <Text style={styles.projectPrice}>RM {project.price}</Text>

          <View style={styles.item}>
        <Text style={styles.label}>Start Date & Time:</Text>
        <Text style={styles.value}>{project.start_date || 'N/A'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>End Date & Time:</Text>
        <Text style={styles.value}>{project.end_date || 'N/A'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{project.location}</Text>
      </View>


      {/* Attendees List */}
      <View>
        <Text>Attendees ({attendees.length})</Text>
        <FlatList
          data={attendees}
          renderItem={renderAttendee}
          keyExtractor={item => item.attendee.id.toString()}
        />
      </View>

            {/* Add the AttendButton component */}
            {console.log("Rendering AttendButton with token: ", token)} {/* Debugging log */}

{token && <AttendButton projectId={project.id} token={token} />}


          <Button
            title="Go to deal"
            onPress={() => openDealLink(project.deal_link)}
            buttonStyle={styles.dealButton}
          />

        {/* Tags and Brand */}
        <View style={styles.tagsContainer}>
          {project.tags.map((tag) => (
            <TouchableOpacity 
  key={tag.id} 
  style={styles.tagButton} 
  onPress={() => navigation.navigate('Categories', { tag_id: tag.id })}
>
  <Text>{tag.name}</Text>
</TouchableOpacity>

          ))}
        </View>

        {/* <View style={styles.badge}>
  <Text style={styles.badgeText}>{project.brand}</Text>
</View> */}

<View style={styles.actionButtons}>
        <Button
          title="Edit"
          onPress={() => editProject(project.id)}
          buttonStyle={styles.reditButton}
        />
        <Button
          title="Delete"
          onPress={() => deleteProject(project.id)}
          buttonStyle={styles.deleteButton}
        />
      </View>
              </View>
      </View>
    );
  };


  return (
    <ScrollView style={styles.container}>

<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
  <TouchableOpacity
    onPress={navigateToFollowedTags}
    style={styles.followedTagsButton}
  >
    <Text style={{ color: '#fff' }}>View Followed Tags</Text>
  </TouchableOpacity>

  <View style={{ flexDirection: 'row' }}>
    <TouchableOpacity
      onPress={() => navigation.navigate('EditAccount')}
      style={[styles.editButton, { marginRight: 10 }]}
    >
      <Icon name="edit" size={20} color="#fff" />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => navigation.navigate('SettingsPage')}
      style={styles.settingsButton}
    >
      <Icon name="cog" size={20} color="#fff" />
    </TouchableOpacity>
  </View>
</View>




{/* <View style={{ alignItems: 'center', marginBottom: 20 }}> */}
<View style={styles.profileCard}>

        <Image
          source={{ uri: processImageUrl(accountData.profile.profile_image) }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{accountData.profile.name}</Text>
        <Text>{accountData.profile.short_intro}</Text>
        {accountData.profile.location && <Text>Based in {accountData.profile.location}</Text>}
  
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, marginBottom: 10 }}>
  {accountData.profile.social_facebook && (
    <TouchableOpacity onPress={() => Linking.openURL(profile.social_facebook)}>
      <FontAwesomeIcon icon={faFacebook} size={24} color="blue" style={{ marginHorizontal: 10 }} />
    </TouchableOpacity>
  )}

  {accountData.profile.social_twitter && (
    <TouchableOpacity onPress={() => Linking.openURL(profile.social_twitter)}>
      <FontAwesomeIcon icon={faTwitter} size={24} color="#1DA1F2" style={{ marginHorizontal: 10 }} />
    </TouchableOpacity>
  )}

  {accountData.profile.social_instagram && (
    <TouchableOpacity onPress={() => Linking.openURL(profile.social_instagram)}>
      <FontAwesomeIcon icon={faInstagram} size={24} color="#C13584" style={{ marginHorizontal: 10 }} />
    </TouchableOpacity>
  )}

  {accountData.profile.social_youtube && (
    <TouchableOpacity onPress={() => Linking.openURL(profile.social_youtube)}>
      <FontAwesomeIcon icon={faYoutube} size={24} color="red" style={{ marginHorizontal: 10 }} />
    </TouchableOpacity>
  )}

  {accountData.profile.social_website && (
    <TouchableOpacity onPress={() => Linking.openURL(profile.social_website)}>
      <FontAwesomeIcon icon={faSquareJs} size={24} color="black" style={{ marginHorizontal: 10 }} />
    </TouchableOpacity>
  )}
</View>


      
      
      
      {/* Followers and Following */}

      <View style={styles.followSection}>
  <TouchableOpacity onPress={navigateToFollowers} style={styles.followButton}>
    <Text style={styles.followCount}>{accountData.profile.followers_count}</Text>
    <Text>Followers</Text>
  </TouchableOpacity>
  <Text style={styles.separator}></Text>
  <TouchableOpacity onPress={navigateToFollowing} style={styles.followButton}>
    <Text style={styles.followCount}>{accountData.profile.following_count}</Text>
    <Text>Following</Text>
  </TouchableOpacity>
</View>

</View>
{/* </View> */}



      {/* Projects Section */}
      <View style={styles.projectsSection}>
        <Text style={styles.sectionTitle}>Events Posted ({accountData.projects.length})</Text>
           
              {/* Button Container */}
      <View style={styles.buttonContainer}>

      <Button
          onPress={toggleSortModal}
          buttonStyle={styles.filterButton}
          icon={
            <Icon
              name="filter"
              size={18} // Adjust icon size as needed
              color="white" // Adjust icon color as needed
            />
          }
        />
{/* Add Event Button */}
<Button
          title="Add Event"
          onPress={navigateToAddProject}
          buttonStyle={styles.addButton}
          icon={
            <Icon
              name="plus"
              size={14} // Adjust icon size as needed
              color="white" // Adjust icon color as needed
              style={{ marginRight: 5 }} // Add space between icon and text
            />
          }
          iconRight={false} // Set to true if you want the icon after the text
        />



      </View>

      {/* Sort Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSortModalVisible}
        onRequestClose={toggleSortModal}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Sort By</Text>

          <Picker
            selectedValue={selectedSortType}
            onValueChange={(itemValue) => setSelectedSortType(itemValue)}
          >
            <Picker.Item label="Top" value="top" />
            <Picker.Item label="Price" value="price" />
            <Picker.Item label="Date" value="date" />
          </Picker>

          <Picker
            selectedValue={selectedSortOrder}
            onValueChange={(itemValue) => setSelectedSortOrder(itemValue)}
          >
            <Picker.Item label="High to Low" value="highToLow" />
            <Picker.Item label="Low to High" value="lowToHigh" />
            <Picker.Item label="New to Old" value="newToOld" />
            <Picker.Item label="Old to New" value="oldToNew" />
          </Picker>

          <Button
            title="Apply"
            onPress={applySort}
            buttonStyle={styles.applyButton}
          />
        </View>
      </Modal>
      
      </View>
      
            {/* Projects Section */}
            <View style={styles.projectsSection}>
        {/* ... Existing projects section code */}
        {accountData.projects.map((project) => (
  <ProjectComponent
    key={project.id}
    project={project}
    token={token}
    attendees={attendees}
    showEditDeleteButtons={true}
    onEdit={editProject}
    onDelete={deleteProject}
  />
))}
      </View>
      
      
      
      
          </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff'
    },
  profileSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    alignItems: "center",
    marginBottom: 30, // Increased spacing
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    padding: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: "#73b1af", // Primary color for buttons
    padding: 10,
    borderRadius: 5,
    // marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  profileLocation: {
    fontSize: 14,
    color: "gray",
    marginBottom: 10,
  },
  socialLinks: {
    flexDirection: "row",
    justifyContent: "center",
  },
  followSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
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
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20, // Increased spacing between cards
    overflow: "hidden",
  },
  projectImage: {
    width: "100%",
    height: 250,
  },
  cardBody: {
    padding: 15, // Increased padding for more spacious layout
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ownerImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  projectPrice: {
    fontSize: 22,
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: "tomato", // Change as per your color scheme
    padding: 8,
    borderRadius: 5,
  },
  dealButton: {
    backgroundColor: "#28a745", // Green color for 'Go to deal' button
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  applyButton: {
    backgroundColor: "#007bff", // Blue color for 'Apply' button
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  followedTagsButton: {
    backgroundColor: "#17a2b8", // Teal color for 'View Followed Tags' button
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  projectsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#ffc107", // Yellow color for 'Add Deal' button
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  sortButton: {
    backgroundColor: "#6c757d", // Gray color for 'Sort Projects' button
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  tagButton: {
    backgroundColor: '#007BFF',
    padding: 5,
    marginRight: 6,
    borderRadius: 5,
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
  settingsButton: {
    backgroundColor: "#94a8b2", // You can choose a different color
    padding: 10,
    borderRadius: 5,
  },
  reditButton: {
    backgroundColor: "#73b1af", // Primary color for buttons
    padding: 10,
    borderRadius: 5,
    // marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    // paddingHorizontal: 10, // Adjust padding as needed
  },
  sortButtonText: {
    fontSize: 14, // Set the font size to 14
  },
  addButtonText: {
    fontSize: 14, // Set the font size to 14
  },
  filterButton: {
    // Add styles for the filter button if needed
    padding: 10, // Example padding
    backgroundColor: "#4b555d",
  },
});

export default UserAccount;
