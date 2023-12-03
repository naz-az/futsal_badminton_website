import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { View, Text, TextInput, Button, ScrollView, Image, StyleSheet, TouchableOpacity, Modal,Platform  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker'; // For selecting images
import CustomButton from '../components/CustomButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

import Icon from 'react-native-vector-icons/FontAwesome'; // Ensure you have this package installed

const AddProject = () => {
    const [projectData, setProjectData] = useState({
        title: '',
        featured_image: null,
        additional_images: Array(3).fill(null),
        description: '',
        brand: '',
        deal_link: '',
        price: '',
        tags: [],
        newTag: '',
        location: '',         // New state variable for location
        start_date: '',  // New state variable for start date
        end_date: '',    // New state variable for end date
        
    });

    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [serverError, setServerError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
const [showEndDatePicker, setShowEndDatePicker] = useState(false);

const navigation = useNavigation();

// const onStartDateChange = (event, selectedDate) => {
//     const currentDate = selectedDate || projectData.start_date;
//     setShowStartDatePicker(false);
//     setProjectData({ ...projectData, start_date: currentDate });
// };

// const onEndDateChange = (event, selectedDate) => {
//     const currentDate = selectedDate || projectData.end_date;
//     setShowEndDatePicker(false);
//     setProjectData({ ...projectData, end_date: currentDate });
// };

    // DateTimePicker for native platforms
    const renderNativeDatePicker = (date, onChange) => (
        <DateTimePicker
            testID="dateTimePicker"
            value={new Date(date) || new Date()}
            mode="datetime"
            is24Hour={true}
            display="default"
            onChange={onChange}
        />
    );

    // HTML input for web
    const renderWebDatePicker = (name, value, onChange) => (
        <input
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={styles.datePickerInput} // Apply the specific style here
            />
    );


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

    const [imagePreviews, setImagePreviews] = useState({
        featured_image: null,
        additional_images: Array(3).fill(null),
    });

        // Add state for controlling the number of visible tags
        const [visibleTagCount, setVisibleTagCount] = useState(10); // Initially show 10 tags

            // Function to show more tags
    const loadMoreTags = () => {
        setVisibleTagCount(prevCount => Math.min(prevCount + 10, tags.length));
    };

    // Function to show fewer tags
    const loadLessTags = () => {
        setVisibleTagCount(prevCount => Math.max(prevCount - 10, 10));
    };

    useEffect(() => {
        // Fetch tags
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

    // Image URL processing
    const processImageUrl = (imageUrl) => {
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            return `http://127.0.0.1:8000${imageUrl}`;
        }
        return imageUrl;
    };

    // handleChange modified for React Native
    const handleChange = (name, value) => {
        setProjectData({ ...projectData, [name]: value });
    };

    const selectImage = (name) => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.assets && response.assets.length > 0) {
                const source = response.assets[0]; // Store the entire asset
                console.log(`New Image State for ${name}:`, source); // Add this line

                if (name === 'featured_image') {
                    setProjectData({ ...projectData, featured_image: source });
                    setImagePreviews({ ...imagePreviews, featured_image: source.uri });
                } else {
                    const index = parseInt(name.split('_')[2], 10);
                    let newAdditionalImages = [...projectData.additional_images];
                    newAdditionalImages[index] = source;
                    setProjectData({ ...projectData, additional_images: newAdditionalImages });
    
                    let newImagePreviews = [...imagePreviews.additional_images];
                    newImagePreviews[index] = source.uri;
                    setImagePreviews({ ...imagePreviews, additional_images: newImagePreviews });
                }
            }
        });
    };
    
    

    // Toggle tag addition/removal to/from project
    const handleToggleTagToProject = (tagId) => {
        if (isValidUUID(tagId)) {
            if (selectedTags.includes(tagId)) {
                setSelectedTags(selectedTags.filter(id => id !== tagId));
            } else {
                setSelectedTags([...selectedTags, tagId]);
            }
        } else {
            console.error("Invalid UUID: ", tagId);
        }
    };

    // Validate UUID
const isValidUUID = (uuid) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
};

// Handle tag addition to project
const handleAddTagToProject = (tagId) => {
    if (isValidUUID(tagId)) {
        setSelectedTags([...selectedTags, tagId]);
    } else {
        console.error("Invalid UUID: ", tagId);
    }
};

// Handle removal of tag from project
const handleRemoveTagFromProject = (tagId) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId && isValidUUID(id)));
};

const handleAddTag = async () => {
    const newTagName = projectData.newTag.trim().toLowerCase();
    if (newTagName !== '') {
        const existingTag = tags.find(tag => tag.name.toLowerCase() === newTagName);
        if (existingTag) {
            if (!selectedTags.includes(existingTag.id)) {
                setSelectedTags([...selectedTags, existingTag.id]);
            }
        } else {
            try {
                const response = await axios.post('http://127.0.0.1:8000/api/add-tag/', { name: newTagName });
                const newTag = response.data;
                setTags([...tags, newTag]);
                setSelectedTags([...selectedTags, newTag.id]);
            } catch (error) {
                console.error("Error adding tag", error);
            }
        }
        setProjectData({ ...projectData, newTag: '' });
    }
};

    // clearImage function modified to update imagePreviews
    const clearImage = (imageType) => {
        setProjectData({ ...projectData, [imageType]: null });
        if (imageType === 'featured_image') {
            setImagePreviews({ ...imagePreviews, featured_image: null });
        } else {
            const index = parseInt(imageType.split('_')[2], 10);
            const updatedAdditionalImages = [...imagePreviews.additional_images];
            updatedAdditionalImages[index] = null;
            setImagePreviews({ ...imagePreviews, additional_images: updatedAdditionalImages });
        }
    };

// const handleSubmit = async () => {
//     let formData = new FormData();
//     // Assuming the images are of type 'uri'
//     if (projectData.featured_image) {
//         formData.append('featured_image', {
//             uri: projectData.featured_image.uri,
//             type: 'image/jpeg', // assuming jpeg, this may need to be dynamic based on the image
//             name: 'featured_image.jpg'
//         });
//     }

//     projectData.additional_images.forEach((image, index) => {
//         if (image) {
//             formData.append(`additional_images_${index}`, {
//                 uri: image.uri,
//                 type: 'image/jpeg',
//                 name: `additional_image_${index}.jpg`
//             });
//         }
//     });

//     // Append other data
//     for (let key in projectData) {
//         if (key !== 'featured_image' && key !== 'additional_images' && key !== 'tags') {
//             formData.append(key, projectData[key]);
//         }
//     }

//     selectedTags.filter(isValidUUID).forEach(tagId => {
//         formData.append('tags', tagId);
//     });

//     try {
//         const token = await AsyncStorage.getItem('token');
//         const response = await axios.post('http://127.0.0.1:8000/api/create-project/', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//                 'Authorization': `Bearer ${token}`,
//             },
//         });
//         console.log(response.data);
//         setShowSuccessModal(true);
//         setTimeout(() => {
//             setShowSuccessModal(false); // Hide modal after a delay
//             // Redirect to home page
//             // Note: React Native doesn't use navigate from 'react-router-dom'.
//             // You'll need to implement navigation differently, depending on your navigation setup.
//         }, 1500);
//     } catch (error) {
//         if (error.response && error.response.data) {
//             setServerError(Object.values(error.response.data).join(' '));
//         } else {
//             setServerError("An unexpected error occurred.");
//         }
//     }
// };

const handleSubmit = async () => {
    console.log("Project Data before submission:", projectData);

    let formData = new FormData();

    // Append non-image data
    Object.keys(projectData).forEach(key => {
        if (key !== 'featured_image' && key !== 'additional_images') {
            formData.append(key, projectData[key]);
        }
    });

    // Append featured image
    if (projectData.featured_image && projectData.featured_image.uri) {
        const blob = await fetch(projectData.featured_image.uri).then(r => r.blob());
        formData.append('featured_image', blob, 'featured_image.jpg'); // Ensure filename is provided
    }

    // Append additional images

await Promise.all(projectData.additional_images.map(async (image, index) => {
    if (image && image.uri) {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        formData.append(`additional_images_${index}`, blob, `additional_image_${index}.jpg`);
    }
}));



    // Append tags
    selectedTags.forEach(tagId => {
        formData.append('tags', tagId);
    });

    try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.post('http://127.0.0.1:8000/api/create-project/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log("Response Data:", response.data);
                navigation.navigate('Home'); // Replace 'Home' with your actual home screen route name

        // Handle successful submission
    } catch (error) {
        console.error("Error:", error);
        // Handle errors
        setServerError("An unexpected error occurred.");
    }
};


return (
    <ScrollView style={{ backgroundColor: '#ffffff' }}>
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            {/* Success Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showSuccessModal}
                onRequestClose={() => {
                    setShowSuccessModal(!showSuccessModal);
                }}>
                <View style={{ margin: 20, backgroundColor: "white", borderRadius: 20, padding: 35, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
                    <Text style={{ marginBottom: 15, textAlign: "center" }}>Success</Text>
                    <Text>Project added successfully!</Text>
                    <TouchableOpacity
                        style={{ backgroundColor: "#2196F3", padding: 10, elevation: 2 }}
                        onPress={() => setShowSuccessModal(!showSuccessModal)}>
                        <Text style={{ color: "white", textAlign: "center" }}>Hide Modal</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Error Alert */}
            {serverError && (
                <View style={{ backgroundColor: 'red', padding: 10 }}>
                    <Text style={{ color: 'white' }}>{serverError}</Text>
                </View>
            )}

            {/* Title Input */}
                {/* Title Input */}
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={(text) => handleChange('title', text)}
                    value={projectData.title}
                    placeholder="Enter event title"
                />

                {/* Description Input */}
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                    style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
                    onChangeText={(text) => handleChange('description', text)}
                    value={projectData.description}
                    placeholder="Enter event description"
                    multiline={true}
                    numberOfLines={4}
                />




            {/* Other form fields go here */}
 {/* Featured Image Input */}
 <Text>Featured Image</Text>
        {imagePreviews.featured_image && (
            <View>
                <Image
                    source={{ uri: imagePreviews.featured_image }}
                    style={{ width: 300, height: 300, resizeMode: 'cover' }}
                />
                <Button title="Clear" onPress={() => clearImage('featured_image')} />
            </View>
        )}
        <Button title="Select Featured Image" onPress={() => selectImage('featured_image')} />

        {/* Additional Image Inputs */}
        {Array.from({ length: 3 }).map((_, index) => (
            <View key={index}>
                <Text>{`Additional Image ${index + 1}`}</Text>
                {imagePreviews.additional_images[index] && (
                    <View>
                        <Image
                            source={{ uri: imagePreviews.additional_images[index] }}
                            style={{ width: 300, height: 300, resizeMode: 'cover' }}
                        />
                        <Button title="Clear" onPress={() => clearImage(`additional_image_${index}`)} />
                    </View>
                )}
                <Button title={`Select Additional Image ${index + 1}`} onPress={() => selectImage(`additional_image_${index}`)} />
            </View>
        ))}



                {/* Location Input */}
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={(text) => handleChange('location', text)}
                    value={projectData.location}
                    placeholder="Enter event location"
                />


                {/* Start Date Picker */}
                <Text style={styles.inputLabel}>Start Date & Time</Text>
                {Platform.OS === 'web' ? (
      
              renderWebDatePicker('start_date', projectData.start_date, (val) => setProjectData({ ...projectData, start_date: val }))
                ) : (
                    <View>
                        <Button onPress={() => setShowStartDatePicker(true)} title="Select Start Date" />
                        {showStartDatePicker && renderNativeDatePicker(projectData.start_date, onStartDateChange)}
                    </View>
                )}

                {/* End Date Picker */}
                <Text style={styles.inputLabel}>End Date & Time</Text>
                {Platform.OS === 'web' ? (
                    renderWebDatePicker('end_date', projectData.end_date, (val) => setProjectData({ ...projectData, end_date: val }))
                ) : (
                    <View>
                        <Button onPress={() => setShowEndDatePicker(true)} title="Select End Date" />
                        {showEndDatePicker && renderNativeDatePicker(projectData.end_date, onEndDateChange)}
                    </View>
                )}
{/* Start Date Picker */}
{/* <View>
    <Button onPress={() => setShowStartDatePicker(true)} title="Select Start Date" />
    {showStartDatePicker && (
        <DateTimePicker
            testID="dateTimePicker"
            value={new Date(projectData.start_date) || new Date()}
            mode="datetime"
            is24Hour={true}
            display="default"
            onChange={onStartDateChange}
        />
    )}
</View> */}

{/* End Date Picker */}
{/* <View>
    <Button onPress={() => setShowEndDatePicker(true)} title="Select End Date" />
    {showEndDatePicker && (
        <DateTimePicker
            testID="dateTimePicker"
            value={new Date(projectData.end_date) || new Date()}
            mode="datetime"
            is24Hour={true}
            display="default"
            onChange={onEndDateChange}
        />
    )}
</View> */}


<Text style={styles.inputLabel}>Event Link</Text>
    <TextInput
        style={styles.textInput}
        placeholder="http://example.com/event"
        onChangeText={(text) => handleChange('deal_link', text)}
        value={projectData.deal_link}
    />

<Text style={styles.inputLabel}>Price</Text>
    <TextInput
        style={styles.textInput}
        placeholder="Price in Ringgit (RM)"
        onChangeText={(text) => handleChange('price', text)}
        value={projectData.price}
        keyboardType="numeric"
    />

                {/* Available Categories Section */}
                <Text>Available Categories</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {tags.slice(0, visibleTagCount).map(tag => (
                        <TouchableOpacity 
                            key={tag.id} 
                            onPress={() => handleToggleTagToProject(tag.id)} 
                            style={{ padding: 10, margin: 5, borderWidth: 1, borderColor: selectedTags.includes(tag.id) ? 'blue' : 'gray' }}>
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

                {/* Selected Categories Display */}
                <Text>Selected Categories</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {selectedTags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                            <TouchableOpacity 
                                key={tag.id} 
                                onPress={() => handleRemoveTagFromProject(tag.id)} 
                                style={{ padding: 10, margin: 5, borderWidth: 1, borderColor: 'red' }}>
                                <Text>{tag.name} -</Text>
                            </TouchableOpacity>
                        ) : null;
                    })}
                </View>

    {/* Add New Category */}
    <Text style={styles.label}>Add New Category</Text>

    <View style={[styles.formGroup, styles.categoryFormGroup]}>
        <TextInput 
            style={[styles.input, styles.categoryInput]}
            placeholder="Enter category name"
            value={projectData.newTag}
            onChangeText={(text) => handleChange('newTag', text)}
        />
        <View style={styles.categoryButtonContainer}>
            <Button title="Add" onPress={handleAddTag} />
        </View>
    </View>

        {/* Submit Button */}
        <CustomButton title="Add Event" onPress={handleSubmit} color="#2196F3" />




        </View>
    </ScrollView>
);
};


const styles = StyleSheet.create({
    inputLabel: {
        // Styles for the input labels
        fontSize: 12,
        color: '#000',
        marginBottom: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    },
    textInput: {
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
    datePickerInput: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 5,
        paddingTop: 10,
        paddingBottom: 10,

        // marginTop:20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
        fontSize: 14,
        width: '100%',
    },
    inputIcon: {
        // Styles for the icons
    },
    categoryFormGroup: {
        flexDirection: 'row',
        justifyContent: 'flex-start', // Align items to the start
        alignItems: 'center',
        width: '100%', // Make sure the container takes full width
    },
    categoryInput: {
        flex: 1, // Allows the input to expand and fill the space
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 5,
        padding: 10,
        marginRight: 10, // Adjust as needed for spacing between input and button
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    categoryButtonContainer: {
        width: '19%',
        margin: 0,
        padding: 0,
    },

});

export default AddProject;