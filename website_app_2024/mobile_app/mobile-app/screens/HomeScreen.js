import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet } from 'react-native';
import Project from '../components/Project';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

function HomeScreen() {
    const [projects, setProjects] = useState([]);
    const [query, setQuery] = useState('');

    const fetchProjects = async (query = '', sortBy = '', sortOrder = 'desc') => {
        try {
            const { data } = await axios.get(`http://127.0.1:8000/api/projects/?search_query=${query}`); // Replace with your Django API endpoint
            setProjects(data);
            console.log("response_data", data)
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSubmit = (query) => {
        fetchProjects(query);
    };

    // Render project list
    const renderProject = ({ item }) => <Project project={item} />;

    return (
        <View style={styles.container}>
            {/* <Text style={styles.header}>Deals</Text> */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for events"
                    value={query}
                    onChangeText={setQuery}
                />
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => handleSubmit(query)}
                >
                    <Icon name="search" size={20} color="#888" /> {/* Search icon replaces text */}
                </TouchableOpacity>
            </View>

            <FlatList
                data={projects}
                renderItem={renderProject}
                keyExtractor={project => project.id.toString()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20, // Increased padding for better spacing
        backgroundColor: '#FFFFFF', // New background color
    },
    header: {
        fontSize: 28, // Increased font size
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 25, // Increased margin
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
    searchButton: {
        paddingVertical: 12, // Increased padding
        paddingHorizontal: 15,
        backgroundColor: 'transparent', // Transparent background
        borderRadius: 8, // Rounded corners
        borderWidth: 1, // Add border width
        borderColor: '#4e4646',
    },
    
});

export default HomeScreen;
