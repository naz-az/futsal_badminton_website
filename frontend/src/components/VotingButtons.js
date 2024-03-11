import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

const VotingButtons = ({ projectId }) => {
  const [vote, setVote] = useState(null);
  const [voteCount, setVoteCount] = useState(0); // New state for vote count
  const navigate = useNavigate();

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && projectId) {
      const authConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      axios
        .get(`/api/vote/${projectId}/`, authConfig)
        .then((response) => {
          setVote(response.data.voteType);
          setVoteCount(response.data.voteCount);
        })
        .catch((error) => {
          console.error("Error fetching vote status:", error);
        });
    }
  }, [projectId]);
  

  const handleVote = (voteType) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }
  
    // User is toggling their existing vote
    if (voteType === vote) {
      setVote(null);
      axios
        .delete(`/api/remove-vote/${projectId}/${voteType}/`, config)
        .then(() => {
          // Adjust the vote count based on the vote being removed
          setVoteCount(prevCount => voteType === "UP" ? prevCount - 1 : prevCount + 1);
        })
        .catch((error) => {
          console.error("Error removing vote:", error);
        });
    } else {
      // User is casting a new vote or changing their vote
      axios
        .post(`/api/vote/${projectId}/${voteType}/`, {}, config)
        .then(() => {
          setVote(voteType);
          // Adjust the vote count correctly based on the new vote and previous vote if any
          setVoteCount(prevCount => {
            if (vote === null) {
              // No previous vote, simply add/subtract based on the new vote
              return voteType === "UP" ? prevCount + 1 : prevCount - 1;
            } else {
              // User is changing their vote, so double the increment/decrement
              return voteType === "UP" ? prevCount + 2 : prevCount - 2;
            }
          });
        })
        .catch((error) => {
          console.error("Error submitting vote:", error);
        });
    }
  };
  

  // useEffect(() => {
  //   axios
  //     .get(`/api/vote/${projectId}/`, config)
  //     .then((response) => {
  //       setVote(response.data.voteType);
  //       setVoteCount(response.data.voteCount); // Set vote count
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching vote status:", error);
  //     });
  // }, [projectId, config]);

  // const handleVote = (voteType) => {
  //   if (voteType === vote) {
  //     setVote(null);
  //     axios
  //       .delete(`/api/remove-vote/${projectId}/${voteType}/`, config)
  //       .then(() => {
  //         setVoteCount((prevCount) =>
  //           voteType === "UP" ? prevCount - 1 : prevCount + 1
  //         );
  //       })
  //       .catch((error) => {
  //         console.error("Error removing vote:", error);
  //       });
  //   } else {
  //     axios
  //       .post(`/api/vote/${projectId}/${voteType}/`, {}, config)
  //       .then(() => {
  //         setVote(voteType);
  //         setVoteCount((prevCount) =>
  //           voteType === "UP" ? prevCount + 1 : prevCount - 1
  //         );
  //             // Call the updateVoteCount passed via props
  //             updateVoteCount(projectId, voteType === "UP" ? voteCount + 1 : voteCount - 1);
  //           })
  //       .catch((error) => {
  //         console.error("Error submitting vote:", error);
  //       });
  //   }
  // };


  
  return (
    <div className="d-flex align-items-center">
      <Button
        variant={vote === "UP" ? "success" : "secondary"}
        onClick={() => handleVote("UP")}
        className="me-2"
      >
        <i className="fa-regular fa-thumbs-up"></i>{" "}
      </Button>
      <span className="me-2">{voteCount}</span>
      <Button
        variant={vote === "DOWN" ? "primary" : "secondary"}
        onClick={() => handleVote("DOWN")}
      >
        <i className="fa-regular fa-thumbs-down"></i>{" "}
      </Button>
    </div>
  );
};

export default VotingButtons;
