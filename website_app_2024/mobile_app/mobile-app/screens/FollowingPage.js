import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import ConfirmationModal from '../components/ConfirmationModal';


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

    const handleUnfollowConfirm = async () => {
        if (selectedProfile) {
            const token = await AsyncStorage.getItem('token');
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            await axios.post(`http://127.0.0.1:8000/api/profiles/${selectedProfile.id}/unfollow/`, null, config);
            fetchFollowingProfiles();
            setSelectedProfile(null);
            setShowConfirmation(false);
        }
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
            <Text style={styles.subtitle}>You're following {followingProfiles.length} people</Text>
            {followingProfiles.map(profile => (
                <View key={profile.id} style={styles.card}>
                    <View style={styles.leftColumn}>
                        <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetail', { id: profile.id })}>
                            <Image source={{ uri: processImageUrl(profile) }} style={styles.profileImage} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.middleColumn}>
                        <Text style={styles.cardTitle}>{profile.name}</Text>
                        <Text style={styles.cardText}>{profile.short_intro.slice(0, 60)}</Text>
                    </View>
                    <View style={styles.rightColumn}>
                        <CustomButton
                            title="Unfollow"
                            onPress={() => handleUnfollowClick(profile)}
                            color="#333361"
                            textColor="white"
                            fontSize={12}
                        />
                    </View>
                </View>
            ))}

            <ConfirmationModal
                modalVisible={showConfirmation}
                setModalVisible={setShowConfirmation}
                onConfirm={handleUnfollowConfirm}
                actionType="unfollow this user"
            />

                    {/* <TouchableOpacity 
    onPress={() => navigation.navigate('Send', { recipient: profile.id })}
    style={styles.button}
    activeOpacity={0.7} // Adjust as needed for touch feedback
>
    <Text style={styles.buttonText}>Send Message</Text>
</TouchableOpacity> */}


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

export default FollowingPage;
