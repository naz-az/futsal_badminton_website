import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet } from 'react-native';
import Project from '../components/Project';
import axios from 'axios';

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
                    placeholder="Search for deals"
                    value={query}
                    onChangeText={setQuery}
                />
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => handleSubmit(query)}
                >
                    <Text>Search</Text>
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
        backgroundColor: '#F0F0F0', // New background color
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
        borderColor: '#ddd',
        padding: 12, // Increased padding
        marginRight: 10,
        borderRadius: 25, // Rounded corners
        backgroundColor: 'white', // White background for input
    },
    searchButton: {
        paddingVertical: 12, // Increased padding
        paddingHorizontal: 15,
        backgroundColor: '#007bff', // Updated button color
        borderRadius: 25, // Rounded corners
    },
});

export default HomeScreen;
