import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AuthContext from '../context/authContext';
import VotingButtons from './VotingButtons';
import AttendButton from './AttendButton';

function ProjectCard({ project, auth }) {
    const [isFavorited, setIsFavorited] = useState(false);
    const navigation = useNavigation();
    const currentUserId = auth.user?.profile?.id;
    const profileLinkPath = currentUserId === project.owner.id ? 'UserAccount' : `Profile/${project.owner.id}`;

    const [attendees, setAttendees] = useState([]);

    const [token, setToken] = useState(null); // State to store the token
  
    const isCurrentUserOwner = auth.user && auth.user.profile.id === project.owner.id;

    // URL Modification Logic
    let imageUrl = project.featured_image;
    let profileImageUrl = project.owner.profile_image;
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `http://127.0.0.1:8000${imageUrl}`;
    }
    if (!profileImageUrl.startsWith('http://') && !profileImageUrl.startsWith('https://')) {
        profileImageUrl = `http://127.0.0.1:8000${profileImageUrl}`;
    }


    useEffect(() => {
        // Fetch and set the token
        const getToken = async () => {
          const storedToken = await AsyncStorage.getItem("token");
          console.log("Token fetched: ", storedToken); // Debugging log
          setToken(storedToken);
        };
    
        getToken();
      }, []);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (auth.isAuthenticated) {
                try {
                    const token = await AsyncStorage.getItem('token');
                    const response = await axios.get(`http://127.0.0.1:8000/api/favorites/is-favorite/${project.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setIsFavorited(response.data.isFavorited);
                } catch (error) {
                    console.error('Error checking favorite status:', error);
                }
            }
        };
        checkFavoriteStatus();
    }, [project.id, auth.isAuthenticated]);

    const handleAddFavorite = async () => {
        if (!auth.isAuthenticated) {
            navigation.navigate('Login');
        } else {
            const token = await AsyncStorage.getItem('token');
            axios.post(`http://127.0.0.1:8000/api/favorites/add/${project.id}/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(() => setIsFavorited(true))
            .catch(error => console.error('Error adding to favorites:', error));
        }
    };

    const handleRemoveFavorite = async () => {
        const token = await AsyncStorage.getItem('token');
        axios.delete(`http://127.0.0.1:8000/api/favorites/remove/${project.id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => setIsFavorited(false))
        .catch(error => console.error('Error removing from favorites:', error));
    };

        // Define a dynamic style for the favorite button
        const favoriteButtonStyle = {
            marginTop: 20,
            padding: 10,
            alignItems: 'center',
            backgroundColor: isFavorited ? '#DC3545' : '#F8D7DA',
            borderRadius: 10,
          };

          useEffect(() => {
            const fetchAttendees = async () => {
                try {
                    const storedToken = await AsyncStorage.getItem('token');
                    console.log("Token for request:", storedToken); // Log the token
        
                    if (!storedToken) {
                        console.error("No token available for authorization");
                        return;
                    }
        
                    const response = await axios.get(`http://127.0.0.1:8000/api/projects/${project.id}/attendees/`, {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });
        
                    console.log("Response:", response); // Log the response
                    setAttendees(response.data);
                } catch (error) {
                    console.error('Error fetching attendees:', error);
                }
            };
        
            fetchAttendees();
        }, [project.id]);
        
        const processImageUrl = (imageUrl) => {
            if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
              return `http://127.0.0.1:8000${imageUrl}`;
            }
            return imageUrl;
          };  

    return (
        <View style={{ margin: 10, padding: 5 }}>
            <TouchableOpacity onPress={() => navigation.navigate('ProjectScreen', { id: project.id })}>
            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 250 }} />
            </TouchableOpacity>
            <View style={{ minHeight: 250 }}>
                <TouchableOpacity onPress={() => navigation.navigate('ProjectScreen', { id: project.id })}>
                    <Text style={{ fontWeight: 'bold' }}>{project.title}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate(isCurrentUserOwner ? 'UserAccount' : 'UserProfileDetail', { id: project.owner.id })}>
                <Image source={{ uri: profileImageUrl }} style={{ width: 30, height: 30, borderRadius: 15 }} />
                    <Text>{project.owner.name}</Text>
                </TouchableOpacity>
                {/* VotingButtons component */}
                <VotingButtons projectId={project.id} />
                <Text style={{ fontSize: 22, marginTop: 20 }}>RM {project.price}</Text>

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

      <View>
  <Text>Attendees ({attendees.length})</Text>
  <FlatList
    data={attendees}
    renderItem={({ item }) => (
<TouchableOpacity onPress={() => navigation.navigate(isCurrentUserOwner ? 'UserAccount' : 'UserProfileDetail', { id: item.attendee.id })}>
<Image 
        source={{ uri: processImageUrl(item.attendee.profile_image) }} // Use processImageUrl here
        style={styles.attendimage}
      />
        <Text style={styles.text}>
        {item.attendee.name} (@{item.attendee.username})
      </Text></TouchableOpacity>

    )}
    keyExtractor={item => item.attendee.id.toString()}
  />
</View>

      {/* Add the AttendButton component */}
      {console.log("Rendering AttendButton with token: ", token)} {/* Debugging log */}

      {token && <AttendButton projectId={project.id} token={token} />}

      <TouchableOpacity onPress={isFavorited ? handleRemoveFavorite : handleAddFavorite} style={favoriteButtonStyle}>
                    <Text style={{ color: isFavorited ? 'red' : 'grey' }}>{isFavorited ? 'Remove Bookmarks' : 'Add Bookmarks'}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.dealButton} onPress={() => {
                    const url = project.deal_link.startsWith('http://') || project.deal_link.startsWith('https://') ? project.deal_link : `http://${project.deal_link}`;
                    Linking.openURL(url);
                }}>
                    <Text>Go to deal</Text>
                </TouchableOpacity>
                {/* Map through tags for Button components */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {project.tags.map(tag => (
                        <TouchableOpacity key={tag.id} onPress={() => navigation.navigate('Categories', { tag_id: tag.id })} style={{ margin: 2, padding: 5, backgroundColor: '#007bff', borderRadius: 5 }}>
                            <Text style={{ color: '#fff' }}>{tag.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>





                {/* <View style={styles.badge}>
  <Text style={styles.badgeText}>{project.brand}</Text>
</View> */}

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
  dealButton: {
    marginTop: 15,
    backgroundColor: '#28a745', // Updated button color
    padding: 12,
    alignItems: 'center',
    borderRadius: 10, // Rounded corners for buttons
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
  attendimage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
});
export default ProjectCard;
