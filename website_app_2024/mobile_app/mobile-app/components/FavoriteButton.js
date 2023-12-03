import React, { useState, useEffect } from "react";
import axios from "axios";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

function FavoriteButton({ projectId, token, onUnbookmark }) { // Add onUnbookmark here
    const [isFavorited, setIsFavorited] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        console.log(`FavoriteButton: projectId = ${projectId}, isFavorited = ${isFavorited}`);

        if (token && projectId) {
            axios.get(`http://127.0.0.1:8000/api/favorites/is-favorite/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                console.log('Favorite status check response:', response);
                setIsFavorited(response.data.isFavorited);
            })
            .catch(error => console.error("Error checking favorite status:", error));
        }
    }, [projectId, token]);

    const handleFavorite = async () => {
        if (!token) {
            navigation.navigate('Login');
            return;
        }

        const url = `http://127.0.0.1:8000/api/favorites/${isFavorited ? 'remove' : 'add'}/${projectId}/`;
        const method = isFavorited ? 'delete' : 'post';

        axios({ method, url, headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          setIsFavorited(!isFavorited);
          if (isFavorited && onUnbookmark) {
            onUnbookmark(); // Invoke the callback when unbookmarking
          }
        })
        .catch(error => console.error(`Error ${isFavorited ? 'removing from' : 'adding to'} favorites:`, error));
    };

    
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleFavorite} style={styles.button}>
                <Icon
                    name={isFavorited ? "bookmark" : "bookmark-o"}
                    size={25}
                    color={isFavorited ? "#802c2c" : "#cccccc"} // Change color based on isFavorited state
                />
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        margin: 10
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        padding: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    buttonText: {
        color: 'white', // Text color
        marginLeft: 10, // Space between icon and text
    },});

export default FavoriteButton;
