import React, { useContext } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/authContext';
import { useNavigation } from '@react-navigation/native';
import { ButtonGroup, Badge } from 'react-native-elements';

const processImageUrl = (imageUrl) => {
  if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    return `http://127.0.0.1:8000${imageUrl}`;
  }
  return imageUrl;
};

const RelatedProjectsSlider = ({ relatedProjects, currentProjectId }) => {
  const auth = useContext(AuthContext);
  const navigation = useNavigation();

  const handlePress = (projectId) => {
    navigation.navigate('ProjectScreen', { id: projectId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Related Projects</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {relatedProjects
          .filter((relatedProject) => relatedProject.id !== currentProjectId)
          .map((relatedProject) => (
            <View key={relatedProject.id} style={styles.projectCard}>
              <TouchableOpacity 
                onPress={() => handlePress(relatedProject.id)}
              >
                <Image
                  source={{ uri: `http://127.0.0.1:8000${relatedProject.featured_image}` }}
                  style={styles.image}
                />
                <Text style={styles.text}>{relatedProject.title}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
                onPress={() => navigation.navigate('Profile', { id: relatedProject.owner.id })}
              >
                <Image 
                  source={{ uri: processImageUrl(relatedProject.owner.profile_image) }}
                  style={{ width: 30, height: 30, marginRight: 10, borderRadius: 15 }}
                />
                <Text>{relatedProject.owner.name}</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: 'green', fontSize: 22 }}>👍</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{relatedProject.upvotes}</Text>
              </View>

              <Text style={{ fontSize: 22, marginTop: 10 }}>
                RM {relatedProject.price}
              </Text>

              <ButtonGroup>
                {relatedProject.tags.map((tag) => (
                  <TouchableOpacity 
                    key={tag.id} 
                    onPress={() => navigation.navigate('Category', { tagId: tag.id })}
                  >
                    <Text style={{ fontSize: 12, padding: 5, backgroundColor: '#007bff', color: '#fff', marginEnd: 5 }}>
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ButtonGroup>

              <Badge value={relatedProject.brand} badgeStyle={{ backgroundColor: 'black' }} />
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  projectCard: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
    marginHorizontal: 5,
    borderRadius: 8,
    overflow: 'hidden',
    width: 250, // Adjust width as necessary
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    margin: 10,
  },
  // Add additional styles as needed
});

export default RelatedProjectsSlider;
