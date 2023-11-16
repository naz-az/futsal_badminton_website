import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, View, Text, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

function FavoriteButton({ projectId, token }) {
    const [isFavorited, setIsFavorited] = useState(false);
    const navigation = useNavigation(); // Initialize navigation

    // Function to check if user is authenticated
    const isAuthenticated = async () => {
        const storedToken = await AsyncStorage.getItem('token');
        return storedToken != null;
    };

    // Function to redirect to login if not authenticated
    const redirectToLogin = () => {
        navigation.navigate('Login');
    };

    useEffect(() => {
        if (token) {
            axios.get(`http://127.0.0.1:8000/api/favorites/is-favorite/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => setIsFavorited(response.data.isFavorited))
            .catch(error => console.error("Error checking favorite status:", error));
        }
    }, [projectId, token]);

    const handleFavorite = async () => {
        if (!await isAuthenticated()) {
            redirectToLogin();
            return;
        }

        const url = `http://127.0.0.1:8000/api/favorites/${isFavorited ? 'remove' : 'add'}/${projectId}/`;
        const method = isFavorited ? 'delete' : 'post';

        axios({ method, url, headers: { Authorization: `Bearer ${token}` } })
        .then(() => setIsFavorited(!isFavorited))
        .catch(error => console.error(`Error ${isFavorited ? 'removing from' : 'adding to'} favorites:`, error));
    };

    return (
        <View style={styles.container}>
            <Button
                title={isFavorited ? "Remove Favourite" : "Add Favourite"}
                onPress={handleFavorite}
                color={isFavorited ? "#dc3545" : "#6c757d"}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 10
    },
    // Add more styles here if needed
});

export default FavoriteButton;
