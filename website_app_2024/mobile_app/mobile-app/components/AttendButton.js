import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomButton from './CustomButton';

const processImageUrl = (imageUrl) => {
  if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    return `http://127.0.0.1:8000${imageUrl}`;
  }
  return imageUrl;
};

function AttendButton({ projectId, token, fontSize = 14 }) { // Default font size is set to 16
  const [isAttending, setIsAttending] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    return storedToken != null;
  };

  // Redirect to login if not authenticated
  const redirectToLogin = () => {
    // Handle navigation to login screen
  };

  useEffect(() => {
    if (token && projectId) { // Check if projectId is defined
      axios.get(`http://127.0.0.1:8000/api/attendance/is-attending/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => setIsAttending(response.data.isAttending))
      .catch(error => console.error("Error checking attendance status:", error));
    }
  }, [projectId, token]);
  

  const handleAttendance = async () => {
    if (!await isAuthenticated()) {
      redirectToLogin();
      return;
    }

    const url = `http://127.0.0.1:8000/api/attendance/${isAttending ? `remove/${projectId}/` : `add/${projectId}/`}`;
    const method = isAttending ? 'delete' : 'post';

    axios({ method, url, headers: { Authorization: `Bearer ${token}` } })
    .then(() => setIsAttending(!isAttending))
    .catch(error => console.error(`Error ${isAttending ? 'cancelling attendance' : 'attending'}:`, error));
  };

  return (
    <View style={styles.container}>
      {isAttending ? (
        <TouchableOpacity style={[styles.button, styles.attending]} onPress={handleAttendance}>
          <Icon name="check" size={fontSize} color="#fff" style={styles.icon}/>
          <Text style={[styles.buttonText, { fontSize }]}>Attending</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.button, styles.notAttending]} onPress={handleAttendance}>
          {/* <Icon name="check" size={fontSize} color="#fff" style={styles.icon}/> */}
          <Text style={[styles.buttonText, { fontSize }]}>Attend</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Add your container styles here
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  attending: {
    backgroundColor: '#105710',

  },
  notAttending: {
    backgroundColor: '#3c3d3c',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
  },
  icon: {
    marginRight: 8
  }
});

export default AttendButton;
