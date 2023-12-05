import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Icon } from "react-native-elements";

const VotingButtons = ({ projectId }) => {
  const [vote, setVote] = useState(null);
  const [voteCount, setVoteCount] = useState(0);

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem("token");
    } catch (e) {
      // error reading value
      console.error("Error reading token from storage:", e);
    }
  };

  const config = async () => {
    return {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    };
  };

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token && projectId) {
        const authConfig = await config();

        axios
          .get(`http://127.0.0.1:8000/api/vote/${projectId}/`, authConfig)
          .then((response) => {
            setVote(response.data.voteType);
            setVoteCount(response.data.voteCount);
          })
          .catch((error) => {
            console.error("Error fetching vote status:", error);
          });
      }
    })();
  }, [projectId]);

  const handleVote = async (voteType) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      // Navigate to login screen
      // Note: Use navigation from React Navigation or similar library
      return;
    }
  
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  
    // User is toggling their existing vote
    if (voteType === vote) {
      setVote(null);
      axios
        .delete(`http://127.0.0.1:8000/api/remove-vote/${projectId}/${voteType}/`, config)
        .then(() => {
          setVoteCount(prevCount => voteType === "UP" ? prevCount - 1 : prevCount + 1);
        })
        .catch((error) => {
          console.error("Error removing vote:", error);
        });
    } else {
      // User is casting a new vote or changing their vote
      axios
        .post(`http://127.0.0.1:8000/api/vote/${projectId}/${voteType}/`, {}, config)
        .then(() => {
          setVote(voteType);
          setVoteCount(prevCount => {
            if (vote === null) {
              return voteType === "UP" ? prevCount + 1 : prevCount - 1;
            } else {
              return voteType === "UP" ? prevCount + 2 : prevCount - 2;
            }
          });
        })
        .catch((error) => {
          console.error("Error submitting vote:", error);
        });
    }
  };
  

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        onPress={() => handleVote("UP")}
        style={{ marginRight: 10 }}
      >
        <View style={{
          borderWidth: 1,
          borderColor: '#D3D3D3',
          borderRadius: 25,
          padding: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Icon
            name="thumbs-up"
            type="font-awesome"
            color={vote === "UP" ? "#1f701f" : "#D3D3D3"}
            opacity={vote === "UP" ? 1 : 0.3}
          />
        </View>
      </TouchableOpacity>
      <Text style={{ marginRight: 10 }}>{voteCount}</Text>
      <TouchableOpacity
        onPress={() => handleVote("DOWN")}
      >
        <View style={{
          borderWidth: 1,
          borderColor: '#D3D3D3',
          borderRadius: 50,
          padding: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Icon
            name="thumbs-down"
            type="font-awesome"
            color={vote === "DOWN" ? "#c60c0c" : "#D3D3D3"}
            opacity={vote === "DOWN" ? 1 : 0.3}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default VotingButtons;