import React, { useContext } from 'react';
import { Container } from 'react-bootstrap';
import AuthContext from '../../context/authContext';

function About() {


    return (
        <Container className="mt-5">
            <h1>About Friibee</h1>
            <p>Friibee is an avant-garde deal platform developed with a vision to transform how bargain hunters share and discover deals globally. Users can craft personal profiles, connect with fellow deal enthusiasts, broadcast their latest finds, and even tap into innovative features to spot deals in real-time. At Friibee, we prioritize creating user-driven digital landscapes, nurturing vibrant communities, and fostering the thrill of a great deal.</p>

        </Container>
    );
}

export default About;
