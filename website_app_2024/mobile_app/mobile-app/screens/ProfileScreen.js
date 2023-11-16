import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
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
    console.log("userz id", currentUserId);

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

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Profiles</Text>
            
            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
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
                <Button title="Search" onPress={handleSubmit} />
            </View>
            
            <FlatList
                data={profiles}
                keyExtractor={profile => profile.id.toString()}
                renderItem={({ item }) => (
                    <Profile 
                        profile={item}
                        currentUserId={currentUserId}
                        isCurrentUser={item.id === currentUserId}
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
        backgroundColor: '#F5F5F5', // Example background color
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
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 25,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        marginRight: 10,
        fontSize: 16,
        color: '#333',
    },
    searchIcon: {
        marginRight: 10,
    },
});

export default ProfileScreen;
