import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';
import { Row, Dropdown, Modal } from 'react-bootstrap';    // Import Row from react-bootstrap for layout
import ProjectAttending from '../components/ProjectAttending';

function AttendingProjects() {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async (sortField = '', sortOrder = '') => {
    const token = localStorage.getItem("token");
    let url = '/api/user/attending-projects/';
    if (sortField && sortOrder) {
      url += `?sort_by=${sortField}&sort_order=${sortOrder}`;
    }
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching attending projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Assuming you have a context or some other means to access auth and navigate
  const auth = {}; // Replace with actual auth context or state
  const navigate = {}; // Replace with actual navigate function


  const handleRemoveProject = (projectId) => {
    setProjects(projects.filter(project => project.id !== projectId));
  };

    // Create a function to handle the sorting options
    const handleSort = (sortField, sortOrder) => {
      fetchProjects(sortField, sortOrder);
    };


      // State for the modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelModalMessage, setCancelModalMessage] = useState('');

  // Function to handle modal changes
  const handleModalChange = (show, message) => {
    setShowCancelModal(show);
    setCancelModalMessage(message);
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center',marginTop: '20px' }}>Attending Events</h2>
      <p style={{ textAlign: 'center', marginBottom: '30px'  }}> {/* Adjust the marginBottom value as needed */}
        {projects.length} Event{projects.length !== 1 ? "s" : ""} Attending
      </p>

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Body>{cancelModalMessage}</Modal.Body>
      </Modal>

{/* Dropdown for sorting by newest */}
<div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          {/* Dropdown for sorting by newest */}
          <Dropdown onSelect={(e) => handleSort('created', e)}> {/* Use 'created' for sorting by newest */}
            <Dropdown.Toggle variant="outline-info" id="dropdown-new">
              Date
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="asc">Old to New</Dropdown.Item>
              <Dropdown.Item eventKey="desc">New to Old</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Dropdown for sorting by top */}
          <Dropdown onSelect={(e) => handleSort('upvotes', e)}>
            <Dropdown.Toggle variant="outline-dark" id="dropdown-upvote">
              Top
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="asc">Low to Top</Dropdown.Item>
              <Dropdown.Item eventKey="desc">Top to Low</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

                    {/* Dropdown for sorting by price */}
                    <Dropdown onSelect={(e) => handleSort('price', e)}>
            <Dropdown.Toggle variant="outline-success" id="dropdown-price">
              Price
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="asc">Low to High</Dropdown.Item>
              <Dropdown.Item eventKey="desc">High to Low</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

        </div>



      <Row>
        {projects.map(project => (
          <ProjectAttending 
            key={project.id} 
            project={project} 
            onRemoveProject={handleRemoveProject}
            onModalChange={handleModalChange} // Pass the modal handling function

          />
        ))}
      </Row>
    </div>
  );
}


export default AttendingProjects;