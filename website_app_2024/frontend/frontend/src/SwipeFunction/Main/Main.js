import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swipeable } from 'react-swipeable';
import { useSwipeable } from 'react-swipeable';

const API_BASE_URL = 'http://127.0.0.1:8000';


// ProjectCard component
const ProjectCard = ({ project, onSwipe }) => {
    const swipeHandlers = useSwipeable({
      onSwipedLeft: () => onSwipe('left', project.id),
      onSwipedRight: () => onSwipe('right', project.id),
      trackMouse: true
    });
  
    return (
      <div {...swipeHandlers}>
        <img src={project.imageUrl} alt={project.title} />
        <button onClick={() => onSwipe('like', project.id)}>Like</button>
        {/* Add more project details and buttons as needed */}
      </div>
    );
  };

export default function Main() {
  const [projects, setProjects] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const [previousProjects, setPreviousProjects] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/projects/random/`)
      .then(response => {
        setProjects(response.data.map(project => ({ ...project })));
      });
  }, []);

  const handleSwipe = (direction, projectId) => {
    console.log(`Swiped ${direction} on project ${projectId}`);
    if (direction === 'left') {
      console.log('Project disliked');
      // Implement dislike logic here
    } else if (direction === 'right') {
      console.log('Project liked');
      // Implement like logic here
    }
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
  };

  const processImageUrl = imageUrl => {
    if (imageUrl && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    return imageUrl;
  };

  const handleLikePress = projectId => {
    setModalVisible(true);
  };

  return (
    <div style={{ /* Add your styles here */ }}>
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={{ ...project, imageUrl: processImageUrl(project.featured_image) }}
          onSwipe={handleSwipe}
        />
      ))}
      {/* Render modal and other components as needed */}
    </div>
  );
}