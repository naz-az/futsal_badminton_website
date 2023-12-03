import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

function AttendanceListComponent({ projectId, isCompact = false }) {
  const [attendees, setAttendees] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(
          `http://127.0.0.1:8000/api/projects/${projectId}/attendees/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAttendees(response.data);
        console.log(`Attendees for project ${projectId}:`, response.data); // Log statement
      } catch (error) {
        console.error('Error fetching attendees:', error);
      }
    };
    fetchAttendees();
  }, [projectId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate(
          'UserProfileDetail',
          { id: item.attendee.id }
        )
      }
    >
      <Image
        source={{ uri: item.attendee.profile_image }}
        style={styles.image}
      />
      <Text style={styles.name}>{item.attendee.name}</Text>
    </TouchableOpacity>
  );

  // Always render the header with attendee count
  const renderHeader = () => (
    <View style={styles.compactContainer}>
      <Icon name="group" size={20} color="#333" style={styles.iconStyle} />
      <Text style={styles.text}>
        <Text style={styles.bold}>Attendees ({attendees.length})</Text>
      </Text>
    </View>
  );

  if (isCompact) {
    return renderHeader();
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={attendees}
        renderItem={renderItem}
        keyExtractor={item => item.attendee.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    color: '#000',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingVertical: 8, // Adds padding above and below the text
    paddingHorizontal: 4, // Adds padding on the sides
  },
  compactText: {
    fontSize: 14,
    color: '#333',
    flex: 1, // Ensures the text takes up the full width of the container
    flexWrap: 'wrap', // Allows text to wrap if too long
  },
  iconStyle: {
    marginRight: 8, // Space between icon and text
  },
  text: {
    fontSize: 14,
    color: '#333',

  },
  bold: {
    fontWeight: 'bold',
  },
});

export default AttendanceListComponent;
