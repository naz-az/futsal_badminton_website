import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, Alert, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/authContext'; // Import AuthContext
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';

const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
};

const BlockedUsersPage = () => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [showProfiles, setShowProfiles] = useState(false);

    const auth = useContext(AuthContext);
    const currentUserId = auth.user ? auth.user.profile.id : null;
    const navigation = useNavigation();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);


    const getAuthHeaders = async () => {
        const token = await AsyncStorage.getItem('token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    };

    useEffect(() => {
        fetchBlockedUsers();
        fetchProfiles();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            const authHeaders = await getAuthHeaders();
            const res = await axios.get('http://127.0.0.1:8000/api/blocked-users/', authHeaders);
            setBlockedUsers(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchProfiles = async () => {
        try {
            const authHeaders = await getAuthHeaders();
            const res = await axios.get('http://127.0.0.1:8000/api/profiles/', authHeaders);
            const filteredProfiles = res.data.filter(profile => profile.id !== currentUserId);
            setProfiles(filteredProfiles);
        } catch (err) {
            console.log(err);
        }
    };

    const isUserBlocked = userId => {
        return blockedUsers.some(user => user.id === userId);
    };

    const toggleUserBlockStatus = userId => {
        console.log(`toggleUserBlockStatus called for user: ${userId}`);
        setSelectedUserId(userId);
        setModalVisible(true);
    };
    
    

    const handleBlock = async userId => {
        try {
            const authHeaders = await getAuthHeaders();
            await axios.post(`http://127.0.0.1:8000/api/block-user/${userId}/`, {}, authHeaders);
            fetchBlockedUsers();
        } catch (err) {
            console.log(err);
        }
    };
    
    const handleUnblock = async userId => {
        try {
            const authHeaders = await getAuthHeaders();
            await axios.post(`http://127.0.0.1:8000/api/unblock-user/${userId}/`, {}, authHeaders);
            fetchBlockedUsers();
        } catch (err) {
            console.log(err);
        }
    };
    
    

    const ConfirmationModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Are you sure you want to {isUserBlocked(selectedUserId) ? 'unblock' : 'block'} this user?</Text>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.textStyle}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonConfirm]}
                            onPress={() => {
                                setModalVisible(!modalVisible);
                                isUserBlocked(selectedUserId) ? handleUnblock(selectedUserId) : handleBlock(selectedUserId);
                            }}
                        >
                            <Text style={styles.textStyle}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const [searchTerm, setSearchTerm] = useState('');

    // handleSearchChange adjusted for React Native
    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    // Adjusted filteredProfiles for React Native
    const filteredProfiles = profiles.filter(profile => 
        profile.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [isFocused, setIsFocused] = useState(false); // State to handle focus

    // Function to handle focus state change
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    return (
        <ScrollView style={{ flex: 1 }}>
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>Blocked Users</Text>
                <FlatList
    data={blockedUsers}
    keyExtractor={item => item.id.toString()}
    renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetail', { id: item.id })}
                style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image 
                    source={{ uri: processImageUrl(item.profile_image) }}
                    style={{ width: 30, height: 30, borderRadius: 15 }}
                />
                <Text style={{ marginLeft: 10, flex: 1 }}>{item.username}</Text>
            </TouchableOpacity>
            <CustomButton 
                title="Unblock"
                color="#d95c34"
                onPress={() => handleUnblock(item.id)}
                fontSize={12}
            />
        </View>
    )}
/>


                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                    <CustomButton 
                        title={showProfiles ? 'Hide Users' : 'Block new user'}
                        onPress={() => setShowProfiles(!showProfiles)}
                        fontSize={12}
                        color="#3b3b3b"

                    />
                </View>

                {/* {showProfiles && (
    <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Select a User to Block or Unblock</Text> */}

        {showProfiles && (
                    <View style={{ marginVertical: 20 }}>
                                <Text style={{ fontSize: 18, marginBottom: 10 }}>Select a User to Block or Unblock</Text>

                <TextInput 
                    style={[styles.textInputStyle, isFocused && styles.textInputFocused]}
                    placeholder="Search users..."
                    placeholderTextColor={styles.textInputPlaceholder.color} // Apply placeholder style
                    value={searchTerm}
                    onChangeText={handleSearchChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />

        <FlatList
            data={filteredProfiles}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetail', { id: item.id })}
                        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Image 
                            source={{ uri: processImageUrl(item.profile_image) }}
                            style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10 }}
                        />
                        <Text style={{ flex: 1 }}>{item.username}</Text>
                    </TouchableOpacity>
                    <CustomButton 
    title={isUserBlocked(item.id) ? 'Unblock' : 'Block'}
    color={isUserBlocked(item.id) ? '#d95c34' : 'orange'}
    fontSize={12}
    onPress={() => {
        console.log(`Button pressed for user: ${item.id}`);
        toggleUserBlockStatus(item.id);
    }}
/>

                </View>
            )}
        />
    </View>
)}

            </View>
            <ConfirmationModal />
        </ScrollView>
    );
};
const styles = StyleSheet.create({
    // ... your existing styles ...
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%'
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    buttonConfirm: {
        backgroundColor: "#F194FF",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
        // Enhanced TextInput style
        textInputStyle: {
            borderWidth: 1,
            borderColor: '#bdbdbd', // Light blue border color
            borderRadius: 10, // Rounded corners
            padding: 10,
            marginBottom: 10,
            fontSize: 16,
            color: '#333', // Dark text color for better readability
            backgroundColor: '#FFF', // White background
            shadowColor: '#000', // Shadow for a subtle 3D effect
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1,
            elevation: 2,
        },
    
        // Placeholder style (optional, use if needed)
        textInputPlaceholder: {
            color: '#AAA', // Light grey color for the placeholder
        },
    
        // Interactive element: Change border color on focus
        textInputFocused: {
            borderColor: '#FF4500', // Change to a different color when focused (e.g., bright orange)
        },
});

export default BlockedUsersPage;
