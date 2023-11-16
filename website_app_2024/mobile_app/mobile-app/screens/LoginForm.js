import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Image, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/authContext'; // Ensure this path matches where you define AuthContext
import friibeeLogo from '../assets/images/friibee-logo.png'; // Update with the correct path to your logo
import axios from 'axios';

function LoginForm({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useContext(AuthContext);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/user/account/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      auth.login(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile.');
      await AsyncStorage.removeItem('token'); // Ensure token is removed if there's an issue
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/token/', {
        username,
        password,
      });

      if (response.data.access) {
        await AsyncStorage.setItem('token', response.data.access);
        auth.login(response.data.user); // This should set the user context and AsyncStorage token
        await fetchUserProfile(response.data.access);
        navigation.navigate('Main'); // Replace 'Home' with the name of your home screen
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await fetchUserProfile(token);
      }
    };

    checkToken();
  }, []);

  const CustomButton = ({ onPress, title }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Image source={friibeeLogo} style={styles.logo} />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <CustomButton title="Log In" onPress={handleSubmit} />
      {error ? Alert.alert("Login Error", error) : null}
      <CustomButton
        title="Don't have an account? Sign Up"
        onPress={() => navigation.navigate('Register')}
      />
      <CustomButton
        title="Forgot Password?"
        onPress={() => navigation.navigate('ForgotPassword')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Example color
    padding: 20,
  },
  logo: {
    width: 300,
    height: 180,
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
    backgroundColor: '#FF6347', // Example color
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


export default LoginForm;
