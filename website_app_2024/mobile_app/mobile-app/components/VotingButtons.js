import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    const token = await getToken();
    if (!token) {
      // Redirect to login; In React Native, use navigation instead
    } else {
      const authConfig = await config();
      if (voteType === vote) {
        setVote(null);
        axios
          .delete(`http://127.0.0.1:8000/api/remove-vote/${projectId}/${voteType}/`, authConfig)
          .then(() => {
            setVoteCount((prevCount) =>
              voteType === "UP" ? prevCount - 1 : prevCount + 1
            );
          })
          .catch((error) => {
            console.error("Error removing vote:", error);
          });
      } else {
        axios
          .post(`http://127.0.0.1:8000/api/vote/${projectId}/${voteType}/`, {}, authConfig)
          .then(() => {
            setVote(voteType);
            setVoteCount((prevCount) =>
              voteType === "UP" ? prevCount + 1 : prevCount - 1
            );
          })
          .catch((error) => {
            console.error("Error submitting vote:", error);
          });
      }
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        onPress={() => handleVote("UP")}
        style={{ marginRight: 10, backgroundColor: vote === "UP" ? "green" : "grey", padding: 10 }}
      >
        <Text>👍</Text>
      </TouchableOpacity>
      <Text style={{ marginRight: 10 }}>{voteCount}</Text>
      <TouchableOpacity
        onPress={() => handleVote("DOWN")}
        style={{ backgroundColor: vote === "DOWN" ? "red" : "grey", padding: 10 }}
      >
        <Text>👎</Text>
      </TouchableOpacity>
    </View>
  );
};


export default VotingButtons;
