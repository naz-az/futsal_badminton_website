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

    if (isFetching) {
        return <View style={styles.container}><Text>Loading...</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Following</Text>
            <Text style={styles.subtitle}>This user is following {following.length} {following.length === 1 ? 'user' : 'users'}</Text>
            {following.map(profile => (
                <View key={profile.id} style={styles.card}>
                    <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { profileId: profile.id })}>
                        <Image source={{ uri: processImageUrl(profile.profile_image) }} style={styles.profileImage} />
                    </TouchableOpacity>
                    <View style={styles.cardBody}>
                        <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { profileId: profile.id })}>
                            <Text style={styles.cardTitle}>{profile.name}</Text>
                        </TouchableOpacity>
                        <Text style={styles.cardText}>{profile.short_intro?.slice(0, 60) ?? ''}</Text>
                    </View>
                    {user.profile.id !== profile.id && (
                        <Button 
                            title={profile.is_following ? 'Unfollow' : 'Follow'}
                            onPress={() => handleFollowUnfollow(profile, profile.is_following)}
                            color={profile.is_following ? "#6c757d" : "#007bff"}
                        />
                    )}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
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
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 14,
    }
});

export default OtherUserFollowingPage;
