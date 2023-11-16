import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

function Profile({ profile, currentUserId }) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isUserBlocked, setIsUserBlocked] = useState(false);
    const navigation = useNavigation();
    const route = useRoute();
    const id = route.params?.id; // Assuming id is passed as a route param

    // Authorization headers for axios requests
    const authHeaders = async () => {
        return {
            headers: {
                Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
            },
        };
    };

    // Function to check if user is authenticated
    const isAuthenticated = async () => {
        return await AsyncStorage.getItem("token") != null;
    };

    // Function to redirect to login if not authenticated
    const redirectToLogin = () => {
        navigation.navigate('Login');
    };

    // Check if the current user is following the profile
    useEffect(() => {
        const checkFollowingStatus = async () => {
            if (await isAuthenticated()) {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/api/profiles/${profile.id}/is_following/`, await authHeaders());
                    setIsFollowing(response.data.is_following);
                } catch (error) {
                    console.error("Error fetching following status:", error);
                }
            }
        };
        checkFollowingStatus();
    }, [profile.id]);

    // Check if the user is blocked
    useEffect(() => {
        const checkIfBlocked = async () => {
            if (await isAuthenticated() && profile && profile.id) {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/api/profiles/${profile.id}/is_blocked/`, await authHeaders());
                    setIsUserBlocked(response.data.is_blocked);
                } catch (error) {
                    console.error("Error checking if user is blocked:", error);
                }
            }
        };
        checkIfBlocked();
    }, [profile]);

    // Event handlers for follow and unfollow actions
    const handleFollow = async () => {
        if (!(await isAuthenticated())) {
            redirectToLogin();
            return;
        }
        try {
            await axios.post(`http://127.0.0.1:8000/api/profiles/${profile.id}/follow/`, {}, await authHeaders());
            setIsFollowing(true);
        } catch (error) {
            console.error("Error following the user:", error);
        }
    };

    const handleUnfollow = async () => {
        if (!(await isAuthenticated())) {
            redirectToLogin();
            return;
        }
        try {
            await axios.post(`http://127.0.0.1:8000/api/profiles/${profile.id}/unfollow/`, {}, await authHeaders());
            setIsFollowing(false);
        } catch (error) {
            console.error("Error unfollowing the user:", error);
        }
    };

    const processImageUrl = (profile) => {
        let profileImageUrl = profile.profile_image;
        if (!profileImageUrl.startsWith('http://') && !profileImageUrl.startsWith('https://')) {
            profileImageUrl = `http://127.0.0.1:8000${profileImageUrl}`;
        }
        return profileImageUrl;
    };

        // Function to navigate to UserProfileDetail
        const navigateToProfileDetail = () => {
            navigation.navigate('UserProfileDetail', { id: profile.id });
        };

    // Add a check to determine if the profile belongs to the current user
    const isCurrentUserProfile = profile.id === currentUserId;

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={navigateToProfileDetail} style={styles.cardBody}>
                <View style={styles.profileAndButtonContainer}>
                    <Image
                        source={{ uri: processImageUrl(profile) }}
                        style={styles.profileImage}
                    />
    
                    {/* Conditionally render follow/unfollow button */}
                    {!isCurrentUserProfile && !isUserBlocked && (
                        isFollowing ? (
                            <View style={styles.followButton}>
                                <Button title="Unfollow" onPress={handleUnfollow} />
                            </View>
                        ) : (
                            <View style={styles.followButton}>
                                <Button title="Follow" onPress={handleFollow} />
                            </View>
                        )
                    )}
                </View>
    
                <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>
                        {profile.name}
                    </Text>
                    <Text style={styles.cardText}>
                        {profile.short_intro?.slice(0, 60) ?? ''}
                    </Text>
                    <Text style={styles.cardBio}>
                        {profile.bio?.split(" ").slice(0, 30).join(" ") ?? ''}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        marginBottom: 20,
        flexDirection: 'row',
    },
    profileAndButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center', // to align the image and button vertically
    },
    cardBio: {
        // existing styles
        flexWrap: 'wrap', // add this line
    },
    textContainer: {
        // existing styles
        width: '35%', // adjust this value as needed for your layout
        flexWrap: 'wrap', // add this line
    },
    
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#333',
    },
    cardText: {
        color: '#666',
        fontSize: 14,
    },
    followButton: {
        width: 100,   // Set a fixed width
        height: 40,   // Set a fixed height (optional)
        // other styling attributes as needed
    },
});

export default Profile;
