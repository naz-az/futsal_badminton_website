import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import CustomButton from "../components/CustomButton";
import ConfirmationModal from "../components/ConfirmationModal";

function FollowersPage() {
  const [followers, setFollowers] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      const token = await AsyncStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        "http://127.0.0.1:8000/api/profiles/followers/",
        config
      );
      setFollowers(response.data);
      setFollowersCount(response.data.length);
    };

    fetchFollowers();
  }, []);

  const removeFollower = async (profileId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post(
        `http://127.0.0.1:8000/api/profiles/${profileId}/remove_follower/`,
        {},
        config
      );
      setFollowers(followers.filter((profile) => profile.id !== profileId));
      setFollowersCount(followersCount - 1);
    } catch (error) {
      console.error("Error removing follower", error);
    }
  };

  // const handleRemoveClick = async (profileId) => {
  //     await removeFollower(profileId);
  // };

  const processImageUrl = (profile) => {
    let profileImageUrl = profile.profile_image;
    if (
      !profileImageUrl.startsWith("http://") &&
      !profileImageUrl.startsWith("https://")
    ) {
      profileImageUrl = `http://127.0.0.1:8000${profileImageUrl}`;
    }
    return profileImageUrl;
  };

  const handleRemoveClick = (profileId) => {
    setSelectedProfileId(profileId);
    setModalVisible(true);
  };

  const handleUnfollowConfirm = async () => {
    if (selectedProfileId !== null) {
      await removeFollower(selectedProfileId);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subtitle}>
        You have {followersCount}{" "}
        {followersCount === 1 ? "follower" : "followers"}
      </Text>
      {followers.map((profile) => (
        <View key={profile.id} style={styles.card}>
          <View style={styles.leftColumn}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UserProfileDetail", { id: profile.id })
              }
            >
              <Image
                source={{ uri: processImageUrl(profile) }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.middleColumn}>
            <Text style={styles.cardTitle}>{profile.name}</Text>
            <Text style={styles.cardText}>
              {profile.short_intro?.slice(0, 60) ?? ""}
            </Text>
          </View>
          <View style={styles.rightColumn}>
            <CustomButton
              title="Remove"
              onPress={() => handleRemoveClick(profile.id)}
              color="#a42339" // Set the color as needed
              textColor="white" // Set the text color as needed
              fontSize={12} // Set the font size as needed
            />
          </View>
        </View>
      ))}

      <ConfirmationModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onConfirm={handleUnfollowConfirm}
        actionType="remove this follower"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    // fontWeight: 'bold',
    textAlign: "center",
    padding: 20,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fcfcff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 12,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "#333361", // Choose a color that fits your app theme
  },
  buttonText: {
    fontSize: 12,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  buttonPressed: {
    opacity: 0.8, // Slight opacity change on press
    transform: [{ scale: 0.96 }], // Slight scale down effect
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  leftColumn: {
    flex: 1,
    // Add any additional styling if needed
  },
  middleColumn: {
    flex: 2,
    // Add any additional styling if needed
  },
  rightColumn: {
    flex: 1,
    // Add any additional styling if needed
  },
});

export default FollowersPage;
