import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AuthContext from '../context/authContext'; // Ensure AuthContext is imported correctly
import { useNavigation } from '@react-navigation/native'; // Add this line to import useNavigation

// Header component
const Header = ({ navigation }) => {
  // Use useContext to access the current user from AuthContext
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);

  // Function to handle logout
  const handleLogout = () => {
    logout(); // Call the logout function from context
    setShowDropdown(false); // Hide the dropdown
    // You might want to navigate the user to the login screen after logging out
    navigation.navigate('Login');
  };
  // Check if user and user.profile are not null before logging
  useEffect(() => {
    // This effect will re-run whenever the `user` context updates
    if (user && user.profile) {
      console.log("User profile updated in header:", user.profile);
    }
  }, [user]); // Adding user as a dependency for the effect

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>KickMates</Text>
      {user && user.profile ? (
        <View style={styles.userInfoContainer}>
          <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
            <Image
              source={{ uri: `http://127.0.0.1:8000${user.profile.profile_image}` }}
              style={styles.profileImage}
            />
            <Text style={styles.username}>{user.profile.username}</Text>
          </TouchableOpacity>
          {/* Dropdown menu */}
          {showDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.dropdownItem}>Logout</Text>
              </TouchableOpacity>


        </View>
          )}
        </View>
      ) : (
        // Show login button if no user is authenticated or user.profile is null
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles for the header
const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#ffffff', // You can change this to any color you want
    borderBottomWidth: 1,
    borderBottomColor: '#ddd', // Gives a subtle bottom border
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loginText: {
    fontSize: 16,
    color: '#0066cc', // Use your app's theme color
  },

  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 30, // Set the size as needed
    height: 30,
    borderRadius: 15, // Half the size of the width/height to make it circular
    marginRight: 10, // Add some margin between the image and the username
  },
  username: {
    fontSize: 16,
    color: '#000', // Set color as needed
  },
  dropdownMenu: {
    position: 'absolute',
    right: 10,
    top: 50, // Adjust the position as needed
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { height: 3, width: 0 },
    elevation: 10, // for Android shadow
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#000',
  },
  settingsText: {
    fontSize: 16,
    marginLeft: 10, // Adjust spacing as needed
    color: '#0066cc', // Use your app's theme color for the Settings text
  },
});

export default Header;
