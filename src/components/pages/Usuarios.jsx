import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Pagination,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import Layout from "./Layout";
import backgroundImage from "../img/ciencia.jpg";

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
  const [searchRol, setSearchRol] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (searchQuery = "", searchRol = "") => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://back-serious-game.vercel.app/api/searchusers",
        {
          params: { nombre: searchQuery, rol: searchRol },
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://back-serious-game.vercel.app/api/deleteusers/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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
      const token = localStorage.getItem("token");
      if (modalType === "edit") {
        await axios.put(
          `https://back-serious-game.vercel.app/api/putusers/${currentUser.usuario_id}`,
          currentUser,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          "https://back-serious-game.vercel.app/api/auth/signup",
          currentUser,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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
    fetchUsers(search, searchRol);
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
        className="p-4"
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: "30px",
          overflowY: "auto",
        }}
      >
        <Row className="justify-content-md-center">
          <Col xs={12} className="text-center mb-4">
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: "20px 40px",
                borderRadius: "15px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            >
              Administración de Usuarios
            </div>
          </Col>
          <Col xs={12}>
            <Form onSubmit={handleSearch} className="mb-3">
              <Row>
                <Col md={5}>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
                <Col md={5}>
                  <Form.Control
                    as="select"
                    value={searchRol}
                    onChange={(e) => setSearchRol(e.target.value)}
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="administrador">Administrador</option>
                    <option value="docente">Docente</option>
                  </Form.Control>
                </Col>
                <Col md={2}>
                  <Button type="submit" variant="primary">
                    <FaSearch />
                  </Button>
                </Col>
              </Row>
            </Form>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                padding: "20px",
                borderRadius: "15px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                overflowY: "auto",
                maxHeight: "500px",
              }}
            >
              <Button
                variant="primary"
                onClick={() =>
                  handleShowModal(
                    { nombre: "", email: "", rol: "", password: "" },
                    "add"
                  )
                }
                className="mb-3 float-end"
              >
                <FaPlus /> Agregar Usuario
              </Button>
              <div className="table-responsive custom-table-container">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Fecha de Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((user, index) => (
                      <tr key={user.usuario_id}>
                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                        <td>{user.nombre}</td>
                        <td>{user.email}</td>
                        <td>{user.rol}</td>
                        <td>
                          {new Date(user.fecha_registro).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="action-buttons">
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
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
                        setCurrentUser({
                          ...currentUser,
                          nombre: e.target.value,
                        })
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
                        setCurrentUser({
                          ...currentUser,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formRol" className="mt-3">
                    <Form.Label>Rol</Form.Label>
                    <Form.Control
                      as="select"
                      value={currentUser?.rol || ""}
                      onChange={(e) =>
                        setCurrentUser({
                          ...currentUser,
                          rol: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Seleccionar rol</option>
                      <option value="administrador">Administrador</option>
                      <option value="docente">Docente</option>
                    </Form.Control>
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
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Usuarios;
