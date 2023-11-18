import {React, useContext, useState} from "react";
import { Image, Row, Col, Container, Card, Badge, Button, ButtonGroup } from "react-bootstrap";
import { Link } from "react-router-dom"; // Correct import for Link
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AuthContext from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import FavoriteButton from "./FavoriteButton";
import AttendButton from "./AttendButton";

const RelatedProjectsSlider = ({ relatedProjects, currentProjectId }) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  
  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", background: "grey" }}
        onClick={onClick}
      ></div>
    );
  }

  function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", background: "grey" }}
        onClick={onClick}
      ></div>
    );
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true, // Add this line
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const [showFullText, setShowFullText] = useState(false);

  return (
    <Container>
      <h3>Related Events</h3>
      <Slider {...settings}>
        {relatedProjects
          .filter((relatedProject) => relatedProject.id !== currentProjectId)
          .map((relatedProject) => (
            <div key={relatedProject.id} style={{ padding: "0 10px" }}> {/* Added horizontal padding for each card */}
              <Card className="mb-4" style={{ padding: "5px", width: '95%' }}> {/* Decreased width and removed padding */}
                <Link to={`/project/${relatedProject.id}`}>
                  <Card.Img
                    variant="top"
                    src={relatedProject.featured_image}
                    alt={relatedProject.title}
                    style={{ width: '100%', height: '250px', objectFit: 'cover', margin: 0 }}
                  />
                </Link>

                <Card.Body style={{ minHeight: '300px', overflow: 'auto' }}> {/* Adjust min-height as needed */}
                  <Card.Title>
                    <Link
                      to={`/project/${relatedProject.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {relatedProject.title}
                    </Link>
                  </Card.Title>


                  <Link 
              to={auth.user && auth.user.profile.id === relatedProject.owner.id ? '/user/account' : `/profiles/${relatedProject.owner.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', marginBottom:'20px' }}
            >
              <img 
                src={relatedProject.owner.profile_image} 
                alt="Profile"
                style={{ width: '30px', height: '30px', marginRight: '10px', borderRadius: '50%' }}
              />
              {relatedProject.owner.name}
            </Link>



                  <Card.Text>
                    <i
                      className="fas fa-thumbs-up mr-1"
                      style={{ color: "green", fontSize: "22px", marginRight:"3px" }}></i>{" "}
                    {/* Green Thumbs up icon */}
                    <strong style={{ fontSize: "18px" }}>{relatedProject.upvotes}</strong>
                  </Card.Text>

                  <Card.Text className="my-3" style={{ fontSize: "22px" }}>
                      RM {relatedProject.price}
                    </Card.Text>


                    <Card.Text>
            <strong>Start:</strong>{" "}
            {relatedProject.start_date
              ? new Date(relatedProject.start_date).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })
              : "N/A"}
          </Card.Text>

          <Card.Text>
            <strong>End:</strong>{" "}
            {relatedProject.end_date
              ? new Date(relatedProject.end_date).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })
              : "N/A"}
          </Card.Text>

          <Card.Text>
            <strong>Location:</strong>{" "}
            {showFullText
              ? relatedProject.location
              : `${relatedProject.location.split(" ").slice(0, 8).join(" ")}...`}
            <Button
              variant="link"
              onClick={() => setShowFullText(!showFullText)}
            >
              {showFullText ? "Show Less" : "Show More"}
            </Button>
          </Card.Text>

          <AttendButton
            projectId={relatedProject.id}
            token={localStorage.getItem("token")}
          />

<div style={{ marginTop: "15px" }}>
          <FavoriteButton projectId={relatedProject.id} token={localStorage.getItem("token")} />

          </div>


                  <ButtonGroup className="mt-3">
                      {relatedProject.tags.map((tag) => (
                        <Link key={tag.id} to={`/categories?tag_id=${tag.id}`}>
                          <Button variant="danger" className="me-2" style={{ fontSize: "12px", padding: "2px 5px" }}>
                            {tag.name}
                          </Button>
                        </Link>
                      ))}
                    </ButtonGroup>

                    {/* <Card.Text style={{ fontSize: '16px' }}>
                    <Badge bg="dark">{relatedProject.brand}</Badge>
                </Card.Text> */}


                </Card.Body>
              </Card>
            </div>
          ))}
      </Slider>
    </Container>
  );
};

export default RelatedProjectsSlider;
