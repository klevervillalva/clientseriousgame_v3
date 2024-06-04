import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Pagination,
  Container,
} from "react-bootstrap";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import Layout from "./Layout"; // Asumiendo que Layout ya tiene NavbarLateral y TopNavbar
import backgroundImage from "../img/ciencia.jpg"; // Ruta correcta a tu imagen

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    nombre: "",
    email: "",
    rol: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [modalType, setModalType] = useState("edit");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (searchQuery = "") => {
    try {
      const response = await axios.get(
        "https://backseriousgame.onrender.com/api/getusers",
        {
          params: { nombre: searchQuery, rol: searchQuery },
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  const handleShowModal = (user = null, type = "edit") => {
    setCurrentUser(user || { nombre: "", email: "", rol: "", password: "" });
    setModalType(type);
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await axios.delete(
          `https://backseriousgame.onrender.com/api/deleteusers/${userId}`
        );
        fetchUsers();
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
      }
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (modalType === "edit") {
        await axios.put(
          `https://backseriousgame.onrender.com/api/putusers/${currentUser.usuario_id}`,
          currentUser
        );
      } else {
        await axios.post(
          "https://backseriousgame.onrender.com/api/auth/signup",
          currentUser
        );
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Algo salió mal. Por favor, inténtelo de nuevo."
      );
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchUsers(search);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  return (
    <Layout pageTitle="Administración de Usuarios">
      <Container
        fluid
        className="p-4 d-flex flex-column align-items-center justify-content-start"
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: "30px", // Agregar padding superior para mover contenido hacia arriba
          overflowY: "auto", // Permitir desplazamiento vertical
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            maxWidth: "1200px",
            width: "100%",
            marginBottom: "20px", // Margin bottom for spacing
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: "bold",
          }}
        >
          Administración de Usuarios
        </div>
        <div
          className="w-100"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            maxWidth: "1200px",
            maxHeight: "60vh", // Limitar la altura máxima de la tarjeta
            overflowY: "auto", // Permitir desplazamiento dentro de la tarjeta si es necesario
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Form onSubmit={handleSearch} className="d-flex align-items-center">
              <Form.Control
                type="text"
                placeholder="Buscar por nombre o rol"
                className="mr-sm-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="outline-primary" type="submit">
                <FaSearch />
              </Button>
            </Form>
            <Button
              variant="primary"
              onClick={() =>
                handleShowModal(
                  { nombre: "", email: "", rol: "", password: "" },
                  "add"
                )
              }
            >
              <FaPlus /> Agregar Usuario
            </Button>
          </div>
          <div className="table-responsive custom-table-container">
            <Table striped bordered hover className="mb-3">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha de Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((user) => (
                  <tr key={user.usuario_id}>
                    <td>{user.usuario_id}</td>
                    <td>{user.nombre}</td>
                    <td>{user.email}</td>
                    <td>{user.rol}</td>
                    <td>
                      {new Date(user.fecha_registro).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        onClick={() => handleShowModal(user, "edit")}
                        className="me-2"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(user.usuario_id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination className="d-flex justify-content-center">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>
                {modalType === "edit" ? "Editar Usuario" : "Agregar Usuario"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <Form onSubmit={handleSave}>
                <Form.Group controlId="formNombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentUser?.nombre || ""}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, nombre: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formEmail" className="mt-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={currentUser?.email || ""}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, email: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formRol" className="mt-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentUser?.rol || ""}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, rol: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formPassword" className="mt-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={currentUser?.password || ""}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        password: e.target.value,
                      })
                    }
                    required={modalType === "add"}
                  />
                </Form.Group>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit">
                    Guardar
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Body>
          </Modal>
        </div>
      </Container>
    </Layout>
  );
};

export default Usuarios;
