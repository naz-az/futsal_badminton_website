import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { View, Text, TextInput, Button, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker'; // For selecting images

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
    });

    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [serverError, setServerError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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

    // Modified selectImage function
    const selectImage = (name) => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            console.log('Image Picker Response: ', response); // Log the full response
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.assets && response.assets.length > 0) {
                const source = { uri: response.assets[0].uri }; // Updated line
                setProjectData({ ...projectData, [name]: source });

                if (name === 'featured_image') {
                    setImagePreviews({ ...imagePreviews, featured_image: response.assets[0].uri });
                } else {
                    const updatedAdditionalImages = [...imagePreviews.additional_images];
                    const index = parseInt(name.split('_')[2], 10);
                    updatedAdditionalImages[index] = response.assets[0].uri;
                    setImagePreviews({ ...imagePreviews, additional_images: updatedAdditionalImages });
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

const handleSubmit = async () => {
    let formData = new FormData();
    // Assuming the images are of type 'uri'
    if (projectData.featured_image) {
        formData.append('featured_image', {
            uri: projectData.featured_image.uri,
            type: 'image/jpeg', // assuming jpeg, this may need to be dynamic based on the image
            name: 'featured_image.jpg'
        });
    }

    projectData.additional_images.forEach((image, index) => {
        if (image) {
            formData.append(`additional_images_${index}`, {
                uri: image.uri,
                type: 'image/jpeg',
                name: `additional_image_${index}.jpg`
            });
        }
    });

    // Append other data
    for (let key in projectData) {
        if (key !== 'featured_image' && key !== 'additional_images' && key !== 'tags') {
            formData.append(key, projectData[key]);
        }
    }

    selectedTags.filter(isValidUUID).forEach(tagId => {
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
        console.log(response.data);
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false); // Hide modal after a delay
            // Redirect to home page
            // Note: React Native doesn't use navigate from 'react-router-dom'.
            // You'll need to implement navigation differently, depending on your navigation setup.
        }, 1500);
    } catch (error) {
        if (error.response && error.response.data) {
            setServerError(Object.values(error.response.data).join(' '));
        } else {
            setServerError("An unexpected error occurred.");
        }
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
            <Text>Title</Text>

            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, width: '100%' }}
                onChangeText={(text) => handleChange('title', text)}
                value={projectData.title}
                placeholder="Enter deal title"
            />

            {/* Description Input */}
            <Text>Description</Text>

            <TextInput
                style={{ height: 100, borderColor: 'gray', borderWidth: 1, marginBottom: 10, width: '100%', textAlignVertical: 'top' }}
                onChangeText={(text) => handleChange('description', text)}
                value={projectData.description}
                placeholder="Enter description"
                multiline={true}
                numberOfLines={4}
            />

            {/* Submit Button */}
            <Button
                title="Submit"
                onPress={handleSubmit}
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

        {/* Brand Input */}
        <Text>Brand</Text>

        <TextInput
            placeholder="Brand name"
            onChangeText={(text) => handleChange('brand', text)}
            value={projectData.brand}
        />

        {/* Deal Link Input */}
        <Text>Deal Link</Text>

        <TextInput
            placeholder="http://example.com/deal"
            onChangeText={(text) => handleChange('deal_link', text)}
            value={projectData.deal_link}
        />

        {/* Price Input */}
        <Text>Price</Text>

        <TextInput
            placeholder="Price in Ringgit (RM)"
            onChangeText={(text) => handleChange('price', text)}
            value={projectData.price}
            keyboardType="numeric"
        />


        <Text>Available Tags</Text>
        <View>
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
                title="More Tags"
            />
            <Button 
                onPress={loadLessTags} 
                disabled={visibleTagCount <= 10}
                title="Less Tags"
            />
        </View>

        {/* Selected Tags Display */}
        <Text>Selected Tags</Text>
        <View>
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

        {/* Add New Tag */}
        <Text>Add New Tag</Text>
        <View style={{ flexDirection: 'row' }}>
            <TextInput 
                style={{ flex: 1, borderWidth: 1, padding: 10, marginRight: 10 }}
                onChangeText={(text) => handleChange('newTag', text)}
                value={projectData.newTag}
            />
            <Button title="Add Tag" onPress={handleAddTag} />
        </View>

        {/* Submit Button */}
        <Button title="Add Project" onPress={handleSubmit} />




        </View>
    </ScrollView>
);
};

export default AddProject;