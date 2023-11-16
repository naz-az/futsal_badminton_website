import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

function SearchBox() {
    const [keyword, setKeyword] = useState('');
    const navigation = useNavigation();

    const submitHandler = async (e) => {
        e.preventDefault();
        if (keyword) {
            // Save the keyword to AsyncStorage
            await AsyncStorage.setItem('searchQuery', keyword);
            // Navigate to the search page with the keyword
            navigation.navigate('SearchPage', { search_query: keyword });
        } else {
            // Navigate to the current page or a default one
            navigation.navigate(navigation.getState().routes[0].name);
        }
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                onChangeText={setKeyword}
                value={keyword}
                placeholder="Enter keyword"
            />
            <Button
                onPress={submitHandler}
                title="Submit"
                color="#00cc00"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        padding: 10,
        marginRight: 10,
        flex: 1,
    }
});

export default SearchBox;
