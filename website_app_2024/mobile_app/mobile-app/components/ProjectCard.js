import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AuthContext from '../context/authContext';
import VotingButtons from './VotingButtons';

function ProjectCard({ project, auth }) {
    const [isFavorited, setIsFavorited] = useState(false);
    const navigation = useNavigation();
    const currentUserId = auth.user?.profile?.id;
    const profileLinkPath = currentUserId === project.owner.id ? 'UserAccount' : `Profile/${project.owner.id}`;


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

    return (
        <View style={{ margin: 10, padding: 5 }}>
            <TouchableOpacity onPress={() => navigation.navigate('ProjectScreen', { id: project.id })}>
            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 250 }} />
            </TouchableOpacity>
            <View style={{ minHeight: 250 }}>
                <TouchableOpacity onPress={() => navigation.navigate('ProjectScreen', { id: project.id })}>
                    <Text style={{ fontWeight: 'bold' }}>{project.title}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetail', { id: project.owner.id })}>
                <Image source={{ uri: profileImageUrl }} style={{ width: 30, height: 30, borderRadius: 15 }} />
                    <Text>{project.owner.name}</Text>
                </TouchableOpacity>
                {/* VotingButtons component */}
                <VotingButtons projectId={project.id} />
                <Text style={{ fontSize: 22, marginTop: 20 }}>RM {project.price}</Text>
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
                <View style={styles.badge}>
  <Text style={styles.badgeText}>{project.brand}</Text>
</View>
                <TouchableOpacity onPress={isFavorited ? handleRemoveFavorite : handleAddFavorite} style={favoriteButtonStyle}>
                    <Text style={{ color: isFavorited ? 'red' : 'grey' }}>{isFavorited ? 'Remove Favourites' : 'Add Favourites'}</Text>
                </TouchableOpacity>
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
});
export default ProjectCard;
