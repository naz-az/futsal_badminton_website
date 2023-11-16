import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

function FollowingPage() {
    const [followingProfiles, setFollowingProfiles] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        fetchFollowingProfiles();
    }, []);

    const fetchFollowingProfiles = async () => {
        const token = await AsyncStorage.getItem('token');
        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };
        const response = await axios.get('http://127.0.0.1:8000/api/profiles/following/', config);
        setFollowingProfiles(response.data);
    };

    const handleUnfollowClick = (profile) => {
        setSelectedProfile(profile);
        setShowConfirmation(true);
    };

    const confirmUnfollow = async () => {
        if (selectedProfile) {
            const token = await AsyncStorage.getItem('token');
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            await axios.post(`http://127.0.0.1:8000/api/profiles/${selectedProfile.id}/unfollow/`, null, config);
            fetchFollowingProfiles(); // Refetch the following list
            setShowConfirmation(false);
        }
    };

    const handleSendMessage = (profileId) => {
        navigation.navigate('SendMessageScreen', { recipient: profileId });
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
            <Text>You're following {followingProfiles.length} people</Text>
            {followingProfiles.map(profile => (
                <View key={profile.id} style={styles.profileContainer}>
                    
                    <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen', { profileId: profile.id })}>
                    <Image source={{ uri: processImageUrl(profile) }} style={styles.profileImage} />
                    </TouchableOpacity>
                    <View style={styles.profileInfo}>
                        <Text>{profile.name}</Text>
                        <Text>{profile.short_intro.slice(0, 60)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleSendMessage(profile.id)} style={styles.button}>
                        <Text>Send Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleUnfollowClick(profile)} style={styles.button}>
                        <Text>Unfollow</Text>
                    </TouchableOpacity>
                </View>
            ))}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showConfirmation}
                    onRequestClose={() => setShowConfirmation(false)}
                >
                    <View style={styles.modalView}>
                        <Text>Are you sure you want to unfollow {selectedProfile?.name}?</Text>
                        <TouchableOpacity onPress={() => setShowConfirmation(false)} style={styles.button}>
                            <Text>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={confirmUnfollow} style={styles.button}>
                            <Text>Yes, Unfollow</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
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

export default FollowingPage;
