import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";

function AttendButton({ projectId, token, onAttendChange }) {
  const [isAttending, setIsAttending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();

  const isAuthenticated = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    return storedToken != null;
  };

  useEffect(() => {
    if (token && projectId) {
      axios.get(`http://127.0.0.1:8000/api/attendance/is-attending/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => setIsAttending(response.data.isAttending))
      .catch(error => console.error("Error checking attendance status:", error));
    }
  }, [projectId, token]);

  const closeAndNotify = () => {
    setShowModal(false);
    if (onAttendChange) onAttendChange();
  };

  const handleAttendance = async () => {
    if (!await isAuthenticated()) {
      navigation.navigate('Login');
      return;
    }

    const url = `http://127.0.0.1:8000/api/attendance/${isAttending ? `remove/${projectId}/` : `add/${projectId}/`}`;
    const method = isAttending ? 'delete' : 'post';

    try {
      await axios({ method, url, headers: { Authorization: `Bearer ${token}` } });
      setIsAttending(!isAttending);
      setShowModal(true);

      setTimeout(closeAndNotify, 3000);
    } catch (error) {
      console.error(`Error ${isAttending ? 'cancelling attendance' : 'attending'}:`, error);
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={closeAndNotify}
      >
        <TouchableWithoutFeedback onPress={closeAndNotify}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                {isAttending ? "You're attending this event" : "You cancelled attending this event"}
              </Text>
              {isAttending && (
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    navigation.navigate('AttendingProjects', { projectId });
                  }}
                  style={styles.viewButton}
                >
                  <Text style={styles.viewButtonText}>View all attending events</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {isAttending ? (
        <TouchableOpacity style={[styles.button, styles.attending]} onPress={handleAttendance}>
          <Text style={[styles.buttonText]}>Attending</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.button, styles.notAttending]} onPress={handleAttendance}>
          <Text style={[styles.buttonText]}>Attend</Text>
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Align to the top
    alignItems: 'center',         // Keep it centered horizontally
    paddingTop: 50, 
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: '#e1eef0c2',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 14,
    marginBottom: 10,
  },
  viewButton: {
    backgroundColor: '#366d6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default AttendButton;
