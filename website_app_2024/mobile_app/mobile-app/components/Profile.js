import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomButton from './CustomButton';

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

    // const CustomButton = ({ title, onPress, color }) => (
    //     <TouchableOpacity onPress={onPress} style={[styles.customButton, { backgroundColor: color }]}>
    //         <Text style={styles.customButtonText}>{title}</Text>
    //     </TouchableOpacity>
    // );

    return (
//         <View style={styles.card}>
//             <View style={styles.leftColumn}>
//                 <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetail', { id: profile.id })}>
//                     <Image source={{ uri: processImageUrl(profile) }} style={styles.profileImage} />
//                 </TouchableOpacity>
//             </View>
//             <View style={styles.middleColumn}>
//                 <Text style={styles.cardTitle}>{profile.name}</Text>
//                 <Text style={styles.cardText}>{profile.short_intro?.slice(0, 60) ?? ''}</Text>
//             </View>
//             <View style={styles.rightColumn}>
//                 {!isCurrentUserProfile && !isUserBlocked && (
//                     isFollowing ? (
//                         <CustomButton title="Unfollow" onPress={handleUnfollow} color="#82412d" />
//                     ) : (
//                         <CustomButton title="Follow" onPress={handleFollow} color="#0d204f"/>
//                     )
//                 )}
//             </View>


//             {/* Bio Section */}
//             <View style={styles.bioContainer}>
//                 <Text style={styles.bioText}>
//                     {profile.bio}
//                 </Text>
//             </View>



//         </View>

        
//     );
// }


<View style={styles.card}>
{/* Existing Row for Image, Name, Bio, and Button */}
<View style={styles.row}>
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
    {!isCurrentUserProfile && !isUserBlocked && (
  isFollowing ? (
    <CustomButton title="Unfollow" onPress={handleUnfollow} color="#82412d" fontSize={12} />
  ) : (
    <CustomButton title="Follow" onPress={handleFollow} color="#0d204f" fontSize={12} />
  )
)}

    </View>
</View>

{/* New Row for Profile Bio */}
<View style={styles.bioContainer}>
    <Text style={styles.bioText}>
        {profile.bio}
    </Text>
</View>
</View>
);
}

const styles = StyleSheet.create({
    card: {
        // flexDirection changed to column
        flexDirection: 'column',
        alignItems: 'stretch',
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bioContainer: {
        marginTop: 10, 
        marginBottom: 10, // Add some space above the bio
        // padding: 10, // Padding inside the bio container
    },
    bioText: {
        fontSize: 14, // Adjust font size as needed
        color: '#333', // Adjust text color as needed
    },
    leftColumn: {
        flex: 1,
    },
    middleColumn: {
        flex: 2,
        justifyContent: 'center',
    },
    rightColumn: {
        flex: 1,
        alignItems: 'flex-end',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 12,
    },

    



    textContainer: {
        // existing styles
        width: '35%', // adjust this value as needed for your layout
        flexWrap: 'wrap', // add this line
        marginTop: 10,
    },
    
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 40,
        marginRight: 15,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 12,
    },
    customButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#333361',
    },
    customButtonText: {
        fontSize: 14, // Set the font size as needed
        color: '#fff',
        textAlign: 'center',
    },
    cardBody2: {
        flex: 1,
    },
    cardTitle2: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardText2: {
        fontSize: 14,
    },
    profileInfo: {
        marginRight: 15,
    },
});

export default Profile;
