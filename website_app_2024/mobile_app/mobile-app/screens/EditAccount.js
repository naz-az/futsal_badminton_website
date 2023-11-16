import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import AuthContext from '../context/authContext';
import { launchImageLibrary } from 'react-native-image-picker';

const EditAccount = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        username: '',
        location: '',
        bio: '',
        short_intro: '',
        profile_image: '',
        social_facebook: '',
        social_twitter: '',
        social_instagram: '',
        social_youtube: '',
        social_website: '',
        blocked_users: [], // initialize as empty array
        followed_tags: [], // initialize as empty array
        followers: [], // initialize as empty array
    });
    const [imagePreview, setImagePreview] = useState('');

    const clearImage = () => {
        setProfile(prevState => ({ ...prevState, profile_image: '' }));
        setImagePreview('');
    };

    const [selectedFile, setSelectedFile] = useState(null);
    const navigation = useNavigation();
    const auth = useContext(AuthContext);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const response = await axios.get('http://127.0.0.1:8000/api/user/account/', config);
                if (response.data) {
                    setProfile(response.data.profile);
                }
            } catch (error) {
                console.error("Error fetching user data", error);
            }
        };
    
        fetchUserData();
    }, []);

    const handleChange = (e, name) => {
        const value = name === "profile_image" ? e : e.nativeEvent.text;
        if(name === "profile_image") {
            setSelectedFile(e);
            const file = e;
            const imageURL = URL.createObjectURL(file);
            setImagePreview(imageURL);
        } else {
            setProfile(prevState => ({...prevState, [name]: value}));
        }
    };

    // Image processing function
    const processImageUrl = (imageUrl) => {
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            return `http://127.0.0.1:8000${imageUrl}`;
        }
        return imageUrl;
    };

    const handleSubmit = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            };
    
            let formData = new FormData();
            Object.keys(profile).forEach(key => {
                if (Array.isArray(profile[key])) {
                    profile[key].forEach((item) => {
                        formData.append(`${key}[]`, item);
                    });
                } else if (key !== "profile_image") {
                    formData.append(key, profile[key]);
                }
            });

            if (selectedFile) {
                formData.append("profile_image", {
                    uri: selectedFile.uri,
                    type: selectedFile.type,
                    name: selectedFile.name,
                });
            }
    
            const response = await axios.post('http://127.0.0.1:8000/api/user/edit-account/', formData, config);
            if (response.data.success) {
                alert("User account updated successfully!");
                auth.updateUser(response.data["success data"]);
                navigation.navigate('UserAccount'); // Replace with your actual route name
            }
        } catch (error) {
            console.error("Error editing profile", error);
        }
    };

    const handleBackClick = () => {
        navigation.goBack(); // This is the React Native way to navigate back
    };


    const selectImage = () => {
        const options = {
            mediaType: 'photo',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        };
    
        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else {
                const source = { uri: response.assets[0].uri };
                setSelectedFile(source);
                setImagePreview(source.uri);
            }
        });
    };
    



    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                {/* Go Back Button */}
                <TouchableOpacity onPress={handleBackClick} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>

                {/* Name Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.name}
                        onChange={(e) => handleChange(e, 'name')}
                        placeholder="Name"
                    />
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.email}
                        onChange={(e) => handleChange(e, 'email')}
                        placeholder="Email"
                        keyboardType="email-address"
                    />
                </View>

                {/* Username Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.username}
                        onChange={(e) => handleChange(e, 'username')}
                        placeholder="Username"
                    />
                </View>

                {/* Location Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.location}
                        onChange={(e) => handleChange(e, 'location')}
                        placeholder="Location"
                    />
                </View>

                {/* Bio Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.bio}
                        onChange={(e) => handleChange(e, 'bio')}
                        placeholder="Bio"
                        multiline
                    />
                </View>

                {/* Short Intro Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Short Intro</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.short_intro}
                        onChange={(e) => handleChange(e, 'short_intro')}
                        placeholder="Short Intro"
                    />
                </View>

          {/* Profile Image Section */}
          <View style={styles.inputGroup}>
                <Text style={styles.label}>Profile Image</Text>

                {/* Display current image */}
                {profile.profile_image ? (
                    <Image
                        source={{ uri: processImageUrl(profile.profile_image) }}
                        style={styles.imagePreview}
                    />
                ) : (
                    <Text>No image selected</Text>
                )}

                {/* Clear button */}
                <TouchableOpacity onPress={clearImage} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>

                {/* Image Picker Button */}
                <TouchableOpacity onPress={selectImage} style={styles.imagePickerButton}>
                    <Text style={styles.imagePickerButtonText}>Select Image</Text>
                </TouchableOpacity>

                {/* Preview selected image */}
                {imagePreview && (
                    <Image
                        source={{ uri: imagePreview }}
                        style={styles.imagePreview}
                    />
                )}
            </View>

            {/* Social Media Inputs */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Facebook Profile URL</Text>
                <TextInput
                    style={styles.input}
                    value={profile.social_facebook}
                    onChange={(e) => handleChange(e, 'social_facebook')}
                    placeholder="Facebook Profile URL"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Twitter Profile URL</Text>
                <TextInput
                    style={styles.input}
                    value={profile.social_twitter}
                    onChange={(e) => handleChange(e, 'social_twitter')}
                    placeholder="Twitter Profile URL"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Instagram Profile URL</Text>
                <TextInput
                    style={styles.input}
                    value={profile.social_instagram}
                    onChange={(e) => handleChange(e, 'social_instagram')}
                    placeholder="Instagram Profile URL"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>YouTube Channel URL</Text>
                <TextInput
                    style={styles.input}
                    value={profile.social_youtube}
                    onChange={(e) => handleChange(e, 'social_youtube')}
                    placeholder="YouTube Channel URL"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Website URL</Text>
                <TextInput
                    style={styles.input}
                    value={profile.social_website}
                    onChange={(e) => handleChange(e, 'social_website')}
                    placeholder="Website URL"
                />
            </View>

            {/* Submit Button */}
            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
            </View>

                </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    formContainer: {
        marginTop: 20,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
    },
    backButton: {
        backgroundColor: '#6c757d',
        padding: 10,
        marginBottom: 20,
    },
    backButtonText: {
        color: 'white',
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: 'blue',
        padding: 10,
    },
    submitButtonText: {
        color: 'white',
        textAlign: 'center',
    },
  imagePreview: {
        width: 300,
        height: 300,
        resizeMode: 'cover',
        alignSelf: 'center',
        marginVertical: 10,
    },
    clearButton: {
        backgroundColor: 'red',
        padding: 10,
        marginVertical: 10,
    },
    clearButtonText: {
        color: 'white',
        textAlign: 'center',
    },
    imagePickerButton: {
        backgroundColor: 'blue',
        padding: 10,
    },
    imagePickerButtonText: {
        color: 'white',
        textAlign: 'center',
    },
    
    });

export default EditAccount;

