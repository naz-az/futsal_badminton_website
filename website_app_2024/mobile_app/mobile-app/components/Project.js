import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Linking  } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

// Import custom components (make sure the import paths are correct)
import VotingButtons from "./VotingButtons";
import AuthContext from '../context/authContext';

function Project({ project }) {
  const auth = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(false);
  const navigation = useNavigation();

  const isCurrentUserOwner = auth.user && auth.user.profile.id === project.owner.id;

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (auth.isAuthenticated) {
        try {
          const token = await AsyncStorage.getItem("token");
          const response = await axios.get(`http://127.0.0.1:8000/api/favorites/is-favorite/${project.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsFavorited(response.data.isFavorited);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      }
    };
  
    checkFavoriteStatus();
  }, [project.id, auth.isAuthenticated]);

  const handleAddFavorite = async () => {
    if (!auth.isAuthenticated) {
      navigation.navigate('Login');
    } else {
      const token = await AsyncStorage.getItem("token");
      axios.post(`http://127.0.0.1:8000/api/favorites/add/${project.id}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => setIsFavorited(true))
        .catch(error => console.error("Error adding to favorites:", error));
    }
  };

  const handleRemoveFavorite = async () => {
    const token = await AsyncStorage.getItem("token");
    axios.delete(`http://127.0.0.1:8000/api/favorites/remove/${project.id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setIsFavorited(false))
      .catch(error => console.error("Error removing from favorites:", error));
  };

  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };

    // Define a dynamic style for the favorite button
    const favoriteButtonStyle = {
      marginTop: 20,
      padding: 10,
      alignItems: 'center',
      backgroundColor: isFavorited ? '#DC3545' : '#F8D7DA',
      borderRadius: 10,
    };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('ProjectScreen', { id: project.id })}>
        <Image
          source={{ uri: processImageUrl(project.featured_image) }}
          style={styles.image}
        />
      </TouchableOpacity>

      <View style={styles.cardBody}>
        <Text style={styles.title}>{project.title}</Text>
        <TouchableOpacity
  onPress={() => navigation.navigate(isCurrentUserOwner ? 'UserAccount' : 'UserProfileDetail', { id: project.owner.id })}
  style={styles.profileContainer} // Add this style for horizontal layout
>
  <Image
    source={{ uri: processImageUrl(project.owner.profile_image) }}
    style={styles.profileImage}
  />
  <Text>{project.owner.name}</Text>
</TouchableOpacity>

        {/* Integrate VotingButtons component */}
        <VotingButtons projectId={project.id} />

        <Text style={styles.price}>RM {project.price}</Text>

        <TouchableOpacity style={styles.dealButton} onPress={() => {
          const url = project.deal_link.startsWith("http://") || project.deal_link.startsWith("https://")
            ? project.deal_link
            : `http://${project.deal_link}`;
          Linking.openURL(url);
        }}>
          <Text>Go to deal</Text>
        </TouchableOpacity>

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

        <View style={styles.badge}>
  <Text style={styles.badgeText}>{project.brand}</Text>
</View>
        <TouchableOpacity 
        style={favoriteButtonStyle}

  onPress={isFavorited ? handleRemoveFavorite : handleAddFavorite}
>
  <Text>{isFavorited ? 'Remove Favourites' : 'Add Favourites'}</Text>
</TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    borderRadius: 15, // Rounded corners for images
},
cardBody: {
    padding: 15, // Increased padding
},
title: {
    fontSize: 22, // Increased font size
    fontWeight: 'bold',
},
price: {
    fontSize: 24, // Increased font size
    marginTop: 20,
},
dealButton: {
    marginTop: 15,
    backgroundColor: '#28a745', // Updated button color
    padding: 12,
    alignItems: 'center',
    borderRadius: 10, // Rounded corners for buttons
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
  brand: {
    fontSize: 16,
    marginTop: 10,
  },
  tagButton: {
    backgroundColor: '#19a2b8', // Updated button color
    padding: 8,
    marginRight: 8,
    borderRadius: 5, // Rounded corners for tags
},

  profileContainer: {
    flexDirection: 'row', // Aligns children horizontally
    alignItems: 'center', // Centers children vertically in the container
    // Add any additional styling like margin or padding as needed
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

export default Project;
