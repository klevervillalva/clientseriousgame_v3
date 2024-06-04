import React, { useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import LateralNavbar from "./NavbarLateral";
import TopNavbar from "./TopNavbar";
import conceptos from "../Assets/img/conceptos.png";
import ejercicios from "../Assets/img/ejercicios.png";
import evaluacion from "../Assets/img/evaluacion.png";
import backgroundImage from "../img/ciencia.jpg";
import "./Principal.css";

const Principal = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const username = "Klever Villalva";

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="d-flex">
      <LateralNavbar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-grow-1 ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        style={{
          marginLeft: isSidebarOpen ? "250px" : "0",
          transition: "margin-left 0.3s ease",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      >
        <TopNavbar username={username} />
        <Container
          fluid
          className="d-flex flex-column align-items-center justify-content-start main-container"
        >
          <div className="title-card">
            Panel de Administración
          </div>
          <Container className="mt-4 cards-container">
            <Row className="g-4 justify-content-center">
              <Col xs={12} sm={6} md={4} lg={3}>
                <Card className="h-100 shadow-sm custom-card">
                  <Card.Img
                    variant="top"
                    src={conceptos}
                    className="custom-card-img"
                  />
                  <Card.Body>
                    <Card.Title>Gestión de Conceptos</Card.Title>
                    <Card.Text>
                      Crea y organiza los conceptos fundamentales de genética
                      que serán integrados en el videojuego educativo.
                    </Card.Text>
                    <Button variant="primary" as={Link} to="/conceptos">
                      Administrar Conceptos
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} md={4} lg={3}>
                <Card className="h-100 shadow-sm custom-card">
                  <Card.Img
                    variant="top"
                    src={ejercicios}
                    className="custom-card-img"
                  />
                  <Card.Body>
                    <Card.Title>Gestión de Ejercicios</Card.Title>
                    <Card.Text>
                      Desarrolla y revisa ejercicios interactivos que serán
                      parte del juego, mejorando la aplicación práctica de los
                      conocimientos de genética.
                    </Card.Text>
                    <Button variant="primary" as={Link} to="/ejercicios">
                      Administrar Ejercicios
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} md={4} lg={3}>
                <Card className="h-100 shadow-sm custom-card">
                  <Card.Img
                    variant="top"
                    src={evaluacion}
                    className="custom-card-img"
                  />
                  <Card.Body>
                    <Card.Title>Gestión de Evaluaciones</Card.Title>
                    <Card.Text>
                      Configura y programa las evaluaciones que medirán el
                      progreso de los estudiantes dentro del entorno del
                      videojuego.
                    </Card.Text>
                    <Button variant="primary" as={Link} to="/evaluacion">
                      Configurar Evaluaciones
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Container>
      </div>
    </div>
  );
};

export default Principal;
