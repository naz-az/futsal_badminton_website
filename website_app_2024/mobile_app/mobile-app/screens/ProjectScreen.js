import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  Linking
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthContext from '../context/authContext';
import RelatedProjectsSlider from '../components/RelatedProjectsSlider';
import VotingButtons from '../components/VotingButtons';
import Comment from '../components/Comment';
import PostComment from '../components/PostComment';
import AttendButton from '../components/AttendButton';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { format, parseISO } from 'date-fns';

import FavoriteButton from '../components/FavoriteButton';

import ProjectComponent from '../components/ProjectComponent';

import moment from 'moment';


function ProjectScreen() {
  const [project, setProject] = useState({ project_images: [], attendees: [] });
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const route = useRoute();
  const { id } = route.params;
  console.log("Project ID:", id); // Add this line to check the ID

  const auth = useContext(AuthContext);
  const [token, setToken] = useState(null); // State to store the token

  const currentUserId = auth.user?.profile.id;
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const currentUser = auth.user;

  const [isAttending, setIsAttending] = useState(false);
  const [attendees, setAttendees] = useState([]);

  const navigation = useNavigation();


  useEffect(() => {
    // Fetch and set the token
    const getToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      console.log("Token fetched: ", storedToken); // Debugging log
      setToken(storedToken);
    };

    getToken();
  }, []);

  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };

  const refreshComments = useCallback(() => {
    axios
      .get(`http://127.0.0.1:8000/api/comments/${id}`)
      .then((response) => setComments(response.data))
      .catch((error) => console.error("Error refreshing comments:", error));
  }, [id]);

  useEffect(() => {
    async function fetchProject() {
      try {
        const { data } = await axios.get(`http://127.0.0.1:8000/api/projects/${id}`);
        setProject({
          ...data.project,
        });
        setSelectedImage(data.project.featured_image);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    }

    fetchProject();
    refreshComments();
  }, [id, refreshComments]);

  const handleImageSelect = (image) => {
    setSelectedImage(processImageUrl(image));
  };

  useEffect(() => {
    async function fetchRelatedProjects(tags) {
      const promises = tags.map((tag) =>
        axios.get(`http://127.0.0.1:8000/api/projects/?tag_id=${tag.id}`)
      );
      const responses = await Promise.all(promises);
      const allRelatedProjects = responses.flatMap((response) => response.data);

      const uniqueRelatedProjects = Array.from(
        new Set(allRelatedProjects.map((p) => p.id))
      ).map((id) => allRelatedProjects.find((p) => p.id === id));

      setRelatedProjects(uniqueRelatedProjects);
    }

    if (project && project.tags && project.tags.length) {
      fetchRelatedProjects(project.tags);
    }
  }, [project]);

  useEffect(() => {
    async function checkFavoriteStatus() {
      if (auth.isAuthenticated && id) { // Ensure id is defined
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`http://127.0.0.1:8000/api/favorites/is-favorite/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsFavorited(response.data.isFavorited);
      }
    }

    checkFavoriteStatus();
  }, [id, auth.isAuthenticated]);

  const handleAddFavorite = async () => {
    if (!auth.isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post(`http://127.0.0.1:8000/api/favorites/add/${id}/`, {}, config);
      setIsFavorited(true);
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const handleRemoveFavorite = async () => {
    if (!auth.isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`http://127.0.0.1:8000/api/favorites/remove/${id}/`, config);
      setIsFavorited(false);
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const openDealLink = (url) => {
    const dealUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
    // Open the link using a suitable method, such as Linking from react-native or a webview
  };


  useEffect(() => {
    const checkAttendanceStatus = async () => {
      if (auth.isAuthenticated && id) { // Ensure id is defined
        try {
          const token = await AsyncStorage.getItem("token");
          const response = await axios.get(`http://127.0.0.1:8000/api/attendance/is-attending/${id}/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setIsAttending(response.data.isAttending);
        } catch (error) {
          console.error('Error checking attendance:', error);
        }
      }
    };
  
    checkAttendanceStatus();
  }, [id, auth.isAuthenticated]);
  

  const handleAddAttendance = async () => {
    if (!auth.isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post(`http://127.0.0.1:8000/api/attendance/add/${id}/`, {}, config);
      setIsAttending(true);
    
      // Re-fetch attendees to update the list
      fetchAttendees();
    } catch (error) {
      console.error("Error adding attendance:", error);
    }
  };
  
  
  const handleRemoveAttendance = async () => {
    if (!auth.isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`http://127.0.0.1:8000/api/attendance/remove/${id}/`, config);
      setIsAttending(false);
    
      // Re-fetch attendees to update the list
      fetchAttendees();
    } catch (error) {
      console.error("Error removing attendance:", error);
    }
  };
  
  

  const fetchAttendees = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`http://127.0.0.1:8000/api/projects/${id}/attendees/`, config);
      setAttendees(response.data);
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  // useEffect for fetching attendees initially
  useEffect(() => {
    fetchAttendees();
  }, [id]);  // Make sure to include 'id' as a dependency


  const navigateToProfile = (attendeeId) => {
    // Determine if the current user is the owner
    const isCurrentUserOwner = currentUserId === attendeeId;

    // Define the route and parameters based on the ownership condition
    const route = isCurrentUserOwner ? 'UserAccount' : 'UserProfileDetail';
    const params = isCurrentUserOwner ? {} : { id: attendeeId };

    // Navigate to the appropriate route with parameters
    navigation.navigate(route, params);
};


const renderItem = ({ item }) => (
  <TouchableOpacity 
    style={styles.items} 
    onPress={() => navigateToProfile(item.attendee.id)}
  >
    <Image 
      source={{ uri: processImageUrl(item.attendee.profile_image) }} // Use processImageUrl here
      style={styles.image}
    />
    <Text style={styles.text}>
      {item.attendee.name}
    </Text>
  </TouchableOpacity>
);

// Function to format dates using moment.js
const formatMomentDate = (dateString) => {
  return dateString ? moment.utc(dateString).format("DD/MM/YY, (ddd), hh:mm A,") + " UTC+8" : "N/A";
};

  return (
    <ScrollView style={styles.container}>

<View style={styles.goBackButtonContainer}>
    <Icon name="arrow-back" size={25} color="#333" onPress={() => navigation.goBack()} />
    {/* Other components can be added here if needed */}
    <FavoriteButton projectId={project.id} token={token} />
</View>


      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: processImageUrl(selectedImage) }} 
          style={styles.mainImage}
        />
        <ScrollView 
          horizontal
          style={styles.thumbnailContainer}>
          {[project.featured_image, ...project.project_images.map(img => img.image)].map((img, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => handleImageSelect(img)}>
              <Image 
                source={{ uri: processImageUrl(img) }}
                style={styles.thumbnail}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.listGroup}>
        <Text style={styles.title}>{project.title}</Text>
        

        <View style={styles.item}>
            <Icon name="event-available" size={25} color="#333" />
            <Text style={styles.label}>Start:</Text>
            <Text style={styles.value}>{formatMomentDate(project.start_date)}</Text>
        </View>

        <View style={styles.item}>
            <Icon name="event-busy" size={25} color="#333" />
            <Text style={styles.label}>End:</Text>
            <Text style={styles.value}>{formatMomentDate(project.end_date)}</Text>
        </View>

      <View style={styles.item}>
  <Icon name="location-on" size={25} color="#333" />
  <Text style={styles.value}>{project.location}</Text>
</View>

<View style={styles.item}>
  <Icon name="tag" size={25} color="#333" />
  <Text style={styles.value}>RM {project.price}</Text>
</View>


<Text style={styles.headerHost}>Hosting</Text>
<TouchableOpacity 
  onPress={() => navigation.navigate(currentUserId === project.owner?.id ? 'UserAccount' : 'UserProfileDetail', { id: project.owner?.id })}
  style={styles.profileLink}>
  {project.owner?.profile_image && (
    <Image
      source={{ uri: processImageUrl(project.owner.profile_image) }}
      style={styles.profileImage}
    />
  )}
  <Text>{project.owner?.name}</Text>
</TouchableOpacity>


      <Text style={styles.header}>Attendees ({attendees.length})</Text>
      <FlatList
        data={attendees}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />


      </View>

        {/* Tags Section */}
        <View style={styles.tagsContainer}>
          {project.tags && project.tags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              onPress={() => navigation.navigate('Categories', { tag_id: tag.id })}
              style={styles.tagButton}>
              <Text style={styles.tagButtonText}>{tag.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

      <View style={styles.detailsContainer}>
      <Text style={styles.headerDesc}>Description</Text>

        <Text style={styles.detailItem}>{project.description}</Text>
      </View>

      <View style={styles.cardContainer}>

      {/* Attendees List and other UI components */}

      {/* Add the AttendButton component */}
      {console.log("Rendering AttendButton with token: ", token)} {/* Debugging log */}
      {token && <AttendButton projectId={project.id} token={token} />}

        {/* Favourites Button */}

        {/* Deal Link */}
        <TouchableOpacity
                  onPress={() => {
                    const url = project.deal_link.startsWith("http://") || project.deal_link.startsWith("https://")
                      ? project.deal_link
                      : "http://" + project.deal_link;
                    Linking.openURL(url);
                  }}
                  style={styles.dealButton}
                >
          <Text style={styles.dealButtonText}>Go to event link</Text>
        </TouchableOpacity>


      </View>

      <View style={styles.votingButton}>
      <Text style={styles.reviewsTitle}>Reviews</Text>

      {/* Voting Buttons Component */}
      <VotingButtons projectId={id} />
      </View>






      {/* Comments Section */}
      <View style={styles.commentsContainer}>
        <Text style={styles.commentsTitle}>Comments</Text>
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            projectId={id}
            currentUser={auth.user}
            onCommentUpdated={refreshComments} // Pass the refresh function
          />
        ))}
      </View>

      {/* Post Comment Section */}
      <View style={styles.postCommentContainer}>
        {auth.isAuthenticated && <PostComment projectId={id} onCommentPosted={refreshComments} />}
      </View>

      {/* Related Projects Slider */}
      {/* <RelatedProjectsSlider
        relatedProjects={relatedProjects}
        currentProjectId={id}
      /> */}

<View style={styles.relatedContainer}>
  <Text style={styles.related}>Related Events</Text>

  {relatedProjects
    .filter((relatedProject) => relatedProject.id !== id)
    .map((relatedProject) => (
      <ProjectComponent 
        key={relatedProject.id}
        project={relatedProject}
        // Include any other props that ProjectComponent might need
      />
  ))}
</View>



      {/* Additional UI elements for the rest of the project details */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  goBackButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginVertical: 10,
},

  imageContainer: {
    alignItems: 'center',
    marginVertical: 10,
    width: '100%', // Ensure container takes full width

  },
  mainImage: {
    width: '100%', // Image takes full width of its container
    // width: 300,
    height: 250,
    resizeMode: 'cover',
    borderRadius: 10,

  },
  hostingLabel: {
    fontWeight: 'bold',
    marginBottom: 5, // Adjust spacing as needed
    // Add any other styling you wish
  },
  thumbnailContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  thumbnail: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 5,

  },
  listGroup: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
 detailsContainer: {
  paddingHorizontal: 10,
},
  detailItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  cardContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 20,

  },
  cardDetail: {
    fontSize: 16,
  },
  cardDetailValue: {
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 20,


  },
  tagButton: {
    backgroundColor: '#f2ebe0',
    padding: 8,
    borderRadius: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  tagButtonText: {
    color: '#000000',
    fontSize: 12,
  },
  dealButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,  // Adjust the value as needed

  },
  dealButtonText: {
    color: '#000',
  },
  addFavouriteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  removeFavouriteButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  favouriteButtonText: {
    color: '#fff',
  },
  commentsContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    // marginBottom: 5,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  postCommentContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginVertical: 8, // Adjust margin as needed for equal spacing
    marginTop: 8,
    borderBottomWidth: 1, // Add a bottom border
    borderBottomColor: '#cccccc', // Set the color of the border
    paddingBottom: 8, // Add padding below the content, equal to marginVertical for balance
  },
  
  separator: {
    height: 1, // or the thickness you prefer
    backgroundColor: '#ccc', // grey color
    marginVertical: 8, // optional, for spacing
  },
  
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,

  },
  value: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,

  },
  votingButton: {
    paddingLeft: 10, // Adjust the value as needed
    paddingRight: 10, // Adjust the value as needed
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  text: {
    color: '#000',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,

  },
  headerHost: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  headerDesc: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  related: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  relatedContainer: {
    padding: 10, // Add padding around the entire related projects section
    // You can add other styling properties as needed
  },
  items: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  }, 
});

export default ProjectScreen;