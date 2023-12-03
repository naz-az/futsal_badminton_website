import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Swiper from "react-native-deck-swiper"; // Import Swiper


const processImageUrl = (imageUrl) => {
  if (
    imageUrl &&
    !imageUrl.startsWith("http://") &&
    !imageUrl.startsWith("https://")
  ) {
    return `http://127.0.0.1:8000${imageUrl}`;
  }
  return imageUrl;
};

function SwipePage() {
  const [projects, setProjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);





  const isAuthenticated = async () => {
    const token = await AsyncStorage.getItem("token");
    return token != null;
  };

  const redirectToLogin = () => {
    // Handle navigation to login (You might use React Navigation or similar)
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/projects/random/")
      .then((response) => response.json())
      .then((data) => setProjects(data));
  }, []);

  const currentProject = projects[currentIndex] || {};

  const handleDislike = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    setShowModal(false);
  };

  const handleLike = () => {
    setShowModal(true);
  };

  useEffect(() => {
    async function checkFavoriteStatus() {
      if (await isAuthenticated()) {
        const currentProjectId = currentProject.id;
        if (currentProjectId) {
          try {
            const response = await axios.get(
              `http://127.0.0.1:8000/api/favorites/is-favorite/${currentProjectId}/`,
              {
                headers: {
                  Authorization: `Bearer ${await AsyncStorage.getItem(
                    "token"
                  )}`,
                },
              }
            );
            setIsFavorited(response.data.isFavorited);
          } catch (error) {
            console.error("Error checking favorite status:", error);
          }
        }
      } else {
        setIsFavorited(false);
      }
    }
    checkFavoriteStatus();
  }, [currentProject]);

  const handleAddFavorite = async () => {
    if (!(await isAuthenticated())) {
      redirectToLogin();
      return;
    }
    const currentProjectId = currentProject.id;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
        },
      };
      await axios.post(
        `http://127.0.0.1:8000/api/favorites/add/${currentProjectId}/`,
        {},
        config
      );
      setIsFavorited(true);
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const handleRemoveFavorite = async () => {
    if (!(await isAuthenticated())) {
      redirectToLogin();
      return;
    }
    const currentProjectId = currentProject.id;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
        },
      };
      await axios.delete(
        `http://127.0.0.1:8000/api/favorites/remove/${currentProjectId}/`,
        config
      );
      setIsFavorited(false);
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const confirmRemoveFavorite = () => {
    Alert.alert(
      "Remove Favorite",
      "Are you sure you want to remove this item from your favorites?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => handleRemoveFavorite() },
      ]
    );
  };

  // Replace dragging with swiping
  const renderLeftActions = () => {
    return (
      <TouchableOpacity
        onPress={handleLike}
        style={{
          backgroundColor: "green",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: "white" }}>Like</Text>
      </TouchableOpacity>
    );
  };

  const renderRightActions = () => {
    return (
      <TouchableOpacity
        onPress={handleDislike}
        style={{
          backgroundColor: "red",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: "white" }}>Dislike</Text>
      </TouchableOpacity>
    );
  };

  const onSwipedLeft = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    setShowModal(false);
  };

  const onSwipedRight = () => {
    setShowModal(true);
  };

  const formatMomentDate = (dateString) => {
    return dateString 
      ? moment.utc(dateString).format("DD/MM/YY, (ddd), hh:mm A") + " UTC+8" 
      : "N/A";
  };
  
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Swiper
        cards={projects}
        renderCard={(card) => {
          return (
            <View
              style={{
                flex: 1,
                borderRadius: 10,
                shadowRadius: 25,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowOffset: { width: 0, height: 0 },
                justifyContent: "center",
                backgroundColor: "white",
              }}
            >
              <Image
                source={{ uri: processImageUrl(currentProject.featured_image) }}
                style={{
                  width: "100%",
                  height: "40%",
                  borderRadius: 10,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              />
              <View style={{ padding: 20 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    marginBottom: 10,
                  }}
                >
                  {currentProject.title}
                </Text>
                <Text style={{ fontSize: 16 }}>
                  {currentProject.description}
                </Text>

                <View style={styles.card}>
        {currentProject.owner && (
          <Image
            source={{ uri: processImageUrl(currentProject.owner.profile_image) }}
            style={styles.profileImage}
          />
        )}
        <Text style={styles.ownerName}>
          {currentProject.owner && currentProject.owner.name ? currentProject.owner.name : ''}
        </Text>

        <Text style={styles.upvotes}>
          <Text style={styles.thumbsUpIcon}>👍</Text> {currentProject.upvotes}
        </Text>

        <Text style={styles.price}>RM {currentProject.price}</Text>

        <View style={styles.tagsContainer}>
          {currentProject.tags && currentProject.tags.map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tagButton}>
              <Text style={styles.tagText}>{tag.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.brand}>
          {currentProject.brand}
        </Text>
      </View>


              </View>
            </View>
          );
        }}
        onSwipedLeft={onSwipedLeft}
        onSwipedRight={onSwipedRight}
        backgroundColor={"transparent"}
        cardIndex={currentIndex}
        stackSize={3} // Number of cards to show in background
      />

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={{ marginTop: 22 }}>
          <View
            style={{
              margin: 20,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 35,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Text style={{ marginBottom: 15, textAlign: "center" }}>
              {isFavorited ? "Remove from Favourites?" : "Add to Favourites?"}
            </Text>
            <Button
              title={
                isFavorited ? "Remove from Favourites" : "Add to Favourites"
              }
              onPress={isFavorited ? confirmRemoveFavorite : handleAddFavorite}
            />
            <Button title="Cancel" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 10,
    margin: 10,
    elevation: 3,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 50,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  upvotes: {
    fontSize: 22,
    color: '#28a745',
    fontWeight: 'bold',
  },
  thumbsUpIcon: {
    fontSize: 20,
    color: '#28a745',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tagButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#495057',
  },
  brand: {
    fontSize: 16,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  likeButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
  dislikeButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    color: '#343a40',
  },
  modalButton: {
    width: '80%',
    padding: 10,
    borderRadius: 10,
  },
});


export default SwipePage;
