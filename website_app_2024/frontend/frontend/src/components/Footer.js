import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer>
            <Container>
                <Row>
                    <Col className="text-center py-3">
                        <Link to="/about">About</Link> | 
                        <Link to="/cookie-policy">Cookie Policy</Link> | 
                        <Link to="/copyright-policy">Copyright Policy</Link> | 
                        <Link to="/privacy-policy">Privacy Policy</Link> | 
                        <Link to="/terms-of-service">Terms of Service</Link>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-center py-3">Copyright &copy; KickMates</Col>
                </Row>
            </Container>
        </footer>
    )
}

export default Footer;
