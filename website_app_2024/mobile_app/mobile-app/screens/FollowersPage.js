import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

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
            <Text style={styles.headerText}>You have {followersCount} followers</Text>
            {followers.map(profile => (
                <View key={profile.id} style={styles.profileContainer}>
                    <TouchableOpacity onPress={() => {/* Navigate to profile detail */}}>
                    <Image source={{ uri: processImageUrl(profile) }} style={styles.profileImage} />
                    </TouchableOpacity>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{profile.name}</Text>
                        <Text style={styles.profileIntro}>{profile.short_intro?.slice(0, 60) ?? ''}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleSendMessage(profile.id)} style={styles.messageButton}>
                        <Text style={styles.buttonText}>Send Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveClick(profile.id)} style={styles.removeButton}>
                        <Text style={styles.buttonText}>Remove Follower</Text>
                    </TouchableOpacity>
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
        padding: 20,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 80,
        height: 100,
        marginRight: 10,
    },
    profileInfo: {
        flex: 1,
    },
    button: {
        marginHorizontal: 10,
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
});

export default FollowersPage;