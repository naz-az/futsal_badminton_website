import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Linking, FlatList  } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

// Import custom components (make sure the import paths are correct)
import VotingButtons from "./VotingButtons";
import AuthContext from '../context/authContext';
import AttendButton from "./AttendButton";


function Project({ project }) {
  const auth = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(false);
  const navigation = useNavigation();
  const [token, setToken] = useState(null); // State to store the token

  const isCurrentUserOwner = auth.user && auth.user.profile.id === project.owner.id;

  const [attendees, setAttendees] = useState([]);

  const currentUserId = auth.user?.profile.id;

  
  useEffect(() => {
    // Fetch and set the token
    const getToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      console.log("Token fetched: ", storedToken); // Debugging log
      setToken(storedToken);
    };

    getToken();
  }, []);


  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (auth.isAuthenticated && token) {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/favorites/is-favorite/${project.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsFavorited(response.data.isFavorited);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      }
    };
  
    checkFavoriteStatus();
  }, [project.id, auth.isAuthenticated]);

  const handleAddFavorite = async () => {
    if (!auth.isAuthenticated) {
      navigation.navigate('Login');
    } else {
      const token = await AsyncStorage.getItem("token");
      axios.post(`http://127.0.0.1:8000/api/favorites/add/${project.id}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => setIsFavorited(true))
        .catch(error => console.error("Error adding to favorites:", error));
    }
  };

  const handleRemoveFavorite = async () => {
    const token = await AsyncStorage.getItem("token");
    axios.delete(`http://127.0.0.1:8000/api/favorites/remove/${project.id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setIsFavorited(false))
      .catch(error => console.error("Error removing from favorites:", error));
  };

  const processImageUrl = (imageUrl) => {
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    return imageUrl;
  };

    // Define a dynamic style for the favorite button
    const favoriteButtonStyle = {
      ...commonButtonStyle,
      backgroundColor: isFavorited ? '#DC3545' : '#F8D7DA',
    };
    

    useEffect(() => {
      // Function to fetch attendees
      const fetchAttendees = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          console.log("Token used for fetchAttendees:", token); // Log the token
      
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          console.log("Headers for fetchAttendees:", config.headers); // Log the headers
      
          const response = await axios.get(`http://127.0.0.1:8000/api/projects/${project.id}/attendees/`, config);
          setAttendees(response.data);
        } catch (error) {
          console.error('Error fetching attendees:', error);
        }
      };
      
  
      fetchAttendees();
    }, [project.id]); // Dependency array
  

    const navigateToProfile = (attendeeId) => {
      // Determine if the current user is the owner
      const isCurrentUserOwner = currentUserId === attendeeId;
  
      // Define the route and parameters based on the ownership condition
      const route = isCurrentUserOwner ? 'UserAccount' : 'UserProfileDetail';
      const params = isCurrentUserOwner ? {} : { id: attendeeId };
  
      // Navigate to the appropriate route with parameters
      navigation.navigate(route, params);
  };


    // Function to render each attendee
    const renderAttendee = ({ item }) => (
      <TouchableOpacity 
      style={styles.items} 
      onPress={() => navigateToProfile(item.attendee.id)}
    >
      <Image 
        source={{ uri: processImageUrl(item.attendee.profile_image) }} // Use processImageUrl here
        style={styles.attendimage}
      />
      <Text style={styles.text}>
        {item.attendee.name} (@{item.attendee.username})
      </Text>
    </TouchableOpacity>
  );


  // Adjusted style for the featured image to be 1/4 of its original size
  const featuredImageStyle = {
    width: '40%', // 1/4th width
    height: 152.5, // 1/4th height assuming original height was 250
    resizeMode: 'cover',
    borderRadius: 15,
  };

  // New style for the horizontal layout of title and owner details
  const headerStyle = {
    flexDirection: 'row', // Align items in a row
    alignItems: 'center', // Center items vertically
    justifyContent: 'space-between', // Space between items
    marginBottom: 10, // Margin at the bottom
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
  marginTop: 10,
  marginBottom: 10,
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

  // State to toggle full location display
  const [showFullLocation, setShowFullLocation] = useState(false);

  // Function to get a shortened location
  const getShortLocation = (location) => {
    return location.split(' ').slice(0, 4).join(' ') + '...';
  };

  return (
    <ScrollView style={styles.container}>

<TouchableOpacity onPress={() => navigation.navigate('ProjectScreen', { id: project.id })}>
        <View style={headerStyle}>
          <Image
            source={{ uri: processImageUrl(project.featured_image) }}
            style={featuredImageStyle}
          />
          <View style={titleAndOwnerStyle}>
            <Text style={styles.title}>{project.title}</Text>

            <Text style={styles.price}>RM {project.price}</Text>


        <Text style={styles.value}>
          {showFullLocation ? project.location : getShortLocation(project.location)}
        </Text>
        {project.location.split(' ').length > 8 && (
          <TouchableOpacity onPress={() => setShowFullLocation(!showFullLocation)}>
            <Text style={styles.seeMoreLink}>
              {showFullLocation ? 'See Less' : 'See More'}
            </Text>
          </TouchableOpacity>
        )}

<Text style={styles.value}>Start: {project.start_date || 'N/A'}</Text>

<Text style={styles.value}>End: {project.end_date || 'N/A'}</Text>

<Text>Attendees ({attendees.length})</Text>



          </View>
        </View>
      </TouchableOpacity>


      <View style={styles.cardBody}>
        {/* <Text style={styles.title}>{project.title}</Text>
        <TouchableOpacity
  onPress={() => navigation.navigate(isCurrentUserOwner ? 'UserAccount' : 'UserProfileDetail', { id: project.owner.id })}
  style={styles.profileContainer} // Add this style for horizontal layout
>
  <Image
    source={{ uri: processImageUrl(project.owner.profile_image) }}
    style={styles.profileImage}
  />
  <Text>{project.owner.name}</Text>
</TouchableOpacity> */}


<View style={styles.mainLayout}>

{/* Left Column */}
<View style={styles.leftColumn}>
  {/* Upper Row */}
  <TouchableOpacity
  style={styles.upperRow}
  onPress={() => navigation.navigate(isCurrentUserOwner ? 'UserAccount' : 'UserProfileDetail', { id: project.owner.id })}
>
  <Image
    source={{ uri: processImageUrl(project.owner.profile_image) }}
    style={styles.profileImage}
  />
  <Text style={styles.profileName}>{project.owner.username}</Text>
</TouchableOpacity>

{/* Right Column */}
<View style={styles.rightColumn}>
  {/* Voting Buttons */}
  <VotingButtons projectId={project.id} />
</View>


</View>

  {/* Lower Row */}
  <View style={styles.lowerRow}>
    {project.tags.map((tag) => (
      <TouchableOpacity 
        key={tag.id} 
        style={styles.tagButton} 
        onPress={() => navigation.navigate('Categories', { tag_id: tag.id })}
      >
        <Text>{tag.name}</Text>
      </TouchableOpacity>
    ))}
  </View>

</View>


<View style={buttonContainerStyle}>
  {token && (
    <AttendButton 
      projectId={project.id} 
      token={token} 
      style={commonButtonStyle}
    />
  )}

  <TouchableOpacity 
    style={[commonButtonStyle, favoriteButtonStyle]} // Combine styles
    onPress={isFavorited ? handleRemoveFavorite : handleAddFavorite}
  >
    <Text>{isFavorited ? 'Remove Bookmarks' : 'Add Bookmarks'}</Text>
  </TouchableOpacity>
</View>




      {/* Attendees List */}
      {/* <View>
        <Text>Attendees ({attendees.length})</Text>
        <FlatList
          data={attendees}
          renderItem={renderAttendee}
          keyExtractor={item => item.attendee.id.toString()}
        />
      </View> */}

     

        {/* <View style={styles.badge}>
  <Text style={styles.badgeText}>{project.brand}</Text>
</View> */}


      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 100,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 25,
    height: 25,
    borderRadius: 15,
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    borderRadius: 15, // Rounded corners for images
},
cardBody: {
    // padding: 15, // Increased padding
},
title: {
    fontSize: 16, // Increased font size
    fontWeight: 'bold',
},
price: {
    fontSize: 14, // Increased font size
    // marginTop: 20,
},
dealButton: {
    marginTop: 15,
    backgroundColor: '#28a745', // Updated button color
    padding: 12,
    alignItems: 'center',
    borderRadius: 10, // Rounded corners for buttons
},
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  tagButton: {
    backgroundColor: '#007BFF',
    padding: 5,
    marginRight: 6,
    borderRadius: 5,
  },
  brand: {
    fontSize: 16,
    marginTop: 10,
  },
  tagButton: {
    backgroundColor: '#19a2b8', // Updated button color
    padding: 8,
    marginRight: 8,
    borderRadius: 5, // Rounded corners for tags
},

  profileContainer: {
    flexDirection: 'row', // Aligns children horizontally
    alignItems: 'center', // Centers children vertically in the container
    // Add any additional styling like margin or padding as needed
  },

  badge: {
    backgroundColor: '#FF4500', // Badge background color
    borderRadius: 15, // Rounded corners
    paddingVertical: 4, // Vertical padding
    paddingHorizontal: 8, // Horizontal padding
    marginTop: 5, // Space above the badge
    alignSelf: 'flex-start', // Align badge to start
  },
  badgeText: {
    color: 'white', // Text color
    fontSize: 12, // Font size for the badge text
  },
    item: {
    marginVertical: 8,
    // paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  attendimage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  text: {
    color: '#000',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  items: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  }, 
    // Main layout style for the two-column row
    mainLayout: {
      flexDirection: 'row',
      padding: 2,
    },
  
    // Left Column Styles
    leftColumn: {
      flex: 3, // Adjust for desired width
      marginRight: 10, // Space between columns
    },
    upperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10, // Space between upper and lower rows
    },
    profileImage: {
      width: 30,
      height: 30,
      borderRadius: 25,
      marginRight: 10,
    },
    profileName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    lowerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
    },
    tagButton: {
      backgroundColor: '#007BFF',
      padding: 5,
      marginRight: 8,
      marginBottom: 8,
      borderRadius: 5,
    },
    tagText: {
      color: 'white',
    },
  
    // Right Column Styles
    rightColumn: {
      flex: 2, // Adjust for desired width
      // alignItems: 'flex-end', // Align voting buttons to the right
    },
});

export default Project;
