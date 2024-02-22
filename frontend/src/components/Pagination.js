import React from 'react';
import { Button } from 'react-bootstrap';

function Pagination({ currentPage, projectsLength, projectsPerPage, setCurrentPage }) {
    const buttonStyle = {
        margin: '0 5px'
    };

    return (
        <div className="d-flex justify-content-center mt-4">
            <Button 
    className="pagination-button" // Replace style with className
    variant="outline-secondary" 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
            >
                First Page
            </Button>
            <Button 
    className="pagination-button" // Replace style with className
    variant="outline-secondary" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
            >
                Prev
            </Button>
            {Array.from({ length: Math.ceil(projectsLength / projectsPerPage) }, (_, idx) => (
                <Button 
                className="pagination-button" // Replace style with className
                key={idx}
                    variant={idx + 1 === currentPage ? "danger" : "outline-secondary"}
                    onClick={() => setCurrentPage(idx + 1)}
                >
                    {idx + 1}
                </Button>
            ))}
            <Button 
    className="pagination-button" // Replace style with className
    variant="outline-secondary" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(projectsLength / projectsPerPage)))}
                disabled={currentPage === Math.ceil(projectsLength / projectsPerPage)}
            >
                Next 
            </Button>
            <Button 
    className="pagination-button" // Replace style with className
    variant="outline-secondary" 
                onClick={() => setCurrentPage(Math.ceil(projectsLength / projectsPerPage))} 
                disabled={currentPage === Math.ceil(projectsLength / projectsPerPage)}
            >
                Last Page
            </Button>
        </div>
    );
}

export default Pagination;
