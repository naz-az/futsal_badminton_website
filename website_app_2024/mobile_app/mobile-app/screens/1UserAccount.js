import React, { useState, useEffect } from "react";
import axios from "axios";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Picker } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Button, ButtonGroup  } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';


function UserAccount() {
  const [accountData, setAccountData] = useState({ profile: {}, projects: [] });
  const [projects, setProjects] = useState([]);
  const [displayedProjects, setDisplayedProjects] = useState(6);
  const [sortType, setSortType] = useState('newest');
  
  const navigation = useNavigation();

  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [selectedSortType, setSelectedSortType] = useState('');
  const [selectedSortOrder, setSelectedSortOrder] = useState('');

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

      const response = await axios.get(`http://127.0.0.1:8000/api/profiles/${id}/projects/`);
      setProjects(response.data);
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
    navigation.navigate('Followers');
  };

  const navigateToFollowing = () => {
    navigation.navigate('Following');
  };

  const navigateToFollowedTags = () => {
    navigation.navigate('FollowedTags');
  };

  const navigateToAddProject = () => {
    navigation.navigate('AddProject');
  };



  // Function to navigate to project details
  const navigateToProject = (projectId) => {
    navigation.navigate('ProjectDetails', { projectId });
  };

  // Function to open external deal link
  const openDealLink = (url) => {
    const fullUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `http://${url}`;
    Linking.openURL(fullUrl);
  };

  // Function to render each project card
  const renderProject = (project) => {
    return (
      <View key={project.id} style={styles.projectCard}>
        <TouchableOpacity onPress={() => navigateToProject(project.id)}>
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
          {/* Add VotingButtons and FavoriteButton Components as per your implementation */}
          <Text style={styles.projectPrice}>RM {project.price}</Text>
          <Button
            title="Go to deal"
            onPress={() => openDealLink(project.deal_link)}
            buttonStyle={styles.dealButton}
          />

<View style={styles.actionButtons}>
        <Button
          title="Edit"
          onPress={() => editProject(project.id)}
          buttonStyle={styles.editButton}
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


      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <Button
          title="Edit Account"
          onPress={() => navigation.navigate('EditAccount')}
          buttonStyle={styles.editButton}
        />

        <Image
          source={{ uri: processImageUrl(accountData.profile.profile_image) }}
          style={styles.profileImage}
        />

        <Text style={styles.profileName}>{accountData.profile.name}</Text>
        <Text style={styles.profileLocation}>{accountData.profile.location}</Text>

        <View style={styles.socialLinks}>
          {renderSocialLinks(accountData.profile)}
        </View>
      </View>
      
      
      
      {/* Followers and Following */}
      <View style={styles.followSection}>
        <TouchableOpacity onPress={navigateToFollowers}>
          <Text>{accountData.profile.followers_count} Followers</Text>
        </TouchableOpacity>
        <Text> · </Text>
        <TouchableOpacity onPress={navigateToFollowing}>
          <Text>{accountData.profile.following_count} Following</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="View Followed Tags"
        onPress={navigateToFollowedTags}
        buttonStyle={styles.followedTagsButton}
      />

      {/* Projects Section */}
      <View style={styles.projectsSection}>
        <Text style={styles.sectionTitle}>Deals Posted ({accountData.projects.length})</Text>
        <Button
          title="Add Deal"
          onPress={navigateToAddProject}
          buttonStyle={styles.addButton}
        />

        {/* Sorting Buttons */}
        <ButtonGroup>
{/* Sorting Options */}
      <Button
        title="Sort Projects"
        onPress={toggleSortModal}
        buttonStyle={styles.sortButton}
      />

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
      
              </ButtonGroup>
      </View>
      
            {/* Projects Section */}
            <View style={styles.projectsSection}>
        {/* ... Existing projects section code */}
        {accountData.projects.map((project) => renderProject(project))}
      </View>
      
      
      
      
          </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileLocation: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  followSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
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
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },

  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  projectImage: {
    width: '100%',
    height: 250,
  },
  cardBody: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: 'skyblue', // Change as per your color scheme
    padding: 8,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: 'tomato', // Change as per your color scheme
    padding: 8,
    borderRadius: 5,
  },
  dealButton: {
    backgroundColor: '#28a745', // Green color for 'Go to deal' button
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  applyButton: {
    backgroundColor: '#007bff', // Blue color for 'Apply' button
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  followedTagsButton: {
    backgroundColor: '#17a2b8', // Teal color for 'View Followed Tags' button
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  projectsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#ffc107', // Yellow color for 'Add Deal' button
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  sortButton: {
    backgroundColor: '#6c757d', // Gray color for 'Sort Projects' button
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  
});

export default UserAccount;
