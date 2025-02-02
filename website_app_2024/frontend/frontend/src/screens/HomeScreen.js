import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Dropdown } from 'react-bootstrap';
import Project from '../components/Project';
import axios from 'axios';
import api from '../services/api';

import Pagination from '../components/Pagination';

import HorizontalProject from '../components/HorizontalProject'; // Import the new component

function HomeScreen() {
    const [projects, setProjects] = useState([]);
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // New State for current page
    const projectsPerPage = 8; // 6 projects per page as specified
    
    const [priceSortOrder, setPriceSortOrder] = useState('desc'); // starts with 'desc' for descending
    const [topSortOrder, setTopSortOrder] = useState('desc'); // starts with 'desc' for descending
    const [newSortOrder, setNewSortOrder] = useState('desc'); // starts with 'desc' for newest first
    
    // const fetchProjects = async (query = '', sortBy = '') => {
    //     try {
    //       const { data } = await api.get(`projects/?search_query=${query}&sort_by=${sortBy}`, {
    //         timeout: 10000 // Setting timeout to 10 seconds
    //       });
    //       setProjects(data);
    //     } catch (error) {
    //       // Handle the error here
    //       console.error(error);
    //     }
    //   };
      

    const fetchProjects = async (query = '', sortBy = '', sortOrder = 'desc') => {
        try {
            const { data } = await api.get(`projects/?search_query=${query}&sort_by=${sortBy}&sort_order=${sortOrder}`, {
                timeout: 10000 // Setting timeout to 10 seconds
            });
            setProjects(data);
        } catch (error) {
            // Handle the error here
            console.error(error);
        }
    };
    
    const fetchTopProjects = () => {
        fetchProjects(query, 'upvotes');
    };

    const fetchNewProjects = () => {
        fetchProjects(query, 'created');
    };

    useEffect(() => {
        fetchProjects();  // fetch all projects on initial load
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();  // Prevent the default form submission behavior
        fetchProjects(query);
    };

    // Get current projects to display based on current page
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);


    const [layout, setLayout] = useState('vertical'); // New state for layout

    const handleVerticalLayout = () => setLayout('vertical');
    const handleHorizontalLayout = () => setLayout('horizontal');

    const fetchPriceProjects = () => {
        fetchProjects(query, 'price');
    };
    
    const toggleTopSort = (order) => {
        setTopSortOrder(order);
        fetchProjects(query, 'upvotes', order);
    };
    
    const toggleNewSort = (order) => {
        setNewSortOrder(order);
        fetchProjects(query, 'created', order);
    };
    
    const togglePriceSort = (order) => {
        setPriceSortOrder(order);
        fetchProjects(query, 'price', order);
    };
    
    

        // Helper function to return the button label with the appropriate arrow
    const getButtonLabel = (baseText, sortOrder) => {
        const arrow = sortOrder === 'desc' ? '↓' : '↑';
        return `${baseText}`;
    };

    // Modify the getSortOrderLabel to reflect new terms
    const getSortOrderLabel = (sortType, sortOrder) => {
        switch (sortType) {
            case 'top':
                return sortOrder === 'desc' ? 'Top to Low ↓' : 'Low to Top ↑';
            case 'new':
                return sortOrder === 'desc' ? 'New to Old ↓' : 'Old to New ↑';
            case 'price':
                return sortOrder === 'desc' ? 'High to Low ↓' : 'Low to High ↑';
            default:
                return '';
        }
    };
    return (
        <div>
            <h1>Deals</h1>
            <div className="d-flex justify-content-center align-items-center mb-3">
                <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search for deals"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="form-control"
                        style={{ width: '300px', marginRight: '10px' }}
                    />
                    <Button variant="outline-secondary" type="submit">Search</Button>
                </form>
            </div>

            <div className="mb-3 d-flex justify-content-center">
                <Dropdown>
                    <Dropdown.Toggle variant="outline-primary" id="dropdown-basic" style={{ marginRight: '1rem' }}>
                        {getButtonLabel('Top', topSortOrder)}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => toggleTopSort('desc')}>
                            Top to Low ↓
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => toggleTopSort('asc')}>
                            Low to Top ↑
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                    <Dropdown.Toggle variant="outline-success" id="dropdown-basic" style={{ marginRight: '1rem' }}>
                        {getButtonLabel('Date', newSortOrder)}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => toggleNewSort('desc')}>
                            New to Old ↓
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => toggleNewSort('asc')}>
                            Old to New ↑
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                    <Dropdown.Toggle variant="outline-info" id="dropdown-basic">
                        {getButtonLabel('Price', priceSortOrder)}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => togglePriceSort('desc')}>
                            High to Low ↓
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => togglePriceSort('asc')}>
                            Low to High ↑
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>


            {/* Layout selection buttons */}
            <div className="mb-3 d-flex ">
    <Button 
        onClick={handleVerticalLayout} 
        variant={layout === 'vertical' ? "primary" : "secondary"}
        className="me-2"  // Right margin (margin-end) of 2 units
    >
        <i className="fa-solid fa-grip-vertical"></i>
    </Button>
    <Button 
        onClick={handleHorizontalLayout} 
        variant={layout === 'horizontal' ? "primary" : "secondary"}
    >
        <i className="fa-solid fa-grip"></i>
    </Button>
</div>


            <Row>
                {currentProjects.map(project => (
                    layout === 'vertical' ? (
                        <Col key={project.id} sm={12} md={6} lg={4} xl={3}>
                            <Project project={project}  />

                        </Col>
                    ) : (
                        <HorizontalProject key={project.id} project={project} />
                    )
                ))}
            </Row>

            {/* Pagination buttons */}
            <Pagination 
                currentPage={currentPage} 
                projectsLength={projects.length} 
                projectsPerPage={projectsPerPage} 
                setCurrentPage={setCurrentPage} 
            />
        </div>
    );
}

export default HomeScreen;
