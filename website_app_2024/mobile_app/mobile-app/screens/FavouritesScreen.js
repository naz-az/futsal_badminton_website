import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, Alert, 
  ActivityIndicator, Button, StyleSheet, Image , Linking
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/authContext';
import VotingButtons from '../components/VotingButtons'; // Make sure this is compatible with React Native

export default function FavouritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);
  const currentUserId = auth.user?.profile.id;


  // let profileImageUrl = project.owner.profile_image;
  const ensureFullUrl = (url) => {
    const baseUrl = 'http://127.0.0.1:8000';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `${baseUrl}${url}`;
  };
  


  const fetchFavorites = useCallback(async (sortOption, order = 'desc') => {
    try {
      let url = `http://127.0.0.1:8000/api/favorites/?sort_by=${sortOption}&order=${order}`;
      
      const token = await AsyncStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(url, config);
      setFavorites(response.data);
      setLoading(false);
    } catch (err) {
      setError('An error occurred while fetching favorites.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites('created');
  }, [fetchFavorites]);

  const handleRemove = async (projectId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK', onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const config = {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              };
              const response = await axios.delete(
                `http://127.0.0.1:8000/api/favorites/remove/${projectId}/`,
                config
              );

              if (response.data && response.data.detail) {
                console.log(response.data.detail);
                setFavorites((prevFavorites) =>
                  prevFavorites.filter((fav) => fav.project.id !== projectId)
                );
              }
            } catch (error) {
              console.error('Error removing project from favorites:', error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (error) {
    return <View style={styles.centered}><Text style={styles.errorText}>Error: {error}</Text></View>;
  }

  if (!favorites || favorites.length === 0) {
    return <View style={styles.centered}><Text>You have no favorites.</Text></View>;
  }


  const renderItem = ({ item }) => {
    let imageUrl = item.project.featured_image;
    imageUrl = ensureFullUrl(imageUrl);

      // Ensure profileImageUrl is defined and correct
  let profileImageUrl = item.project.owner.profile_image;
  profileImageUrl = ensureFullUrl(profileImageUrl);


  const isCurrentUserOwner = auth.user && auth.user.profile.id === item.project.owner.id;


    return (

      
      <View style={styles.itemContainer}>
      <View style={styles.imageAndDetails}>
        <TouchableOpacity onPress={() => navigation.navigate('ProjectScreen', { id: item.project.id })}>
          <Image source={{ uri: imageUrl }} style={styles.featuredImage} />
        </TouchableOpacity>
        <View style={styles.projectDetails}>
          <Text style={styles.titleText}>{item.project.title}</Text>
          <Text>RM {item.project.price}</Text>
        </View>
      </View>

      <View style={styles.ownerSection}>
        <TouchableOpacity onPress={() => navigation.navigate(isCurrentUserOwner ? 'UserAccount' : 'UserProfileDetail', { id: item.project.owner.id })}>
          <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
        </TouchableOpacity>
        <Text>{item.project.owner.name}</Text>
      </View>
      <View style={styles.dealSection}>
      <TouchableOpacity 
          style={styles.smallButton}
          onPress={() => {
            const url = item.project.deal_link.startsWith("http://") || item.project.deal_link.startsWith("https://")
              ? item.project.deal_link
              : `http://${item.project.deal_link}`;
            Linking.openURL(url);
          }}>
          <Text style={styles.buttonText}>Go to deal</Text>
        </TouchableOpacity>
        <View style={styles.tagsContainer}>
          {item.project.tags.map(tag => (
            <TouchableOpacity key={tag.id} style={styles.tagButton}>
              <Text style={styles.tagText}>{tag.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.smallButton, styles.removeButton]}
        onPress={() => handleRemove(item.project.id)}
      >
        <Text style={styles.buttonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

  return (
    <View style={styles.container}>
    <Text style={styles.title}>My Favorites</Text>
    <Text style={styles.subtitle}>
        You have {favorites.length} favorite item{favorites.length > 1 ? "s" : ""}.
      </Text>

      {/* Implement sorting functionality */}
      
      {loading && <ActivityIndicator size="large" />}
      {error && <Text>Error: {error}</Text>}
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={item => item.project.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f7', // Lighter background for a modern look
  },
  imageAndDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectDetails: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '600',
    color: '#34495e', // Stylish dark color
    fontFamily: 'Roboto', // Modern and clean font
    marginBottom: 15,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 18,
    color: '#7f8c8d', // Subtle grey for subtitles
    marginBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c', // Striking color for errors
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#2c3e50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  ownerSection: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 5,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
  },
  dealSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  tagButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 15,
    padding: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: '#3498db',
    fontSize: 14,
  },
  smallButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginVertical: 5,
  },
  removeButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  // Add additional styles as needed
});