import React, { useEffect, useState } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import "./TopNavbar.css";

const TopNavbar = () => {
  const [userData, setUserData] = useState({
    nombre: "",
    email: "",
    rol: "",
    fecha_registro: "",
  });

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="navbar-top">
      <Navbar.Brand>Mendel Genetics Game - UTN</Navbar.Brand>
      <Nav className="ms-auto d-flex align-items-center">
        <Nav.Item className="d-flex align-items-center me-3">
          <FaUser className="me-2" />
          <span className="text-white">Usuario: {userData.nombre}</span>
        </Nav.Item>
        <Nav.Link
          as={Link}
          to="#"
          onClick={handleLogout}
          className="text-white d-flex align-items-center"
        >
          <FaSignOutAlt className="me-2" />
          Cerrar Sesión
        </Nav.Link>
      </Nav>
    </Navbar>
  );
};

export default TopNavbar;
