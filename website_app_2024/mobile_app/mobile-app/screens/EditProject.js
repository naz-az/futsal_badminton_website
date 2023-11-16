import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

const EditProject = () => {
  const [projectData, setProjectData] = useState({
    title: "",
    featured_image: null,
    project_images: Array(3).fill(null),
    description: "",
    brand: "",
    deal_link: "",
    price: "",
    tags: [],
    newTag: "",
  });

  const [imagePreviews, setImagePreviews] = useState({
    featured_image: "",
    featured_image_new: "",
    project_images: Array(3).fill(""),
    project_images_new: Array(3).fill(""),
  });

  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [serverError, setServerError] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const projectId = route.params?.projectId; // Assuming you pass project ID via route params

  const [visibleTagCount, setVisibleTagCount] = useState(10);

  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/`, config);
        
        if (response.data) {
          const project = response.data.project;
          setProjectData(project);
          setSelectedTags(project.tags.map(tag => tag.id));
          setImagePreviews(prevState => ({
            ...prevState,
            featured_image: processImageUrl(project.featured_image),
            project_images: project.project_images.map(img => processImageUrl(img.image)),
          }));
        }
      } catch (error) {
        console.error("Error fetching project details", error);
      }
    };
  
    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/tags/');
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags', error);
      }
    };
  
    fetchTags();
  }, []);

  const handleChangeText = (name, value) => {
    setProjectData(prevState => ({ ...prevState, [name]: value }));
  };
  
  const handleSelectImage = (name) => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri };
        console.log('Selected image: ', source);
  
        if (name === "featured_image") {
          setProjectData(prevState => ({ ...prevState, featured_image: source }));
          setImagePreviews(prevState => ({ ...prevState, featured_image_new: source.uri }));
        } else if (name.startsWith("additional_image_")) {
          const index = parseInt(name.split("_")[2], 10);
          setProjectData(prevState => {
            const newImages = [...prevState.project_images];
            newImages[index] = source;
            return { ...prevState, project_images: newImages };
          });
          setImagePreviews(prevState => {
            const updatedNewImages = [...prevState.project_images_new];
            updatedNewImages[index] = source.uri;
            return { ...prevState, project_images_new: updatedNewImages };
          });
        }
      }
    });
  };
  
  
  const loadMoreTags = () => {
    const newCount = visibleTagCount + 10;
    setVisibleTagCount(newCount > tags.length ? tags.length : newCount);
  };
  
  const loadLessTags = () => {
    const newCount = visibleTagCount - 10;
    setVisibleTagCount(newCount < 10 ? 10 : newCount);
  };

  const handleToggleTagToProject = (tagId) => {
    if (isValidUUID(tagId)) {
      setSelectedTags(selectedTags.includes(tagId)
        ? selectedTags.filter(id => id !== tagId)
        : [...selectedTags, tagId]
      );
    } else {
      console.error("Invalid UUID: ", tagId);
    }
  };
  
  const isValidUUID = (uuid) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
  };
  
  const handleAddTag = async () => {
    const newTagName = projectData.newTag.trim().toLowerCase();
    if (newTagName !== "") {
      const existingTag = tags.find(tag => tag.name.toLowerCase() === newTagName);
      if (existingTag) {
        setSelectedTags(
          selectedTags.includes(existingTag.id)
            ? selectedTags
            : [...selectedTags, existingTag.id]
        );
      } else {
        try {
          const response = await axios.post("http://127.0.0.1:8000/api/add-tag/", { name: newTagName });
          const newTag = response.data;
          setTags([...tags, newTag]);
          setSelectedTags([...selectedTags, newTag.id]);
        } catch (error) {
          console.error("Error adding tag", error);
        }
      }
      setProjectData({ ...projectData, newTag: "" });
    }
  };
  
  const handleSubmit = async () => {
    let formData = new FormData();
    for (let key in projectData) {
      if (key === "project_images") {
        projectData.project_images.forEach((image, index) => {
          if (image) {
            formData.append(`additional_image_${index}`, {
              uri: image.uri,
              type: 'image/jpeg', // or the correct type
              name: `image_${index}.jpg`
            });
          }
        });
      } else if (key === "featured_image") {
        if (projectData.featured_image) {
          formData.append('featured_image', {
            uri: projectData.featured_image.uri,
            type: 'image/jpeg', // or the correct type
            name: 'featured_image.jpg'
          });
        }
      } else if (key !== "tags") {
        formData.append(key, projectData[key]);
      }
    }
  
    selectedTags.forEach(tagId => {
      formData.append("tags", tagId);
    });
  
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.put(`http://127.0.0.1:8000/api/update-project/${projectId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      navigation.navigate("Home"); // Adjust this navigation to your app's flow
    } catch (error) {
      if (error.response && error.response.data) {
        setServerError(Object.values(error.response.data).join(" "));
      } else {
        setServerError("An unexpected error occurred.");
      }
    }
  };

  const clearImage = (imageType, index = null) => {
    if (imageType === 'featured_image') {
      setProjectData({ ...projectData, featured_image: null });
      setImagePreviews({ ...imagePreviews, featured_image: '', featured_image_new: '' });
    } else if (imageType === 'additional_image') {
      setProjectData(prevState => {
        const updatedImages = [...prevState.project_images];
        updatedImages[index] = null;
        return { ...prevState, project_images: updatedImages };
      });
  
      setImagePreviews(prevState => {
        const updatedImagePreviews = [...prevState.project_images];
        const updatedNewImagePreviews = [...prevState.project_images_new];
        updatedImagePreviews[index] = '';
        updatedNewImagePreviews[index] = '';
        return { ...prevState, project_images: updatedImagePreviews, project_images_new: updatedNewImagePreviews };
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter deal title"
          value={projectData.title}
          onChangeText={(text) => handleChangeText('title', text)}
        />
      </View>
  
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter description"
          value={projectData.description}
          onChangeText={(text) => handleChangeText('description', text)}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.card}>
      <Text style={styles.label}>Featured Image</Text>
      {imagePreviews.featured_image && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: imagePreviews.featured_image }}
            style={styles.imagePreview}
          />
          <Text>Current File: {imagePreviews.featured_image.split('/').pop()}</Text>
          <Button title="Clear" onPress={() => clearImage('featured_image')} />
        </View>
      )}

      <Button title="Choose new featured image" onPress={() => handleSelectImage('featured_image')} />

      {imagePreviews.featured_image_new && (
        <Image
          source={{ uri: imagePreviews.featured_image_new }}
          style={styles.imagePreview}
        />
      )}
    </View>

    {Array.from({ length: 3 }).map((_, index) => (
      <View style={styles.card} key={index}>
        <Text style={styles.label}>{`Additional Image ${index + 1}`}</Text>
        
        {imagePreviews.project_images[index] && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: imagePreviews.project_images[index] }}
              style={styles.imagePreview}
            />
            <Text>Current File: {imagePreviews.project_images[index].split('/').pop()}</Text>
            <Button title="Clear" onPress={() => clearImage('additional_image', index)} />
          </View>
        )}

        <Button title={`Choose new additional image ${index + 1}`} onPress={() => handleSelectImage(`additional_image_${index}`)} />

        {imagePreviews.project_images_new[index] && (
          <Image
            source={{ uri: imagePreviews.project_images_new[index] }}
            style={styles.imagePreview}
          />
        )}
              </View>

    ))}

   {/* Brand */}
   <View style={styles.formGroup}>
      <Text style={styles.label}>Brand</Text>
      <TextInput
        style={styles.input}
        placeholder="Brand name"
        value={projectData.brand}
        onChangeText={(text) => handleChangeText('brand', text)}
      />
    </View>

    {/* Deal Link */}
    <View style={styles.formGroup}>
      <Text style={styles.label}>Deal Link</Text>
      <TextInput
        style={styles.input}
        placeholder="http://example.com/deal"
        value={projectData.deal_link}
        onChangeText={(text) => handleChangeText('deal_link', text)}
      />
    </View>

    {/* Price */}
    <View style={styles.formGroup}>
      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        placeholder="Price in USD"
        keyboardType="numeric"
        value={projectData.price.toString()}
        onChangeText={(text) => handleChangeText('price', text)}
      />
    </View>

    {/* Tags Section */}
    <View style={styles.formGroup}>
      <Text style={styles.label}>Available Tags</Text>
      <View style={styles.tagContainer}>
        {tags.slice(0, visibleTagCount).map(tag => (
          <TouchableOpacity
            key={tag.id}
            onPress={() => handleToggleTagToProject(tag.id)}
            style={selectedTags.includes(tag.id) ? styles.tagButtonSelected : styles.tagButton}
          >
            <Text>{tag.name} {selectedTags.includes(tag.id) ? '-' : '+'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Load More / Load Less Buttons */}
      <View style={styles.loadButtons}>
        <Button title="Load More" onPress={loadMoreTags} disabled={visibleTagCount >= tags.length} />
        <Button title="Load Less" onPress={loadLessTags} disabled={visibleTagCount <= 10} />
      </View>
    </View>

    {/* Selected Tags Display */}
    <View style={styles.formGroup}>
      <Text style={styles.label}>Selected Tags</Text>
      <View style={styles.tagContainer}>
        {selectedTags.map(tagId => {
          const tag = tags.find(t => t.id === tagId);
          return tag ? (
            <TouchableOpacity
              key={tag.id}
              onPress={() => handleToggleTagToProject(tag.id)}
              style={styles.tagButtonDeselected}
            >
              <Text>{tag.name}</Text>
            </TouchableOpacity>
          ) : null;
        })}
      </View>
    </View>

    {/* Add New Tag */}
    <View style={styles.formGroup}>
      <Text style={styles.label}>Add New Tag</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter tag name"
        value={projectData.newTag}
        onChangeText={(text) => setProjectData({ ...projectData, newTag: text })}
      />
      <Button title="Add Tag" onPress={handleAddTag} />
    </View>

    {/* Submit Button */}
    <Button title="Edit Project" onPress={handleSubmit} />


    </ScrollView>
);
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  card: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePreview: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
});

export default EditProject;