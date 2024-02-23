import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { Button, Row, Col, Card, Badge, ButtonGroup } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import VotingButtons from "../components/VotingButtons"; // Adjust the path if necessary
import AuthContext from '../context/authContext'; // Adjust the path as needed
import { useParams } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";

import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';


function Categories() {
  const [tags, setTags] = useState([]);
  const [currentTagProjects, setCurrentTagProjects] = useState([]);
  const tabWrapperRef = useRef(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTagId = queryParams.get("tag_id");

  const [activeTagId, setActiveTagId] = useState(
    initialTagId || (tags.length ? tags[0].id : null)
  );

  const [followedTags, setFollowedTags] = useState(new Set());

  const activeTagName = tags.find(tag => tag.id === activeTagId)?.name || 'Unknown Tag';

  const navigate = useNavigate();


  const auth = useContext(AuthContext);

  


  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await axios.get("/api/tags/");
      setTags(data);
      if (!initialTagId && data.length) {
        setActiveTagId(data[0].id);
      }
    };
    fetchTags();
  }, [initialTagId]);

  useEffect(() => {
    if (activeTagId) {
      fetchProjectsByTag(activeTagId);
    }
  }, [activeTagId]);

  const fetchProjectsByTag = async (tagId) => {
    const { data } = await axios.get(`/api/projects/?tag_id=${tagId}`);
    setCurrentTagProjects(data);
  };

  const handleScrollLeft = () => {
    if (tabWrapperRef.current) {
      tabWrapperRef.current.scrollLeft -= 150;
    }
  };

  const handleScrollRight = () => {
    if (tabWrapperRef.current) {
      tabWrapperRef.current.scrollLeft += 150;
    }
  };

  useEffect(() => {
    if (tabWrapperRef.current) {
      const activeButton = Array.from(tabWrapperRef.current.children).find(
        (btn) => btn.getAttribute("data-id") === activeTagId
      );
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [activeTagId, tags]);

  useEffect(() => {
    const fetchFollowedTags = async () => {
      if (auth.isAuthenticated) {
        try {
          const { data } = await axios.get("/api/followed-tags", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setFollowedTags(new Set(data.map((tag) => tag.id)));
        } catch (error) {
          console.error("Error fetching followed tags", error);
        }
      }
    };
    fetchFollowedTags();
  }, [auth.isAuthenticated]); // Add this dependency to re-fetch when authentication status changes
  

  const toggleFollowTag = async (tagId) => {
    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (followedTags.has(tagId)) {
        await axios.post(
          `/api/unfollow-tag/${tagId}/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        followedTags.delete(tagId);
      } else {
        await axios.post(
          `/api/follow-tag/${tagId}/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        followedTags.add(tagId);
      }
      setFollowedTags(new Set(followedTags));
    } catch (error) {
      console.error("Error toggling tag follow status", error);
    }
  };


  // Revised scroll handlers with animation
  const handleScroll = (direction) => {
    if (tabWrapperRef.current) {
      const scrollAmount = 150;
      let scrollPosition = tabWrapperRef.current.scrollLeft;
      tabWrapperRef.current.scrollTo({
        left: direction === 'left' ? scrollPosition - scrollAmount : scrollPosition + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div>
      {/* <h1>Categories</h1> */}
      <h2 style={{ textAlign: 'center',marginTop: '20px',marginBottom: '40px' }}>Categories</h2>

      {auth.isAuthenticated && (
  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: "25px" }}>
    <Button variant="warning" onClick={() => navigate("/followed-tags")}>
      View Followed Categories
    </Button>
  </div>
)}


<div className="scroll-container" style={{ display: 'flex', alignItems: 'center' }}>
        <Button 
          className="scroll-button left" 
          variant="warning" 
          onClick={() => handleScroll('left')} 
          style={{ margin: '0 10px 0 0' }}> {/* Added right margin */}
          <FontAwesomeIcon icon={faArrowLeft} />
        </Button>

        <div 
          className="tab-wrapper" 
          ref={tabWrapperRef} 
          style={{ overflowX: 'auto', flexGrow: 1, whiteSpace: 'nowrap' }}>
          {tags.map((tag) => (
            <div key={tag.id}>
              <Button
                data-id={tag.id}
                
                onClick={() => {
                  fetchProjectsByTag(tag.id);
                  setActiveTagId(tag.id);
                }}
                variant={tag.id === activeTagId ? "warning" : "secondary"}
                style={{ margin: '0 1px' }}> {/* Added margin for spacing between tags */}
                {tag.name}
              </Button>
            </div>
          ))}
        </div>

        <Button 
          className="scroll-button right" 
          onClick={() => handleScroll('right')} 
          variant="warning"
          style={{ margin: '0 0 0 10px' }}> {/* Added left margin */}
          <FontAwesomeIcon icon={faArrowRight} />
        </Button>
      </div>


      <div>
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
    {/* Title showing active tag name */}
    {activeTagName && (
      <h3>Events for {activeTagName}</h3>
    )}

    {/* Follow/Unfollow Button for Active Tag */}
    {activeTagId && (
      <Button
        onClick={() => toggleFollowTag(activeTagId)}
        variant={followedTags.has(activeTagId) ? "primary" : "light"}
        style={{ fontSize: '18px', marginTop: '10px', marginBottom: '10px' }} // Added marginTop for spacing
      >
        {followedTags.has(activeTagId) ? `Unfollow ${activeTagName}` : `Follow ${activeTagName}`}
      </Button>
    )}
  </div>
<Row>
    {currentTagProjects.map(project => (
      <ProjectCard 
        key={project.id} 
        project={project} 
        auth={auth} 
        navigate={navigate} 
      />
    ))}
  </Row>
      </div>
    </div>
  );
}

export default Categories;
