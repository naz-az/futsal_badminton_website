import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, FlatList, Image, Alert, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/authContext'; // Import AuthContext
import { useNavigation } from '@react-navigation/native';


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
            <Button 
                title="Unblock"
                color="red"
                onPress={() => handleUnblock(item.id)}
            />
        </View>
    )}
/>


                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                    <Button 
                        title={showProfiles ? 'Hide Users' : 'Block new user'}
                        onPress={() => setShowProfiles(!showProfiles)}
                    />
                </View>

                {showProfiles && (
    <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Select a User to Block or Unblock</Text>
        <FlatList
            data={profiles}
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
                    <Button 
                        title={isUserBlocked(item.id) ? 'Unblock' : 'Block'}
                        color={isUserBlocked(item.id) ? 'green' : 'orange'}
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
    }
});

export default BlockedUsersPage;
