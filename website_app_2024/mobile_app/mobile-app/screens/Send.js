import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, Modal, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/authContext';
import { Picker } from '@react-native-picker/picker';

function Send() {
    const [formData, setFormData] = useState({
        subject: '',
        body: '',
        recipientId: ''
    });
    const [profiles, setProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [responseMessage, setResponseMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [existingThreadId, setExistingThreadId] = useState(null);
    const [blockedByUsers, setBlockedByUsers] = useState([]);
    const [usersBlockingMe, setUsersBlockingMe] = useState([]);

    useEffect(() => {
        const fetchToken = async () => {
            const token = await AsyncStorage.getItem("token");
            const authHeaders = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            axios.get('http://127.0.0.1:8000/api/profiles/', authHeaders)
                .then(response => {
                    setProfiles(response.data);
                })
                .catch(err => console.log(err));

            axios.get('http://127.0.0.1:8000/api/blocking-users/', authHeaders)
                .then(response => {
                    setUsersBlockingMe(response.data);
                })
                .catch(err => console.log(err));

            axios.get('http://127.0.0.1:8000/api/blocked-users/', authHeaders)
                .then(response => {
                    setBlockedByUsers(response.data);
                })
                .catch(err => console.log(err));
        };

        fetchToken();
    }, []);

    const auth = useContext(AuthContext);
    const currentUserId = auth.user.profile.id;

    useEffect(() => {
        const newFilteredProfiles = profiles.filter(profile => 
            profile.id !== currentUserId &&
            !blockedByUsers.some(blockedUser => blockedUser.id === profile.id) &&
            !usersBlockingMe.some(blockingUser => blockingUser.id === profile.id)
        );
        setFilteredProfiles(newFilteredProfiles);
    }, [blockedByUsers, usersBlockingMe, profiles, currentUserId]);

    const handleChange = (name, value) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        const token = await AsyncStorage.getItem("token");
        const authHeaders = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/send_message/', formData, authHeaders);
            setResponseMessage(response.data.message);
            // Handle navigation to thread if needed
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setExistingThreadId(null);
        setFormData({ ...formData, recipientId: '' });
    };

    const navigateToInbox = () => {
        navigation.navigate('ThreadMessages'); // Replace 'Inbox' with the actual route name of your Inbox screen
      };

    return (
        <ScrollView>
            <View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>Send Message</Text>
                <Button
        title="Back to Inbox"
        onPress={navigateToInbox}
      />
                {/* Form for sending a message */}
                <View style={styles.container}>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Recipient:</Text>
          <Picker
            selectedValue={formData.recipientId}
            onValueChange={(itemValue) => handleChange('recipientId', itemValue)}>
            <Picker.Item label="Select Recipient" value="" />
            {filteredProfiles.map(profile => (
              <Picker.Item key={profile.id} label={profile.name || profile.username} value={profile.id} />
            ))}
          </Picker>
        </View>
                    <View>
                        <Text>Body:</Text>
                        <TextInput
                            style={{ height: 80, borderColor: 'gray', borderWidth: 1 }}
                            onChangeText={text => handleChange('body', text)}
                            value={formData.body}
                            multiline
                        />
                    </View>
                    <Button title="Submit" onPress={handleSubmit} />
                </View>

                {/* Display response message */}
                {responseMessage && (
                    <View>
                        <Text>Message Sent</Text>
                        <Text>{JSON.stringify(responseMessage, null, 2)}</Text>
                    </View>
                )}

                {/* Modal for existing thread message */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showModal}
                    onRequestClose={handleModalClose}
                >
                    <View style={{ marginTop: 22 }}>
                        <View>
                            <Text>Existing Thread</Text>
                            <Text>You have already a thread with this participant.</Text>

                            <Button title="Cancel" onPress={handleModalClose} />
                            {/* <Button title="Go to Thread Message" onPress={navigateToThread} /> */}
                        </View>
                    </View>
                </Modal>
            </View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        // Your style settings for the container
        padding: 10,
        // more styles...
    },
    formGroup: {
        // Style settings for form groups
        marginBottom: 15,
        // more styles...
    },
    label: {
        // Styles for your labels
        fontWeight: 'bold',
        // more styles...
    },
    // ... more styles for other components
});

export default Send;