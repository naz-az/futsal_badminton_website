// RegistrationForm.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity
} from 'react-native';
import AuthContext from '../context/authContext'; // Adjust the import path as needed
import axios from 'axios';
import friibeeLogo from '../assets/images/friibee-logo.png'; // Update with the correct path to your logo
import AsyncStorage from '@react-native-async-storage/async-storage';
import kickmates from '../assets/images/1kickmates-high-resolution-logo-black.png';

const RegistrationForm = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    password2: '', // Confirm password
  });
  const auth = useContext(AuthContext);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.password2) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }
  
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/register/', {
            username: formData.username,
            email: formData.email,
            password: formData.password
          });
  
          await AsyncStorage.setItem('token', response.data.access); // Save token to AsyncStorage
          auth.login(response.data.user); // Automatically log in the user
  
      navigation.navigate('Home'); // Navigate to the home screen
    } catch (error) {
      console.error('Registration failed:', error);
      Alert.alert("Registration Error", "Failed to register. Please try again.");
    }
  };
  

  return (
    <View style={styles.container}>
      <Image source={kickmates} style={styles.logo} />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={formData.name}
        onChangeText={(text) => handleChange('name', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={formData.username}
        onChangeText={(text) => handleChange('username', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => handleChange('password', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={formData.password2}
        onChangeText={(text) => handleChange('password2', text)}
      />
<TouchableOpacity style={styles.button} onPress={handleSubmit}>
  <Text style={styles.buttonText}>Register</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
  <Text style={styles.buttonText}>Already have an account? Sign In</Text>
</TouchableOpacity>


          </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Example color
    padding: 20,
  },
  logo: {
    width: 400,
    height: 80,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

  },
  input: {
    height: 40,
    width: '80%',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0', // Example color
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  button: {
    backgroundColor: '#150f0d', // Example color
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: 'red',
    fontSize: 14,
    marginVertical: 5,
  },
});

export default RegistrationForm;
