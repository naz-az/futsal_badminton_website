import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import AuthContext from '../context/authContext';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';

const SettingsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const auth = useContext(AuthContext);
  const navigation = useNavigation();
  const [password, setPassword] = useState('');

  const getToken = async () => {
    return await AsyncStorage.getItem('token');
  };

  const handleDeactivateAccount = async () => {
    try {
      const token = await getToken();
      const response = await axios.delete('http://127.0.0.1:8000/api/deactivate-account/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        await AsyncStorage.removeItem('token');
        auth.logout();
        navigation.navigate('Login');
        Alert.alert('Your account has been deactivated successfully.');
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      Alert.alert('There was an error while deactivating your account.');
    }
  };

  const handleConfirmDeactivation = async () => {
    if (!password) {
      Alert.alert('Please enter your password to confirm deactivation.');
      return;
    }

    try {
      const token = await getToken();
      const response = await axios.post('http://127.0.0.1:8000/api/verify-password/', { password }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        handleDeactivateAccount();
        setShowModal(false);
      } else {
        Alert.alert('Incorrect password.');
      }
    } catch (error) {
      Alert.alert('An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>YOUR SETTINGS</Text>
      {/* <Text style={styles.subTitle}>Manage Your Account</Text> */}

      <View style={styles.section}>
      <Text style={styles.sectionTitle}>Edit Account</Text>
      <CustomButton 
        title="Edit Account" 
        onPress={() => navigation.navigate('EditAccount')} 
        color="#053c43" // Applied color
        textColor="white" // Assuming you want white text
      />
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Privacy Settings</Text>
      <CustomButton 
        title="Manage Blocked Users" 
        onPress={() => navigation.navigate('BlockedUsersPage')} 
        color="#053c43" // Applied color
        textColor="white"
      />
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Settings</Text>
      <CustomButton 
        title="Notification Settings" 
        onPress={() => navigation.navigate('NotificationSettings')} 
        color="#053c43" // Applied color
        textColor="white"
      />
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Change Password</Text>
      <CustomButton 
        title="Change Password" 
        onPress={() => navigation.navigate('ChangePasswordForm')} 
        color="#053c43" // Applied color
        textColor="white"
      />
    </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deactivate Account</Text>
        <CustomButton title="Deactivate Account" color="#a12222" onPress={() => setShowModal(true)} />
      </View>

      {/* Modal-like component for confirmation */}
      {showModal && (
        <View style={styles.modal}>
          <Text>Confirm Account Deactivation</Text>
          <Text>Are you sure you want to deactivate your account?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Cancel" onPress={() => setShowModal(false)} />
          <Button title="Confirm Deactivation" color="red" onPress={handleConfirmDeactivation} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F4F6F8', // softer background color
  },
  title: {
    fontSize: 24, // larger font size
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // dark color for better contrast
  },
  section: {
    marginVertical: 15,
    alignItems: 'center', // Center align items
  },
  // You may also want to adjust the sectionTitle style if needed
  sectionTitle: {
    // ... existing styles ...
    textAlign: 'center', // Center align text
  },
  // Add a new style for button width
  buttonWidth: {
    width: 250, // Set a fixed width for buttons
    maxWidth: '80%', // Optionally set a maximum width relative to screen size
  },
  modal: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10, // rounded corners
    elevation: 10, // subtle shadow
    alignItems: 'center',
    width: '90%', // limit width for better aesthetics
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 15, // increased padding for better touch area
    borderRadius: 5, // rounded corners
    marginVertical: 15, // increased margin
  },
});

export default SettingsPage;
