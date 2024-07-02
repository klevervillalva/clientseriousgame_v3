import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import Layout from "./Layout";
import backgroundImage from "../img/ciencia.jpg";

const Perfil = () => {
  const [userData, setUserData] = useState({
    nombre: "",
    email: "",
    rol: "",
    fecha_registro: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://back-serious-game.vercel.app/api/auth/perfil",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  const handlePasswordChange = async () => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://back-serious-game.vercel.app/api/auth/update",
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Contraseña actualizada con éxito");
      setShowModal(false);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Algo salió mal. Por favor, inténtelo de nuevo."
      );
    }
  };

  return (
    <Layout pageTitle="Perfil">
      <Container
        fluid
        className="d-flex flex-column align-items-center justify-content-start"
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: "5px",
        }}
      >
        <Row className="justify-content-center w-100 mb-4">
          <Col xs={12} className="text-center">
            <h1
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                color: "#000",
                padding: "20px 60px",
                borderRadius: "25px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(10px)",
                width: "90%",
                maxWidth: "800px",
                margin: "0 auto",
                marginBottom: "20px",
              }}
            >
              Perfil de Usuario
            </h1>
          </Col>
        </Row>
        <Row className="justify-content-center w-100">
          <Col xs={12} md={8} lg={6}>
            <div
              style={{
                fontSize: "1.1rem",
                textAlign: "left",
                background: "rgba(255, 255, 255, 0.9)",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                marginTop: "20px",
              }}
            >
              <div style={{ marginBottom: "15px" }}>
                <strong>Nombre:</strong> {userData.nombre || "Cargando..."}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Email:</strong> {userData.email || "Cargando..."}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Rol:</strong> {userData.rol || "Cargando..."}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Fecha de Registro:</strong>{" "}
                {userData.fecha_registro
                  ? new Date(userData.fecha_registro).toLocaleDateString()
                  : "Cargando..."}
              </div>
              <Button
                variant="primary"
                className="mt-4 w-100"
                onClick={() => setShowModal(true)}
                style={{
                  backgroundColor: "#007bff",
                  border: "none",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#0056b3")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#007bff")
                }
              >
                Actualizar Contraseña
              </Button>
            </div>
          </Col>
        </Row>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Contraseña</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            <Form>
              <Form.Group controlId="formOldPassword">
                <Form.Label>Contraseña Actual</Form.Label>
                <Form.Control
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formNewPassword" className="mt-3">
                <Form.Label>Nueva Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handlePasswordChange}>
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default Perfil;
