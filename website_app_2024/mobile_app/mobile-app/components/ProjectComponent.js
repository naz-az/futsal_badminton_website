import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

// Import custom components
import VotingButtons from "./VotingButtons";
import AuthContext from "../context/authContext";
import AttendButton from "./AttendButton";
import FavoriteButton from "./FavoriteButton";
import CustomButton from "./CustomButton";
import moment from 'moment';

function ProjectComponent({ project, showEditDeleteButtons, onEdit, onDelete, onRemove, onUnbookmark }) {
  const auth = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(false);
  const navigation = useNavigation();
  const [token, setToken] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [showFullLocation, setShowFullLocation] = useState(false);
  const isCurrentUserOwner = auth.user?.profile?.id === project?.owner?.id;

  useEffect(() => {
    const getToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);
    };
    getToken();
  }, []);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (auth.isAuthenticated && token) {
        try {
          const response = await axios.get(
            `http://127.0.0.1:8000/api/favorites/is-favorite/${project.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setIsFavorited(response.data.isFavorited);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      }
    };
    checkFavoriteStatus();
  }, [project.id, auth.isAuthenticated, token]);

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(
          `http://127.0.0.1:8000/api/projects/${project.id}/attendees/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAttendees(response.data);
      } catch (error) {
        console.error("Error fetching attendees:", error);
      }
    };
    fetchAttendees();
  }, [project.id]);

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

  const getShortLocation = (location) => {
    return location.split(" ").slice(0, 4).join(" ") + "...";
  };

  const renderAttendee = ({ item }) => (
    <TouchableOpacity
      style={styles.items}
      onPress={() =>
        navigation.navigate(
          item.attendee.id === auth.user?.profile.id
            ? "UserAccount"
            : "UserProfileDetail",
          { id: item.attendee.id }
        )
      }
    >
      <Image
        source={{ uri: processImageUrl(item.attendee.profile_image) }}
        style={styles.attendimage}
      />
      <Text style={styles.text}>
        {item.attendee.name} (@{item.attendee.username})
      </Text>
    </TouchableOpacity>
  );

    // Adjusted style for the featured image to be 1/4 of its original size
    const featuredImageStyle = {
        width: '28%', // 1/4th width
        height: 110.5, // 1/4th height assuming original height was 250
        resizeMode: 'cover',
        borderRadius: 15,
      };
    
      // New style for the horizontal layout of title and owner details
      const headerStyle = {
        flexDirection: 'row', // Align items in a row
        alignItems: 'center', // Center items vertically
        justifyContent: 'space-between', // Space between items
        // marginBottom: 10, // Margin at the bottom
      };
    
      // Adjusted style for the project title and owner details
      const titleAndOwnerStyle = {
        flex: 1, // Take up remaining space
        marginLeft: 10, // Margin to separate from the image
      };
    
    // Style for the buttons container
    const buttonContainerStyle = {
      flexDirection: 'row',
      justifyContent: 'flex-start', // Align buttons to start
      alignItems: 'center',
      // marginTop: 10,
      // marginBottom: 10,
    };
    
    
    const commonButtonStyle = {
      flex: 1, // Equal flex value for both buttons
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      marginHorizontal: 5, // Add margin to separate buttons
    };
    
    // Style for the AttendButton (if not already defined in AttendButton component)
    const attendButtonStyle = {
      marginRight: 10, // Adjust as needed
      // Other styling for the button
    };
    
    const editProject = (projectId) => {
        navigation.navigate('EditProject', { projectId });
      };
    
      const deleteProject = async (projectId) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
          try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/delete/`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
    
            if (!response.ok) {
              throw new Error("Something went wrong");
            }
    
            setAccountData((prevState) => ({
              ...prevState,
              projects: prevState.projects.filter((project) => project.id !== projectId),
            }));
    
            console.log("Project deleted successfully");
          } catch (error) {
            console.error("Error:", error);
          }
        }
      };

      const formatMomentDate = (dateString) => {
        return dateString ? moment.utc(dateString).format("DD/MM/YY, (ddd), hh:mm A,") + " UTC+8" : "N/A";
    };
    

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("ProjectScreen", { id: project.id })}
      >
        <View style={headerStyle}>
          <Image
            source={{ uri: processImageUrl(project.featured_image) }}
            style={featuredImageStyle}
          />
          <View style={titleAndOwnerStyle}>
            <Text style={styles.title}>{project.title}</Text>
            <Text style={styles.price}>RM {project.price}</Text>
            <Text style={styles.value}>
              {showFullLocation
                ? project.location
                : getShortLocation(project.location)}
            </Text>
            {project.location.split(" ").length > 8 && (
              <TouchableOpacity
                onPress={() => setShowFullLocation(!showFullLocation)}
              >
                <Text style={styles.seeMoreLink}>
                  {showFullLocation ? "See Less" : "See More"}
                </Text>
              </TouchableOpacity>
            )}

            <Text>Attendees ({attendees.length})</Text>
          </View>
        </View>
        {/* New Row for Start and End Dates */}
        <View style={styles.dateRow}>
                <Text style={styles.dateText}>
                    <Text style={styles.boldText}>Start:</Text> {formatMomentDate(project.start_date)}
                    <Text style={styles.marginText}> | </Text>
                    <Text style={styles.boldText}>End:</Text> {formatMomentDate(project.end_date)}
                </Text>
            </View>

      </TouchableOpacity>

      <View style={styles.cardBody}>
        <View style={styles.mainLayout}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Voting Buttons */}
            <VotingButtons projectId={project.id} />
          </View>

          {/* Lower Row */}
          <View style={styles.lowerRow}>
            {project.tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={styles.tagButton}
                onPress={() =>
                  navigation.navigate("Categories", { tag_id: tag.id })
                }
              >
                <Text style={styles.tagText}>{tag.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={buttonContainerStyle}>
          {token && (
            <AttendButton
              projectId={project.id}
              token={token}
            />
          )}

<FavoriteButton 
  projectId={project.id} 
  token={token} 
  onUnbookmark={onUnbookmark} // Add this line
/>
        </View>

        {/* Right Column */}
        <View style={styles.rightColumn}>
          {/* Upper Row */}
          <TouchableOpacity
            style={styles.upperRow}
            onPress={() =>
              navigation.navigate(
                isCurrentUserOwner ? "UserAccount" : "UserProfileDetail",
                { id: project.owner.id }
              )
            }
          >
            <Image
              source={{ uri: processImageUrl(project.owner.profile_image) }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{project.owner.username}</Text>
          </TouchableOpacity>
        </View>

        {showEditDeleteButtons && (
  <View style={styles.actionButtons}>
    <CustomButton
      title="Edit"
      onPress={() => onEdit(project.id)}
      color = 'blue'
      fontSize={12}
    />
    <CustomButton
      title="Delete"
      onPress={() => onDelete(project.id)}
      color = 'red'
      fontSize={12}
    />
  </View>
)}

      {/* Include the Remove button */}
      {onRemove && (
        <CustomButton 
          title="Remove" 
          onPress={() => onRemove(project.id)} 
          color="#9c1d33" 
          fontSize={14} 
        />
      )}


        <View style={styles.separator}></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // margin: 10, // Adjust the margin as needed

    // padding: 100,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: "#333",
  },
  boldText: {
    fontWeight: "bold",
  },
  marginText: {
    marginLeft: 5, // Adjust the margin as per your requirement
    marginRight: 5, // Adjust the margin as per your requirement
  },
  separator: {
    height: 1, // Height of the separator line
    backgroundColor: "#CCCCCC", // Color of the separator line
    marginVertical: 20, // Space above and below the line
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileImage: {
    width: 25,
    height: 25,
    borderRadius: 15,
    marginRight: 10,
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
    borderRadius: 15, // Rounded corners for images
  },
  cardBody: {
    // padding: 15, // Increased padding
  },
  title: {
    fontSize: 16, // Increased font size
    fontWeight: "bold",
  },
  price: {
    fontSize: 14, // Increased font size
    // marginTop: 20,
  },
  dealButton: {
    marginTop: 15,
    backgroundColor: "#28a745", // Updated button color
    padding: 12,
    alignItems: "center",
    borderRadius: 10, // Rounded corners for buttons
  },
  tagsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  tagButton: {
    backgroundColor: "#f2ebe0",
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
    // marginRight: 5,
    // marginBottom: 5,
  },
  tagText: {
    color: "#000000",
    fontSize: 12,
  },
  brand: {
    fontSize: 16,
    marginTop: 10,
  },
  profileContainer: {
    flexDirection: "row", // Aligns children horizontally
    alignItems: "center", // Centers children vertically in the container
    // Add any additional styling like margin or padding as needed
  },

  badge: {
    backgroundColor: "#FF4500", // Badge background color
    borderRadius: 15, // Rounded corners
    paddingVertical: 4, // Vertical padding
    paddingHorizontal: 8, // Horizontal padding
    marginTop: 5, // Space above the badge
    alignSelf: "flex-start", // Align badge to start
  },
  badgeText: {
    color: "white", // Text color
    fontSize: 12, // Font size for the badge text
  },
  item: {
    marginVertical: 8,
    // paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  value: {
    fontSize: 14,
    color: "#333",
  },
  attendimage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  text: {
    color: "#000",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  items: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  // Main layout style for the two-column row
  mainLayout: {
    flexDirection: "row",
    padding: 2,
  },

  // Left Column Styles
  leftColumn: {
    flex: 3, // Adjust for desired width
    marginRight: 10, // Space between columns
  },
  upperRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10, // Space between upper and lower rows
  },
  profileImage: {
    width: 25,
    height: 25,
    borderRadius: 25,
    marginRight: 10,
  },
  profileName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  lowerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },

  // Right Column Styles
  rightColumn: {
    flex: 2, // Adjust for desired width
    // alignItems: 'flex-end', // Align voting buttons to the right
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 10,

  },
  editButton: {
    backgroundColor: "#007bff", // Primary color for buttons
    padding: 10,
    borderRadius: 5,
    flex: 1, // Equal space distribution
    marginRight: 20, // Margin to separate the buttons
  },
  deleteButton: {
    backgroundColor: "tomato", // Change as per your color scheme
    padding: 8,
    borderRadius: 5,
    flex: 1, // Equal space distribution
    marginLeft: 20, // Margin to separate the buttons, adjust as needed
  },
});

export default ProjectComponent;
