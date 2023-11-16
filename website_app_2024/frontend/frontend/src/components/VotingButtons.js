import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";

const VotingButtons = ({ projectId }) => {
  const [vote, setVote] = useState(null);
  const [voteCount, setVoteCount] = useState(0); // New state for vote count

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
      window.location.href = "/login";
    } else {
      if (voteType === vote) {
        setVote(null);
        axios
          .delete(`/api/remove-vote/${projectId}/${voteType}/`, config)
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
          .post(`/api/vote/${projectId}/${voteType}/`, {}, config)
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
        variant={vote === "DOWN" ? "danger" : "secondary"}
        onClick={() => handleVote("DOWN")}
      >
        <i className="fa-regular fa-thumbs-down"></i>{" "}
      </Button>
    </div>
  );
};

export default VotingButtons;
