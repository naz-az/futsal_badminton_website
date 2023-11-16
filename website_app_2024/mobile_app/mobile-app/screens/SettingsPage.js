import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import AuthContext from '../context/authContext';
import { useNavigation } from '@react-navigation/native';

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
      <Text style={styles.subTitle}>Manage Your Account</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Edit Account</Text>
        <Button title="Edit Account" onPress={() => navigation.navigate('EditAccount')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        <Button title="Manage Blocked Users" onPress={() => navigation.navigate('BlockedUsersPage')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        <Button title="Notification Settings" onPress={() => navigation.navigate('NotificationSettings')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <Button title="Change Password" onPress={() => navigation.navigate('ChangePasswordForm')} />
      </View>


      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deactivate Account</Text>
        <Button title="Deactivate Account" color="red" onPress={() => setShowModal(true)} />
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  modal: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 5,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 10,
    marginVertical: 10,
  },
});

export default SettingsPage;
