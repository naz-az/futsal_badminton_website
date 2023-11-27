import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, Modal, Picker, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthContext from '../context/authContext';

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
        }
    }, [recipientFromQuery]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = await authHeaders();

                const profilesResponse = await axios.get('http://127.0.0.1:8000/api/profiles/', headers);
                setProfiles(profilesResponse.data);

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

    useEffect(() => {
        const newFilteredProfiles = profiles.filter(profile =>
            profile.id !== currentUserId &&
            !blockedByUsers.some(blockedUser => blockedUser.id === profile.id) &&
            !usersBlockingMe.some(blockingUser => blockingUser.id === profile.id)
        );
        setFilteredProfiles(newFilteredProfiles);
    }, [blockedByUsers, usersBlockingMe, profiles, currentUserId]);


        // Replaced handleChange for React Native
        const handleChange = (name, value) => {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        };
    
        // Adjusted handleSubmit for React Native
        const handleSubmit = async () => {
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
    
        const handleModalClose = () => {
            setShowModal(false);
            setExistingThreadId(null);
            setFormData({ ...formData, recipientId: '' });
        };
    
        const navigateToThread = () => {
            // Close the modal before navigating
            setShowModal(false);
            setExistingThreadId(null);
            setFormData({ ...formData, recipientId: '' });
        
            // Navigate to the thread
            navigation.navigate('Thread', { threadId: existingThreadId });
        };
        

        return (
            <ScrollView style={styles.container}>
                <View style={styles.innerContainer}>
                    <Text style={styles.headerText}>Send Message</Text>
    
                    <TouchableOpacity onPress={() => navigation.navigate('ThreadMessages')} style={styles.backButtonStyle}>
                    <Text style={styles.backButtonText}>Back to Inbox</Text>
                </TouchableOpacity>
    
                    <View style={styles.formContainer}>
                        {!recipientFromQuery && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.labelText}>Recipient:</Text>
                                <Picker
                                    selectedValue={formData.recipientId}
                                    onValueChange={(itemValue, itemIndex) =>
                                        handleChange('recipientId', itemValue)
                                    }
                                    style={styles.picker}>
                                    <Picker.Item label="Select Recipient" value="" />
                                    {filteredProfiles.map(profile => (
                                        <Picker.Item key={profile.id} label={profile.name || profile.username} value={profile.id} />
                                    ))}
                                </Picker>
                            </View>
                        )}
    
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>Body</Text>
                            <TextInput
                                multiline
                                numberOfLines={4}
                                onChangeText={(text) => handleChange('body', text)}
                                value={formData.body}
                                style={styles.input}
                            />
                        </View>
    
                        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
    
                    {responseMessage && (
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageText}>Message Sent</Text>
                            <Text>{JSON.stringify(responseMessage, null, 2)}</Text>
                        </View>
                    )}
    
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showModal}
                        onRequestClose={handleModalClose}>
                        <View style={styles.modal}>
                            <Text style={styles.modalTitle}>Existing Thread</Text>
                            <Text>You have already a thread with this participant.</Text>
    
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

});

export default Send;