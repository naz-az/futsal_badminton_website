import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Button, Image, Alert, Picker, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthContext from '../context/authContext';

import VotingButtons from '../components/VotingButtons'; // Ensure this is adapted for React Native
import AttendButton from '../components/AttendButton'; // Ensure this is adapted for React Native
import { useNavigation } from '@react-navigation/native';
import ProjectComponent from '../components/ProjectComponent';


function FavouritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const auth = useContext(AuthContext);
  const currentUserId = auth.user?.profile.id;

  const [showFullText, setShowFullText] = useState(false);
  const [token, setToken] = useState(null); // State to store the token

  // Additional state for sorting
  const [sortField, setSortField] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');


  // Function to handle sort change
  const handleSortChange = (field, order) => {
    setSortField(field);
    setSortOrder(order);
    fetchFavorites(field, order);
  };
  
  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };

  const fetchFavorites = async (sortOption, order = 'desc') => {
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
  };

  useEffect(() => {
    fetchFavorites('created');
  }, []);

  const handleRemove = async (projectId) => {
    console.log("handleRemove called with projectId:", projectId);
  
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        return;
      }
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/favorites/remove/${projectId}/`,
        config
      );
      console.log("Response from axios delete:", response);
  
      if (response.status === 200) {
        setFavorites((prevFavorites) => 
          prevFavorites.filter((fav) => fav.project.id !== projectId)
        );
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Error removing project from favorites:", error);
    }
  };
  
  
  
  

  if (loading) {
    return <View><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View><Text>Error: {error}</Text></View>;
  }

  if (!favorites || favorites.length === 0) {
    return <View><Text>You have no bookmarks.</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookmarks</Text>
        <Text style={styles.headerSubtitle}>You have {favorites.length} bookmark item{favorites.length !== 1 ? "s" : ""}</Text>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {/* Picker for Sorting */}
        <Picker
          selectedValue={sortField}
          style={styles.picker}
          onValueChange={(itemValue) => handleSortChange(itemValue, sortOrder)}
        >
          <Picker.Item label="Date" value="created" />
          <Picker.Item label="Top" value="upvotes" />
          <Picker.Item label="Price" value="price" />
        </Picker>

        <Picker
          selectedValue={sortOrder}
          style={styles.picker}
          onValueChange={(itemValue) => handleSortChange(sortField, itemValue)}
        >
          <Picker.Item label="Ascending" value="asc" />
          <Picker.Item label="Descending" value="desc" />
        </Picker>
      </View>

            {/* Favorites List */}
            {favorites.map((favorite) => (
        <ProjectComponent 
          key={favorite.project.id} 
          project={favorite.project} 
          onRemove={handleRemove} 
          // pass other necessary props if needed
        />
      ))}



          </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',

  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'grey',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  picker: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 5,
  },
  imageContainer: {
    flex: 1,
  },
  projectImage: {
    width: 100,
    height: 150,
    resizeMode: 'cover',
  },
  detailsContainer: {
    flex: 2,
    paddingLeft: 15,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ownerImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  ownerName: {
    color: 'brown',
  },
  projectPrice: {
    fontSize: 22,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
  },
  dateLabel: {
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    fontSize: 16,
  },
  showMoreText: {
    color: '#007bff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 10,
  },
  tagButton: {
    backgroundColor: '#dc3545',
    padding: 5,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 12,
  },
  brandContainer: {
    backgroundColor: '#343a40',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginVertical: 10,
  },
  brandText: {
    color: '#ffffff',
    fontSize: 14,
  },

});

export default FavouritesScreen;
