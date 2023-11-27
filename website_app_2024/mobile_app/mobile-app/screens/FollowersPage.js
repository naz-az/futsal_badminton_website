import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

function FollowersPage() {
    const [followers, setFollowers] = useState([]);
    const [followersCount, setFollowersCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [profileToRemove, setProfileToRemove] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchFollowers = async () => {
            const token = await AsyncStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get('http://127.0.0.1:8000/api/profiles/followers/', config);
            setFollowers(response.data);
            setFollowersCount(response.data.length);
        };

        fetchFollowers();
    }, []);

    const removeFollower = async (profileId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.post(`http://127.0.0.1:8000/api/profiles/${profileId}/remove_follower/`, {}, config);
            setFollowers(followers.filter(profile => profile.id !== profileId));
            setFollowersCount(followersCount - 1);
        } catch (error) {
            console.error("Error removing follower", error);
            // Handle error (show error message to user, etc.)
        }
    };

    const handleRemoveClick = (profileId) => {
        setProfileToRemove(profileId);
        setShowModal(true);
    };

    const confirmRemoveFollower = async () => {
        if (profileToRemove) {
            await removeFollower(profileToRemove);
            setShowModal(false);
            setProfileToRemove(null);
        }
    };

    // The following function should be adapted to the navigation logic of React Native
    const handleSendMessage = (profileId) => {
        // Use your navigation logic here
    };

    const processImageUrl = (profile) => {
        let profileImageUrl = profile.profile_image;
        if (!profileImageUrl.startsWith('http://') && !profileImageUrl.startsWith('https://')) {
            profileImageUrl = `http://127.0.0.1:8000${profileImageUrl}`;
        }
        return profileImageUrl;
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.subtitle}>You have {followersCount} followers</Text>
            {followers.map(profile => (
                <View key={profile.id} style={styles.card}>
                    <View style={styles.leftColumn}>
                        <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetail', { id: profile.id })}>
                            <Image source={{ uri: processImageUrl(profile) }} style={styles.profileImage} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.middleColumn}>
                        <Text style={styles.cardTitle}>{profile.name}</Text>
                        <Text style={styles.cardText}>{profile.short_intro?.slice(0, 60) ?? ''}</Text>
                    </View>
                    <View style={styles.rightColumn}>
                        <TouchableOpacity onPress={() => handleRemoveClick(profile.id)} style={styles.button}>
                            <Text style={styles.buttonText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            {/* Modal component needs to be implemented using a third-party library or custom implementation */}
            {showModal && (
                <Alert
                    title="Confirm Removal"
                    message="Are you sure you want to remove this follower?"
                    buttons={[
                        { text: 'Cancel', onPress: () => setShowModal(false) },
                        { text: 'Confirm', onPress: confirmRemoveFollower }
                    ]}
                />
            )}
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
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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
});

export default FollowersPage;