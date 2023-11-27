import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Profile from '../components/Profile'; // Ensure this is a React Native component
import AuthContext from '../context/authContext';
import Icon from 'react-native-vector-icons/FontAwesome';

function ProfileScreen() {
    const [profiles, setProfiles] = useState([]);
    const [query, setQuery] = useState('');

    const auth = useContext(AuthContext);
    const currentUserId = auth.user?.profile.id;

    const fetchProfiles = async (query = '') => {
        const { data } = await axios.get(`http://127.0.0.1:8000/api/profiles/?search_query=${query}`);
        setProfiles(data);
    };

    useEffect(() => {
        fetchProfiles(); 
    }, []);

    const handleSubmit = async () => {
        await fetchProfiles(query);
    };

        // Define clearSearch function
        const clearSearch = () => {
            setQuery('');
        };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Profiles</Text>
            
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for profiles"
                    value={query}
                    onChangeText={setQuery}
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={clearSearch}>
                        <Icon name="times-circle" size={20} color="#888" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.searchButton} onPress={handleSubmit}>
                    <Icon name="search" size={20} color="#888" /> {/* Search icon replaces text */}
                </TouchableOpacity>
            </View>
            
            <FlatList
                data={profiles.filter(profile => profile.id !== currentUserId)}
                keyExtractor={profile => profile.id.toString()}
                renderItem={({ item }) => (
                    <Profile 
                        profile={item}
                        currentUserId={currentUserId}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff', // Example background color
    },
    header: {
        fontSize: 26,
        fontWeight: '700',
        textAlign: 'center',
        marginVertical: 20,
        color: '#333', // Example text color
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#4e4646',
        padding: 12, // Increased padding
        marginRight: 10,
        borderRadius: 8, // Rounded corners
        backgroundColor: 'transparent', // Transparent background

    },
    searchIcon: {
        marginRight: 10,
    },
    searchButton: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: 'transparent',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4e4646',
    },
});

export default ProfileScreen;
