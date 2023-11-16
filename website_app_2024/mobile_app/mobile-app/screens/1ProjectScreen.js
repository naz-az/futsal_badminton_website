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
  Button
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthContext from '../context/authContext';
import RelatedProjectsSlider from '../components/RelatedProjectsSlider';
import VotingButtons from '../components/VotingButtons';
import Comment from '../components/Comment';
import PostComment from '../components/PostComment';

function ProjectScreen() {
  const [project, setProject] = useState({ project_images: [] });
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const route = useRoute();
  const { id } = route.params;
  const auth = useContext(AuthContext);

  const currentUserId = auth.user?.profile.id;
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const currentUser = auth.user;

  const navigation = useNavigation();

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
        setProject(data.project);
        setSelectedImage(processImageUrl(data.project.featured_image));
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
      if (auth.isAuthenticated) {
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.goBackButtonContainer}>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
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
        
        <TouchableOpacity 
          onPress={() => navigation.navigate(currentUserId === project.owner?.id ? 'UserAccount' : 'Profile', { id: project.owner?.id })}
          style={styles.profileLink}>
          {project.owner?.profile_image && (
            <Image
              source={{ uri: processImageUrl(project.owner.profile_image) }}
              style={styles.profileImage}
            />
          )}
          <Text>{project.owner?.name}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailItem}>Price: ${project.price}</Text>
        <Text style={styles.detailItem}>Description: {project.description}</Text>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.cardDetail}>Price: <Text style={styles.cardDetailValue}>${project.price}</Text></Text>
        <Text style={styles.cardDetail}>Brand: <Text style={styles.cardDetailValue}>{project.brand}</Text></Text>

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

        {/* Deal Link */}
        <TouchableOpacity style={styles.dealButton} onPress={() => openDealLink(project.deal_link)}>
          <Text style={styles.dealButtonText}>Go to deal</Text>
        </TouchableOpacity>

        {/* Favourites Button */}
        <TouchableOpacity 
          style={isFavorited ? styles.removeFavouriteButton : styles.addFavouriteButton} 
          onPress={isFavorited ? handleRemoveFavorite : handleAddFavorite}>
          <Text style={styles.favouriteButtonText}>
            {isFavorited ? 'Remove from Favourites' : 'Add to Favourites'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Voting Buttons Component */}
      <VotingButtons projectId={id} />


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
      <RelatedProjectsSlider
        relatedProjects={relatedProjects}
        currentProjectId={id}
      />





      {/* Additional UI elements for the rest of the project details */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  goBackButtonContainer: {
    marginVertical: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  mainImage: {
    width: 300,
    height: 250,
    resizeMode: 'cover',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  thumbnail: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  listGroup: {
    padding: 10,
  },
  title: {
    fontSize: 20,
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
    padding: 10,
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
  },
  tagButton: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  tagButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  dealButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
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
    marginTop: 50,
    paddingHorizontal: 10,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postCommentContainer: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },
});

export default ProjectScreen;