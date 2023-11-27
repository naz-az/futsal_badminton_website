import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Button } from 'react-native';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Card, ButtonGroup } from 'react-native-elements'; // You might need to install react-native-elements
import VotingButtons from "../components/VotingButtons"; // Adjust the path if necessary
import AuthContext from '../context/authContext'; // Adjust the path as needed
import ProjectCard from "../components/ProjectCard";
import ProjectComponent from "../components/ProjectComponent";
import Icon from 'react-native-vector-icons/FontAwesome'; // You can choose other icon sets as needed
import CustomButton from "../components/CustomButton";

// CustomButton Component Definition
// const CustomButton = ({ title, onPress, style }) => (
//   <TouchableOpacity onPress={onPress} style={[styles.customButton, style]}>
//     <Text style={styles.buttonText}>{title}</Text>
//   </TouchableOpacity>
// );

function Categories({ route }) {
  const [tags, setTags] = useState([]);
  const [currentTagProjects, setCurrentTagProjects] = useState([]);
  const tabWrapperRef = useRef(null);

  const navigation = useNavigation();
  // const initialTagId = navigation.getParam('tag_id', null);

  const [activeTagId, setActiveTagId] = useState(initialTagId || (tags.length ? tags[0].id : null));

  const activeTagName = tags.find(tag => tag.id === activeTagId)?.name || 'Unknown Tag';

  const auth = useContext(AuthContext);
  const initialTagId = route.params?.tag_id || null;

  const [followedTags, setFollowedTags] = useState(new Set());


  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await axios.get("http://127.0.0.1:8000/api/tags/");
      setTags(data);
      if (initialTagId) {
        setActiveTagId(initialTagId);
        fetchProjectsByTag(initialTagId);
      } else if (data.length) {
        setActiveTagId(data[0].id);
        fetchProjectsByTag(data[0].id);
      }
    };
    fetchTags();
  }, [initialTagId]);
  
  const tagButtonWidth = 80; // Adjust this value based on your actual UI

  const scrollToActiveTag = () => {
    const index = tags.findIndex(tag => tag.id === activeTagId);
    const position = index * tagButtonWidth; // Assuming a fixed width for each tag button
    scrollViewRef.current?.scrollTo({ x: position, animated: true });
  };
  
  useEffect(() => {
    if (tags.length && activeTagId) {
      scrollToActiveTag();
    }
  }, [tags, activeTagId]);

  
  useEffect(() => {
    if (activeTagId) {
      fetchProjectsByTag(activeTagId);
    } else if (tags.length) {
      setActiveTagId(tags[0].id);
    }
  }, [activeTagId, tags]);

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
    navigation.navigate('FollowedTagsPage'); // Replace 'FollowedTags' with your followed tags screen route name
  };

  return (
    <ScrollView style={{ backgroundColor: '#ffffff' }}>
      <View style={styles.container}>
        <Text style={styles.header}>Categories</Text>

        {auth.isAuthenticated && (
          <View style={styles.followTagsButton}>
            <CustomButton title="View Followed Tags" color="#2e4457" onPress={navigateToFollowedTags} />
          </View>
        )}

<View style={styles.tagButtons}>
  <TouchableOpacity onPress={handleScrollLeft} style={styles.scrollButtonLeft}>
    <Icon name="arrow-left" size={20} color="#000" /> {/* Left Icon */}
  </TouchableOpacity>
  <ScrollView horizontal ref={scrollViewRef} snapToAlignment="start" decelerationRate="fast" showsHorizontalScrollIndicator={false}>
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
  <TouchableOpacity onPress={handleScrollRight} style={styles.scrollButtonRight}>
    <Icon name="arrow-right" size={20} color="#000" /> {/* Right Icon */}
  </TouchableOpacity>
</View>




<View style={styles.tagDetails}>
  {activeTagName && (
    <Text style={styles.activeTagName}>Events for {activeTagName}</Text>
  )}
  {activeTagId && (
    <CustomButton
      title={followedTags.has(activeTagId) ? `Unfollow ${activeTagName}` : `Follow ${activeTagName}`}
      onPress={() => toggleFollowTag(activeTagId)}
      color={followedTags.has(activeTagId) ? "#ac912f" : "#726d67"} // Color styling
    />
  )}
</View>

        {/* Display the projects or other content as needed */}
      </View>

        {/* Render projects */}
        {/* {currentTagProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            auth={auth}
          />
        ))} */}

{currentTagProjects.map((project) => (
  <View key={project.id} style={{ marginLeft: 15, marginRight: 15 }}> {/* Apply margin to left and right */}
    <ProjectComponent project={project} />
  </View>
))}



    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,

  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  followTagsButton: {
    marginBottom: 25,
    alignSelf: 'flex-start', // Aligns the button to the left
  },
  customButton: {
    backgroundColor: '#75481e', // Example creative color
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  tagButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollButtonLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Margin on the right side for the left arrow
  },
  scrollButtonRight: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10, // Margin on the left side for the right arrow
  },
  tagButton: {
    marginHorizontal: 5,
    padding: 8,
    backgroundColor: '#DDDDDD', // Secondary color
  },
  activeTagButton: {
    marginHorizontal: 5,
    padding: 8,
    backgroundColor: '#ffd597', // Primary color
  },
  tagDetails: {
    display: 'flex',
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  activeTagName: {
    marginRight: 20,
    fontSize: 18,
  },
  // Other styles...
});

export default Categories;
