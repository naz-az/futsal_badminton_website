import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, Image, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/authContext';

function OtherUserFollowingPage({ route, navigation }) {
    const { profileId } = route.params;
    const [following, setFollowing] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const { user } = useContext(AuthContext);
    const isAuthenticated = user && user.profile && user.profile.id;

        // Process image URL function
        const processImageUrl = (imageUrl) => {
            if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
              return `http://127.0.0.1:8000${imageUrl}`;
            }
            return imageUrl;
          };

    const fetchFollowing = async () => {
        setIsFetching(true);
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/profiles/${profileId}/following/`);
            console.log('Following data:', response.data); // Add this line to log the response data

            const followingData = response.data;

            if (isAuthenticated) {
                const token = await AsyncStorage.getItem('token');
                const config = {
                    headers: { 'Authorization': `Bearer ${token}` }
                };
                const updatedFollowingData = await Promise.all(
                    followingData.map(async (profile) => {
                        const isFollowingResponse = await axios.get(`http://127.0.0.1:8000/api/profiles/${profile.id}/is_following/`, config);
                        return { ...profile, is_following: isFollowingResponse.data.is_following };
                    })
                );
                setFollowing(updatedFollowingData);
            } else {
                setFollowing(followingData);
            }
        } catch (error) {
            console.error('Error fetching following', error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchFollowing();
    }, [profileId, isAuthenticated]);

    const handleFollowUnfollow = async (profile, isFollowing) => {
        if (!isAuthenticated) {
            navigation.navigate('Login');
            return;
        }
        if (isFollowing) {
            const confirmUnfollow = await new Promise((resolve) => {
                Alert.alert(
                    "Unfollow User",
                    "Are you sure you want to unfollow this user?",
                    [
                        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                        { text: "OK", onPress: () => resolve(true) }
                    ]
                );
            });
            if (!confirmUnfollow) {
                return;
            }
        }
        const token = await AsyncStorage.getItem('token');
        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };
        const endpoint = isFollowing ? `http://127.0.0.1:8000/api/profiles/${profile.id}/unfollow/` : `http://127.0.0.1:8000/api/profiles/${profile.id}/follow/`;
        try {
            await axios.post(endpoint, {}, config);
            await fetchFollowing();
        } catch (error) {
            console.error('Error toggling follow state', error);
        }
    };

    
    const isCurrentUserOwner = (profileId) => {
        return user && user.profile && user.profile.id === profileId;
    };

    if (isFetching) {
        return <View style={styles.container}><Text>Loading...</Text></View>;
    }



    return (
        <ScrollView style={styles.container}>
            <Text style={styles.subtitle}>{user.profile.username} is following {following.length} {following.length === 1 ? 'user' : 'users'}</Text>
            {following.map(profile => (
                <View key={profile.id} style={styles.card}>
                    <View style={styles.leftColumn}>
                        <TouchableOpacity onPress={() => navigation.navigate(isCurrentUserOwner(profile.id) ? 'UserAccount' : 'UserProfileDetail', { id: profile.id })}>
                            <Image source={{ uri: processImageUrl(profile.profile_image) }} style={styles.profileImage} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.middleColumn}>
                        <Text style={styles.cardTitle}>{profile.name}</Text>
                        <Text style={styles.cardText}>{profile.short_intro?.slice(0, 60) ?? ''}</Text>
                    </View>
                    <View style={styles.rightColumn}>
                        {user.profile.id !== profile.id && (
                            <TouchableOpacity 
                                onPress={() => handleFollowUnfollow(profile, profile.is_following)}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>{profile.is_following ? 'Unfollow' : 'Follow'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
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
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 20,
        fontWeight: 'bold',

    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#fcfcff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    leftColumn: {
        flex: 1,
        // Add any additional styling if needed
    },
    middleColumn: {
        flex: 2,
        // Add any additional styling if needed
    },
    rightColumn: {
        flex: 1,
        // Add any additional styling if needed
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    cardBody: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 12,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#333361', // Choose a color that fits your app theme
    },
    buttonText: {
        fontSize: 12,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    buttonPressed: {
        opacity: 0.8, // Slight opacity change on press
        transform: [{ scale: 0.96 }], // Slight scale down effect
    },
});

export default OtherUserFollowingPage;
