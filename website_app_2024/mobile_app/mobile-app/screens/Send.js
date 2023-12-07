import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, ScrollView, TouchableOpacity, Modal, Picker, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthContext from '../context/authContext';
import { Image } from 'react-native';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';


function Send() {
    const [formData, setFormData] = useState({
        subject: '',
        body: '',
        recipientId: ''
    });
    const [profiles, setProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]); // Added state for filtered profiles
    const [responseMessage, setResponseMessage] = useState(null);
    const navigation = useNavigation();
    const route = useRoute();
    const recipientFromQuery = route.params?.recipient; // Adjusted for React Native

    const [showModal, setShowModal] = useState(false);
    const [existingThreadId, setExistingThreadId] = useState(null);

    const [blockedByUsers, setBlockedByUsers] = useState([]);
    const [usersBlockingMe, setUsersBlockingMe] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');

    const [searchInput, setSearchInput] = useState(''); // State for search input

    const [selectedProfile, setSelectedProfile] = useState(null); // State for selected profile

    const [showAlertModal, setShowAlertModal] = useState(false);

    const isFocused = useIsFocused(); // Get the focus state of the screen

        // Define a method to reset state
        const resetState = () => {
            setFormData({
                subject: '',
                body: '',
                recipientId: ''
            });
            setSelectedProfile(null); // Reset selectedProfile to null
            setResponseMessage(null);
            setErrorMessage('');
            setSearchInput(''); // Optionally reset the search input as well
        };
    
        // Use useFocusEffect to reset state when the screen comes into focus
        useFocusEffect(
            useCallback(() => {
                if (isFocused) {
                    resetState();
                }
            }, [isFocused])
        );


    const getToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            return token;
        } catch (e) {
            // Handle read error
        }
    }

    const authHeaders = async () => {
        const token = await getToken();
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const checkExistingThread = async (recipientId) => {
        try {
            const headers = await authHeaders();
            const response = await axios.get('http://127.0.0.1:8000/api/threads/', headers);
            const threads = response.data;
            const existingThread = threads.find(thread =>
                thread.participants.some(p => p.id === recipientId));
            if (existingThread) {
                setExistingThreadId(existingThread.id);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error fetching threads:', error);
        }
    };

    useEffect(() => {
        if (formData.recipientId) {
            checkExistingThread(formData.recipientId);
        }
    }, [formData.recipientId]);


    
      
    useEffect(() => {
        if (recipientFromQuery) {
            
          setFormData(prevState => ({
            ...prevState,
            recipientId: recipientFromQuery
          }));
          // Also, set the selected profile based on this recipient
          // Assuming you have a function to find the profile by ID
          console.log("Recipient from query (profileId):", recipientFromQuery); // Log the recipient ID received from query

        }
      }, [recipientFromQuery]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = await authHeaders();
                const profilesResponse = await axios.get('http://127.0.0.1:8000/api/profiles/', headers);
                const fetchedProfiles = profilesResponse.data;
                setProfiles(fetchedProfiles);
    
                // Check and set selectedProfile based on recipientFromQuery
                if (recipientFromQuery) {
                    const selectedProfile = fetchedProfiles.find(profile => profile.id === recipientFromQuery);
                    setSelectedProfile(selectedProfile || null);
                    setFormData(prevState => ({
                        ...prevState,
                        recipientId: recipientFromQuery
                    }));
                }
                const blockedUsersResponse = await axios.get('http://127.0.0.1:8000/api/blocked-users/', headers);
                setBlockedByUsers(blockedUsersResponse.data);

                const blockingUsersResponse = await axios.get('http://127.0.0.1:8000/api/blocking-users/', headers);
                setUsersBlockingMe(blockingUsersResponse.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);

    const auth = useContext(AuthContext);
    console.log("Auth User:", auth.user);
    const currentUserId = auth.user.profile.id;
    console.log("currentUserId:", currentUserId);

    // useEffect(() => {
    //     const newFilteredProfiles = profiles.filter(profile =>
    //         profile.id !== currentUserId &&
    //         !blockedByUsers.some(blockedUser => blockedUser.id === profile.id) &&
    //         !usersBlockingMe.some(blockingUser => blockingUser.id === profile.id)
    //     );
    //     setFilteredProfiles(newFilteredProfiles);
    // }, [blockedByUsers, usersBlockingMe, profiles, currentUserId]);

    const processImageUrl = (imageUrl) => {
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            return `http://127.0.0.1:8000${imageUrl}`;
        }
        return imageUrl;
    };
    
    
    useEffect(() => {
        if (searchInput) {
            const newFilteredProfiles = profiles.filter(profile => 
                profile.id !== currentUserId &&
                !blockedByUsers.some(blockedUser => blockedUser.id === profile.id) &&
                !usersBlockingMe.some(blockingUser => blockingUser.id === profile.id) &&
                profile.name.toLowerCase().includes(searchInput.toLowerCase())
            );
            setFilteredProfiles(newFilteredProfiles);
        } else {
            setFilteredProfiles([]);
        }
    }, [blockedByUsers, usersBlockingMe, profiles, currentUserId, searchInput]);

    

        // Replaced handleChange for React Native
        const handleChange = (name, value) => {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        };
    
        // Adjusted handleSubmit for React Native
        const handleSubmit = async () => {

        // Check if recipient is selected
        if (!formData.recipientId) {
            setErrorMessage('Error: Please select a recipient before sending the message!');
            return;
        }

        // Reset error message if all validations pass
        setErrorMessage('');


            try {
                const headers = await authHeaders();
                const response = await axios.post('http://127.0.0.1:8000/api/send_message/', formData, headers);
                setResponseMessage(response.data.message);
                if (response.data.thread && response.data.thread.id) {
                    navigation.navigate('Thread', { threadId: response.data.thread.id });
                } else {
                    console.error("Thread ID is missing from the response.");
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        };
    
        // const handleModalClose = () => {
        //     setShowModal(false);
        //     setExistingThreadId(null);
        //     setFormData({ ...formData, recipientId: '' });
        // };
    
        const navigateToThread = () => {
            // Close the modal before navigating
            setShowModal(false);
            setExistingThreadId(null);
            setFormData({ ...formData, recipientId: '' });
        
            // Navigate to the thread
            navigation.navigate('Thread', { threadId: existingThreadId });
        };
        
        const handleSearchChange = (text) => {
            setSearchInput(text);
        };
    
        const handleSelectRecipient = (profile) => {
            setFormData({ ...formData, recipientId: profile.id });
            setSelectedProfile(profile);
            setSearchInput('');
        };
    
        const handleDeselectRecipient = () => {
            setSelectedProfile(null);
            setFormData({ ...formData, recipientId: '' });
        };
        
        const handleModalClose = () => {
            setShowModal(false);
            setExistingThreadId(null);
            setSelectedProfile(null);
            setFormData({ ...formData, recipientId: '' });
            setSearchInput('');
        };

        
        return (
            <ScrollView style={styles.container}>
                {/* Error message display */}
                {errorMessage && (
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                )}
    
                {/* Alert Modal for Recipient Selection */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showAlertModal}
                    onRequestClose={() => setShowAlertModal(false)}
                >
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Recipient not selected! Please select a recipient.</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowAlertModal(false)}
                        >
                            <Text>Close</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
    
                <View style={styles.innerContainer}>
                    <Text style={styles.headerText}>Send Message</Text>
    
                    {/* Navigation Button to Inbox */}
                    <TouchableOpacity onPress={() => navigation.navigate('ThreadMessages')} style={styles.backButtonStyle}>
                        <Text style={styles.backButtonText}>Back to Inbox</Text>
                    </TouchableOpacity>
    
{/* Conditionally render Search and Select Recipient */}
{!selectedProfile && (
            <TextInput 
                placeholder="Enter username" 
                value={searchInput} 
                onChangeText={handleSearchChange}
                style={styles.input}
            />
        )}

        {selectedProfile && (
            <View style={styles.selectedProfileContainer}>
                <Image 
                    source={{ uri: processImageUrl(selectedProfile.profile_image) }} 
                    style={styles.profileImage}
                />
                <Text style={{ flex: 1 }}>{selectedProfile.name || selectedProfile.username}</Text>
                <TouchableOpacity onPress={handleDeselectRecipient} style={styles.deselectButton}>
                    <Text style={styles.deselectButtonText}>X</Text>
                </TouchableOpacity>
            </View>
        )}
    
    {!selectedProfile && searchInput && (
    <FlatList
        data={filteredProfiles}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
            <View style={styles.profileListItem}>
                <TouchableOpacity 
                    style={styles.profileListInnerItem} 
                    onPress={() => handleSelectRecipient(item)}
                >
                    <Image 
                        source={{ uri: processImageUrl(item.profile_image) }} 
                        style={styles.profileListImage}
                    />
                    <Text>{item.name || item.username}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.selectButton} 
                    onPress={() => handleSelectRecipient(item)}
                >
                    <FontAwesomeIcon icon={faCheckCircle} size={16} color={"#fff"} style={styles.selectButtonIcon} />
                    <Text style={styles.selectButtonText}>Select</Text>
                </TouchableOpacity>
            </View>
        )}
    />
)}
    
                    {/* Form for Message Body */}
                    <View style={styles.formContainer}>
                        <TextInput
                            multiline
                            numberOfLines={4}
                            onChangeText={(text) => handleChange('body', text)}
                            value={formData.body}
                            style={styles.input}
                        />
    
                        {/* Submit Button */}
                        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
    
                    {/* Response Message Display */}
                    {responseMessage && (
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageText}>Message Sent</Text>
                            {/* <Text>{JSON.stringify(responseMessage, null, 2)}</Text> */}
                        </View>
                    )}
    
                    {/* Modal for Existing Thread */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showModal}
                        onRequestClose={handleModalClose}>
                        <View style={styles.modal}>
                            <Text style={styles.modalTitle}>Existing Thread</Text>
                            <Text>You have already a thread with this participant.</Text>
    
                            {/* Buttons for Modal Actions */}
                            <TouchableOpacity style={styles.button} onPress={navigateToThread}>
                                <Text style={styles.buttonText}>Go to Thread Message</Text>
                            </TouchableOpacity>
    
                            <TouchableOpacity style={styles.button} onPress={handleModalClose}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </View>
            </ScrollView>
        );
    }
// Define the styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f7',
    },
    innerContainer: {
        padding: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#095059',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modal: {
        marginTop: 50,
        marginHorizontal: 20,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
    },
    linkText: {
        color: 'blue',
        textAlign: 'center',
        marginBottom: 15,
    },
    messageText: {
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#28a745', // Success color
        marginBottom: 15,
    },
    backButtonStyle: {
        backgroundColor: '#f0f0f7', // Different background color
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007bff', // Border color similar to other buttons for consistency
        alignItems: 'center',
        marginBottom: 15,
    },
    backButtonText: {
        color: '#007bff', // Color to match the border
        fontWeight: 'bold',
    },
    errorMessage: {
        color: 'red', // Change as needed for your design
        textAlign: 'center',
        marginBottom: 10,
    },


        // Updated styles for recipient selection
        selectedProfileContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#e8f4f8', // Soft background color
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            elevation: 2,
        },
        profileImage: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 10,
        },
        profileListItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            elevation: 2,
        },
        
        profileListInnerItem: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        
        profileListImage: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 10, // Added margin to separate the image from the username
        },
    
        // Enhanced form and button styles
        input: {
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 12,
            padding: 15,
            marginBottom: 15,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
            elevation: 1,
        },
        button: {
            backgroundColor: '#0d4647', // Vibrant button color
            borderRadius: 12,
            padding: 15,
            alignItems: 'center',
            marginBottom: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,
            elevation: 4,
        },
    
        // Modal styling
        modal: {
            // ... (existing modal styles)
            borderRadius: 12,
            padding: 20,
        },
    
        // General layout and typography improvements
        container: {
            flex: 1,
            backgroundColor: '#f7f7f7', // Softer background color
        },
        headerText: {
            fontSize: 26,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
            color: '#333',
        },
        messageText: {
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#4CAF50', // Consistent success color
            marginBottom: 15,
        },
        errorMessage: {
            color: 'red',
            textAlign: 'center',
            marginBottom: 10,
            fontWeight: 'bold',
        },
        deselectButton: {
            marginLeft: 10,
            backgroundColor: '#ff4d4d', // Red color for the button
            borderRadius: 5,
            padding: 5,
        },
        deselectButtonText: {
            color: '#fff', // White text for better readability
        },

        selectButton: {
            backgroundColor: '#2f3f59', // A vibrant, eye-catching blue
            borderRadius: 10, // Rounded corners
            paddingVertical: 10,
            paddingHorizontal: 16,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row', // Allows for icon and text alignment
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        
        selectButtonText: {
            color: '#fff', // White text for contrast
            fontWeight: 'bold',
            fontSize: 12,
        },
        
        selectButtonIcon: {
            marginRight: 10, // Space between icon and text
        },


});

export default Send;