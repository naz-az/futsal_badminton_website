import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, FlatList, Image, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/authContext'; // Import AuthContext

const BlockedUsersPage = () => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [showProfiles, setShowProfiles] = useState(false);

    const auth = useContext(AuthContext);
    const currentUserId = auth.user ? auth.user.profile.id : null;

    useEffect(() => {
        fetchBlockedUsers();
        fetchProfiles();
    }, []);

    const fetchAuthHeaders = async () => {
        const token = await AsyncStorage.getItem('token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    };

    const fetchBlockedUsers = async () => {
        const authHeaders = await fetchAuthHeaders();
        axios.get('http://127.0.0.1:8000/api/blocked-users/', authHeaders)
            .then(res => setBlockedUsers(res.data))
            .catch(err => console.log(err));
    };

    const fetchProfiles = async () => {
        const authHeaders = await fetchAuthHeaders();
        axios.get('http://127.0.0.1:8000/api/profiles/', authHeaders)
            .then(res => {
                const filteredProfiles = res.data.filter(profile => profile.id !== currentUserId);
                setProfiles(filteredProfiles);
            })
            .catch(err => console.log(err));
    };

    const isUserBlocked = userId => {
        return blockedUsers.some(user => user.id === userId);
    };

    const toggleUserBlockStatus = userId => {
        const action = isUserBlocked(userId) ? handleUnblock : handleBlock;
        action(userId);
    };

    const handleBlock = userId => {
        Alert.alert(
            "Block User",
            "Are you sure you want to block this user?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => blockUser(userId) }
            ]
        );
    };

    const blockUser = async userId => {
        const authHeaders = await fetchAuthHeaders();
        axios.post(`http://127.0.0.1:8000/api/block-user/${userId}/`, {}, authHeaders)
            .then(() => {
                fetchBlockedUsers();
            })
            .catch(err => console.log(err));
    };

    const handleUnblock = userId => {
        Alert.alert(
            "Unblock User",
            "Are you sure you want to unblock this user?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => unblockUser(userId) }
            ]
        );
    };

    const unblockUser = async userId => {
        const authHeaders = await fetchAuthHeaders();
        axios.post(`http://127.0.0.1:8000/api/unblock-user/${userId}/`, {}, authHeaders)
            .then(() => {
                fetchBlockedUsers();
            })
            .catch(err => console.log(err));
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, textAlign: 'center', marginVertical: 10 }}>Blocked Users</Text>
            <FlatList
                data={blockedUsers}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                        <Image 
                            source={{ uri: item.profile_image }} 
                            style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10 }}
                        />
                        <Text style={{ flex: 1 }}>{item.username}</Text>
                        <Button title="Unblock" onPress={() => handleUnblock(item.id)} />
                    </View>
                )}
            />

            <View style={{ marginVertical: 20, alignItems: 'center' }}>
                <Button 
                    title={showProfiles ? 'Hide Users' : 'Block new user'} 
                    onPress={() => setShowProfiles(!showProfiles)}
                />
            </View>

            {showProfiles && (
                <View>
                    <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 10 }}>Select a User to Block or Unblock</Text>
                    <FlatList
                        data={profiles}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                <Image 
                                    source={{ uri: item.profile_image }} 
                                    style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10 }}
                                />
                                <Text style={{ flex: 1 }}>{item.username}</Text>
                                <Button 
                                    title={isUserBlocked(item.id) ? 'Unblock' : 'Block'} 
                                    onPress={() => toggleUserBlockStatus(item.id)} 
                                />
                            </View>
                        )}
                    />
                </View>
            )}
        </View>
    );
};

export default BlockedUsersPage;
