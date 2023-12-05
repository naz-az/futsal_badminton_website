import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Card, ButtonGroup } from 'react-native-elements'; // You might need to install react-native-elements
import VotingButtons from "../components/VotingButtons"; // Adjust the path if necessary
import AuthContext from '../context/authContext'; // Adjust the path as needed

function Categories() {
  const [tags, setTags] = useState([]);
  const [currentTagProjects, setCurrentTagProjects] = useState([]);
  const tabWrapperRef = useRef(null);

  const navigation = useNavigation();
  const initialTagId = navigation.getParam('tag_id', null);

  const [activeTagId, setActiveTagId] = useState(initialTagId || (tags.length ? tags[0].id : null));

  const activeTagName = tags.find(tag => tag.id === activeTagId)?.name || 'Unknown Tag';

  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await axios.get("http://127.0.0.1:8000/api/tags/");
      setTags(data);
      if (!initialTagId && data.length) {
        setActiveTagId(data[0].id);
      }
    };
    fetchTags();
  }, [initialTagId]);

  useEffect(() => {
    if (activeTagId) {
      fetchProjectsByTag(activeTagId);
    }
  }, [activeTagId]);

  const fetchProjectsByTag = async (tagId) => {
    const { data } = await axios.get(`http://127.0.0.1:8000/api/projects/?tag_id=${tagId}`);
    setCurrentTagProjects(data.map(project => ({
      ...project,
      imageUrl: processImageUrl(project.imageUrl),
    })));
  };

  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };

  const scrollViewRef = useRef();

  const handleScrollLeft = () => {
      scrollViewRef.current?.scrollTo({
          x: scrollViewRef.current.scrollLeft - 150, // Adjust the value as needed
          animated: true,
      });
  };

  const handleScrollRight = () => {
      scrollViewRef.current?.scrollTo({
          x: scrollViewRef.current.scrollLeft + 150, // Adjust the value as needed
          animated: true,
      });
  };

  useEffect(() => {
    const fetchFollowedTags = async () => {
      if (auth.isAuthenticated) {
        try {
          const token = await AsyncStorage.getItem("token");
          const { data } = await axios.get("http://127.0.0.1:8000/api/followed-tags", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setFollowedTags(new Set(data.map((tag) => tag.id)));
        } catch (error) {
          console.error("Error fetching followed tags", error);
        }
      }
    };
    fetchFollowedTags();
  }, [auth.isAuthenticated]); 
  
  const toggleFollowTag = async (tagId) => {
    if (!auth.isAuthenticated) {
      navigation.navigate('Login'); // Replace 'Login' with your login screen route name
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
  
      if (followedTags.has(tagId)) {
        await axios.post(
          `http://127.0.0.1:8000/api/unfollow-tag/${tagId}/`,
          {},
          config
        );
        followedTags.delete(tagId);
      } else {
        await axios.post(
          `http://127.0.0.1:8000/api/follow-tag/${tagId}/`,
          {},
          config
        );
        followedTags.add(tagId);
      }
  
      setFollowedTags(new Set([...followedTags]));
    } catch (error) {
      console.error("Error toggling tag follow status", error);
    }
  };

  // Function to navigate to followed tags screen
  const navigateToFollowedTags = () => {
    navigation.navigate('FollowedTags'); // Replace 'FollowedTags' with your followed tags screen route name
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.header}>Categories</Text>

        {auth.isAuthenticated && (
          <View style={styles.followTagsButton}>
            <Button title="View Followed Tags" onPress={navigateToFollowedTags} />
          </View>
        )}

        <View style={styles.tagButtons}>
          <Button title="←" onPress={handleScrollLeft} />
          <ScrollView horizontal ref={scrollViewRef}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={tag.id === activeTagId ? styles.activeTagButton : styles.tagButton}
                onPress={() => {
                  fetchProjectsByTag(tag.id);
                  setActiveTagId(tag.id);
                }}
              >
                <Text>{tag.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button title="→" onPress={handleScrollRight} />
        </View>

        <View style={styles.tagDetails}>
          {activeTagName && (
            <Text style={styles.activeTagName}>Deals for {activeTagName}</Text>
          )}
          {activeTagId && (
            <Button
              title={followedTags.has(activeTagId) ? `Unfollow ${activeTagName}` : `Follow ${activeTagName}`}
              onPress={() => toggleFollowTag(activeTagId)}
              color={followedTags.has(activeTagId) ? "#FFA500" : "#FFFFFF"} // Warning color for unfollow, light color for follow
            />
          )}
        </View>
        {/* Display the projects or other content as needed */}
      </View>

        {/* Render projects */}
        {currentTagProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            auth={auth}
          />
        ))}


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  followTagsButton: {
    marginBottom: 25,
  },
  tagButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagButton: {
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: '#DDDDDD', // Secondary color
  },
  activeTagButton: {
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: '#007BFF', // Primary color
  },
  tagDetails: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 20,
  },
  activeTagName: {
    marginRight: 20,
    fontSize: 18,
  },
  // Other styles...
});

export default Categories;


