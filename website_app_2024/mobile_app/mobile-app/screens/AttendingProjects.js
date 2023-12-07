import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ProjectComponent from '../components/ProjectComponent';

import SortingComponent from '../components/SortingComponent';

function AttendingProjects() {
  const [projects, setProjects] = useState([]);

  const [sortType, setSortType] = useState('newToOld');
  const [sortedProjects, setSortedProjects] = useState([]);


  useEffect(() => {
    const fetchProjects = async () => {
      const token = await AsyncStorage.getItem("token");
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/user/attending-projects/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching attending projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleRemoveProject = (projectId) => {
    setProjects(projects.filter(project => project.id !== projectId));
  };

  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };


  
  useEffect(() => {
    let sorted = [...projects];
    switch (sortType) {
        case 'topToLow':
            sorted.sort((a, b) => b.upvotes - a.upvotes);
            break;
          case 'lowToTop':
            sorted.sort((a, b) => a.upvotes - b.upvotes);
            break;
          case 'highToLow':
            sorted.sort((a, b) => b.price - a.price);
            break;
          case 'lowToHigh':
            sorted.sort((a, b) => a.price - b.price);
            break;
          case 'newToOld':
            sorted.sort((a, b) => new Date(b.created) - new Date(a.created));
            break;
          case 'oldToNew':
            sorted.sort((a, b) => new Date(a.created) - new Date(b.created));
            break;
          default:
            break;
    }
    setSortedProjects(sorted);
}, [projects, sortType]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Attending Events</Text>
      <Text style={styles.subHeader}>
        {projects.length} Event{projects.length !== 1 ? "s" : ""} Attending
      </Text>


      <SortingComponent sortType={sortType} setSortType={setSortType} /> {/* Use SortingComponent here */}


      <ScrollView>
        {sortedProjects.map(project => (
          <ProjectComponent 
            key={project.id} 
            project={{ ...project, imageUrl: processImageUrl(project.imageUrl) }} 
            onRemoveProject={handleRemoveProject}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF', // Adding a light background for overall page

  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    margin: 10,
    fontWeight: 'bold',

  },
  subHeader: {
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default AttendingProjects;
