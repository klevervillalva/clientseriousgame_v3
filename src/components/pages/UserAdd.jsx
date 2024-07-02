import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import Layout from "./Layout";
import backgroundImage from "../img/ciencia.jpg";

const UserAdd = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://back-serious-game.vercel.app/api/auth/signup",
        {
          nombre,
          email,
          password,
          rol,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Usuario creado exitosamente");
      setNombre("");
      setEmail("");
      setPassword("");
      setRol("");
    } catch (error) {
      setMessage(
        "Error al crear usuario: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <Layout pageTitle="Agregar Usuario">
      <Container
        fluid
        className="p-4"
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Row className="justify-content-md-center">
          <Col xs={12} md={8} lg={6}>
            <Card
              className="shadow-lg"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Card.Body>
                <h2 className="text-center mb-4">Agregar Nuevo Usuario</h2>
                {message && <div className="alert alert-info">{message}</div>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formNombre" className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ingresa el nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formEmail" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Ingresa el email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formPassword" className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Ingresa la contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formRol" className="mb-3">
                    <Form.Label>Rol</Form.Label>
                    <Form.Control
                      as="select"
                      value={rol}
                      onChange={(e) => setRol(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un rol</option>
                      <option value="administrador">Administrador</option>
                      <option value="docente">Docente</option>
                    </Form.Control>
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    Agregar Usuario
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default UserAdd;
