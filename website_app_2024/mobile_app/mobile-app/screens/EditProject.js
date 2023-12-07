import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';


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
    location: "",
    start_date: "",
    end_date: "",
    
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

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
const [showEndDatePicker, setShowEndDatePicker] = useState(false);


  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Create a new Date object using the date string
    const date = new Date(dateString);
    // Convert to local time string and remove seconds and milliseconds
    let localDateTime = date.toISOString().slice(0, 16);
    return localDateTime;
  };

  
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || projectData.start_date;
    setShowStartDatePicker(Platform.OS === 'android');
    setProjectData({ ...projectData, start_date: currentDate.toISOString() });
  };
  
  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || projectData.end_date;
    setShowEndDatePicker(Platform.OS === 'android');
    setProjectData({ ...projectData, end_date: currentDate.toISOString() });
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
        console.log("Fetched project data:", project);

        // Format start_date and end_date to YYYY-MM-DD format
// Inside fetchProjectDetails function
const formattedStartDate = project.start_date ? new Date(project.start_date).toISOString() : '';
const formattedEndDate = project.end_date ? new Date(project.end_date).toISOString() : '';

      // Format start_date and end_date based on the platform
      const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Platform.OS === 'web') {
          // Format for web input type="date"
          return date.toISOString().split('T')[0];
        } else {
          // Full date-time format for native platforms
          return date.toISOString();
        }
      };

      setProjectData({
        ...project,
        start_date: formatDateForInput(project.start_date),
        end_date: formatDateForInput(project.end_date),
      });

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

// Update handleChangeText function to handle price input
const handleChangeText = (name, value) => {
  if (name === 'price') {
    // Remove non-numeric characters before setting the price
    const numericValue = value.replace(/[^0-9.]/g, '');
    setProjectData(prevState => ({ ...prevState, [name]: numericValue }));
  } else {
    setProjectData(prevState => ({ ...prevState, [name]: value }));
  }
};
  
  const handleSelectImage = (name) => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        // const source = { uri: response.assets[0].uri };
        // console.log('Selected image: ', source);
  
        const source = response.assets[0];  // store the entire asset
        console.log('Selected image details:', source);

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
  
    // Append non-image and non-tag data
    Object.keys(projectData).forEach(key => {
      if (!['project_images', 'featured_image', 'tags'].includes(key)) {
        formData.append(key, projectData[key]);
      }
    });
  
    // Append tags
    selectedTags.forEach(tagId => formData.append("tags", tagId));
  
    // Process and append images
    try {
      if (projectData.featured_image && projectData.featured_image.uri) {
        const featuredImageBlob = await fetch(projectData.featured_image.uri).then(r => r.blob());
        formData.append('featured_image', featuredImageBlob, projectData.featured_image.fileName || 'featured_image.jpg');
      }
  
      await Promise.all(projectData.project_images.map(async (image, index) => {
        if (image && image.uri) {
          const imageBlob = await fetch(image.uri).then(r => r.blob());
          formData.append(`additional_image_${index}`, imageBlob, image.fileName || `image_${index}.jpg`);
        }
      }));
  
      const token = await AsyncStorage.getItem("token");
      await axios.put(`http://127.0.0.1:8000/api/update-project/${projectId}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      navigation.navigate("Home");
    } catch (error) {
      console.error('Error:', error);
      setServerError(error.message || "An unexpected error occurred.");
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


    // Update the tag button styles to match AddProject
    const tagButtonStyle = {
      padding: 10,
      margin: 5,
      borderWidth: 1,
      borderColor: 'gray', // Default color
    };
  
    const tagButtonSelectedStyle = {
      ...tagButtonStyle,
      borderColor: 'blue', // Color for selected tags
    };

    const tagButtonDeselectedStyle = {
      ...tagButtonStyle,
      borderColor: 'red', // Color for deselected tags
    };

  return (
    <ScrollView style={styles.container}>
                      <Text style={styles.title}>Edit Event</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter event title"
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

   {/* Brand
   <View style={styles.formGroup}>
      <Text style={styles.label}>Brand</Text>
      <TextInput
        style={styles.input}
        placeholder="Brand name"
        value={projectData.brand}
        onChangeText={(text) => handleChangeText('brand', text)}
      />
    </View> */}



  {/* Location Input */}
  <View style={styles.formGroup}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location"
          value={projectData.location}
          onChangeText={(text) => handleChangeText('location', text)}
        />
      </View>

{/* Start Date Picker */}
<Text style={styles.label}>Start Date & Time</Text>
{Platform.OS === 'web' ? (
  <input
    type="datetime-local"
    value={projectData.start_date}
    onChange={(e) => setProjectData({ ...projectData, start_date: e.target.value })}
  />
) : (
  <View>
    <Button onPress={() => setShowStartDatePicker(true)} title="Select Start Date" />
    {showStartDatePicker && (
      <DateTimePicker
        value={new Date(projectData.start_date) || new Date()}
        mode="datetime"
        display="default"
        onChange={onStartDateChange}
      />
    )}
  </View>
)}

{/* End Date Picker */}
<Text style={styles.label}>End Date & Time</Text>
{Platform.OS === 'web' ? (
  <input
    type="datetime-local"
    value={projectData.end_date}  // Convert to local time format
    onChange={(e) => setProjectData({ ...projectData, end_date: e.target.value})}  // Add 'Z' back when setting state
  />
) : (
  <View>
    <Button onPress={() => setShowEndDatePicker(true)} title="Select End Date" />
    {showEndDatePicker && (
      <DateTimePicker
        value={new Date(projectData.end_date) || new Date()}
        mode="datetime"
        display="default"
        onChange={onEndDateChange}
      />
    )}
  </View>
)}










    {/* Deal Link */}
    <View style={styles.formGroup}>
      <Text style={styles.label}>Event Link</Text>
      <TextInput
        style={styles.input}
        placeholder="http://example.com/event"
        value={projectData.deal_link}
        onChangeText={(text) => handleChangeText('deal_link', text)}
      />
    </View>

    {/* Price */}
    <View style={styles.formGroup}>
      <Text style={styles.label}>Price</Text>
      <TextInput
  style={styles.input}
  placeholder="Price in RM"
  keyboardType="numeric"
  value={`RM ${projectData.price.toString()}`}
  onChangeText={(text) => handleChangeText('price', text.replace(/^RM\s*/, ''))}
/>

    </View>

    {/* Available Categories Section */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Available Categories</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {tags.slice(0, visibleTagCount).map(tag => (
            <TouchableOpacity 
              key={tag.id} 
              onPress={() => handleToggleTagToProject(tag.id)} 
              style={selectedTags.includes(tag.id) ? tagButtonSelectedStyle : tagButtonStyle}>
              <Text>{tag.name} {selectedTags.includes(tag.id) ? "-" : "+"}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Load More / Load Less Buttons */}
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Button 
            onPress={loadMoreTags} 
            disabled={visibleTagCount >= tags.length}
            title="More Categories"
          />
          <Button 
            onPress={loadLessTags} 
            disabled={visibleTagCount <= 10}
            title="Less Categories"
          />
        </View>
      </View>

      {/* Selected Categories Display */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Selected Categories</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {selectedTags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag ? (
              <TouchableOpacity 
                key={tag.id} 
                onPress={() => handleToggleTagToProject(tag.id)} 
                style={tagButtonDeselectedStyle}>
                <Text>{tag.name} -</Text>
              </TouchableOpacity>
            ) : null;
          })}
        </View>
      </View>

    {/* Add New Category */}
      <Text style={styles.label}>Add New Category</Text>

      <View style={[styles.formGroup, styles.categoryFormGroup]}>
  <TextInput
    style={[styles.input, styles.categoryInput]}
    placeholder="Enter category name"
    value={projectData.newTag}
    onChangeText={(text) => setProjectData({ ...projectData, newTag: text })}
  />
  <View style={styles.categoryButtonContainer}>
    <Button title="Add" onPress={handleAddTag} />
  </View>
</View>


    {/* Submit Button */}
    <Button title="Edit Event" onPress={handleSubmit} />


    </ScrollView>
);
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,         // No padding at the top
    paddingBottom: 20,     // 20 pixels padding for the bottom
    paddingLeft: 20,       // 20 pixels padding for the left
    paddingRight: 20,      // 20 pixels padding for the right
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    fontSize: 14,
    width: '100%',
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
    // Additional styles for category form group
    categoryFormGroup: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoryInput: {
      width: '80%',
      marginRight: '1%', // Optional, for spacing between input and button
      marginBottom: 0, // Remove default margin-bottom
    },
    categoryButtonContainer: {
      width: '19%', // Adjust as needed
      // Reset any default padding or margin if necessary
      margin: 0,
      padding: 0,
    },
    title: {
      fontWeight: 'bold',
      fontSize: 24,
      textAlign: 'center',
      margin: 20,    
      color: '#333333', // Darker color for better readability
    },
});

export default EditProject;