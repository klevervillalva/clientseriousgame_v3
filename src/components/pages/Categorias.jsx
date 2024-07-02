import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  Modal,
  Form,
  Pagination,
} from "react-bootstrap";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Layout from "./Layout";
import backgroundImage from "../img/ciencia.jpg";
import "./ejercicios.css";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [tiposEjercicios, setTiposEjercicios] = useState([]);
  const [newCategoria, setNewCategoria] = useState("");
  const [newTipoEjercicio, setNewTipoEjercicio] = useState("");
  const [editCategoria, setEditCategoria] = useState(null);
  const [editTipoEjercicio, setEditTipoEjercicio] = useState(null);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [currentPageCategorias, setCurrentPageCategorias] = useState(1);
  const [currentPageTipos, setCurrentPageTipos] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCategorias();
    fetchTiposEjercicios();
  }, []);

  const fetchCategorias = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://back-serious-game.vercel.app/api/categorias", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategorias(response.data);
    } catch (error) {
      console.error("Error fetching categorias", error);
    }
  };

  const fetchTiposEjercicios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://back-serious-game.vercel.app/api/tipo_ejercicios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTiposEjercicios(response.data);
    } catch (error) {
      console.error("Error fetching tipos de ejercicios", error);
    }
  };

  const handleAddCategoria = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://back-serious-game.vercel.app/api/categorias", {
        nombre_categoria: newCategoria,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewCategoria("");
      fetchCategorias();
      setShowCategoriaModal(false);
    } catch (error) {
      console.error("Error adding categoria", error);
    }
  };

  const handleAddTipoEjercicio = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://back-serious-game.vercel.app/api/tipo_ejercicios", {
        nombre_tipo: newTipoEjercicio,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewTipoEjercicio("");
      fetchTiposEjercicios();
      setShowTipoModal(false);
    } catch (error) {
      console.error("Error adding tipo de ejercicio", error);
    }
  };

  const handleDeleteCategoria = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://back-serious-game.vercel.app/api/categorias/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCategorias();
    } catch (error) {
      console.error("Error deleting categoria", error);
    }
  };

  const handleDeleteTipoEjercicio = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://back-serious-game.vercel.app/api/tipo_ejercicios/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchTiposEjercicios();
    } catch (error) {
      console.error("Error deleting tipo de ejercicio", error);
    }
  };

  const handleUpdateCategoria = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://back-serious-game.vercel.app/api/categorias/${editCategoria.categoria_id}`, {
        nombre_categoria: editCategoria.nombre_categoria,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEditCategoria(null);
      fetchCategorias();
      setShowCategoriaModal(false);
    } catch (error) {
      console.error("Error updating categoria", error);
    }
  };

  const handleUpdateTipoEjercicio = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://back-serious-game.vercel.app/api/tipo_ejercicios/${editTipoEjercicio.tipo_id}`, {
        nombre_tipo: editTipoEjercicio.nombre_tipo,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEditTipoEjercicio(null);
      fetchTiposEjercicios();
      setShowTipoModal(false);
    } catch (error) {
      console.error("Error updating tipo de ejercicio", error);
    }
  };

  const handleCloseCategoriaModal = () => {
    setShowCategoriaModal(false);
    setEditCategoria(null);
  };

  const handleCloseTipoModal = () => {
    setShowTipoModal(false);
    setEditTipoEjercicio(null);
  };

  // Paginación
  const indexOfLastCategoria = currentPageCategorias * itemsPerPage;
  const indexOfFirstCategoria = indexOfLastCategoria - itemsPerPage;
  const currentCategorias = categorias.slice(indexOfFirstCategoria, indexOfLastCategoria);
  const totalPagesCategorias = Math.ceil(categorias.length / itemsPerPage);

  const indexOfLastTipo = currentPageTipos * itemsPerPage;
  const indexOfFirstTipo = indexOfLastTipo - itemsPerPage;
  const currentTiposEjercicios = tiposEjercicios.slice(indexOfFirstTipo, indexOfLastTipo);
  const totalPagesTipos = Math.ceil(tiposEjercicios.length / itemsPerPage);

  const paginateCategorias = (pageNumber) => setCurrentPageCategorias(pageNumber);
  const paginateTipos = (pageNumber) => setCurrentPageTipos(pageNumber);

  return (
    <Layout pageTitle="Categorías y Tipos de Ejercicios">
      <Container
        fluid
        className="p-4"
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: "10px",
          overflowY: "auto",
        }}
      >
        <Row className="justify-content-md-center">
          <Col xs={12} className="text-center mb-4">
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: "10px 20px",
                borderRadius: "15px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginTop: "0px",
                marginBottom: "10px",
              }}
            >
              Categorías y Tipos de Ejercicios
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <div
              className="custom-container"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                padding: "20px",
                borderRadius: "15px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                marginBottom: "20px",
              }}
            >
              <Button
                variant="primary"
                onClick={() => setShowCategoriaModal(true)}
                className="mb-3 float-end"
              >
                <FaPlus /> Agregar Categoría
              </Button>
              <div className="table-responsive custom-table-container">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCategorias.map((categoria) => (
                      <tr key={categoria.categoria_id}>
                        <td>{categoria.categoria_id}</td>
                        <td>
                          {editCategoria &&
                          editCategoria.categoria_id ===
                            categoria.categoria_id ? (
                            <Form.Control
                              type="text"
                              value={editCategoria.nombre_categoria}
                              onChange={(e) =>
                                setEditCategoria({
                                  ...editCategoria,
                                  nombre_categoria: e.target.value,
                                })
                              }
                            />
                          ) : (
                            categoria.nombre_categoria
                          )}
                        </td>
                        <td>
                          {editCategoria &&
                          editCategoria.categoria_id ===
                            categoria.categoria_id ? (
                            <Button
                              variant="success"
                              onClick={handleUpdateCategoria}
                            >
                              Guardar
                            </Button>
                          ) : (
                            <div className="action-buttons">
                              <Button
                                variant="warning"
                                onClick={() => setEditCategoria(categoria)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() =>
                                  handleDeleteCategoria(categoria.categoria_id)
                                }
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-center">
                  <Pagination>
                    {[...Array(totalPagesCategorias).keys()].map((number) => (
                      <Pagination.Item
                        key={number + 1}
                        active={number + 1 === currentPageCategorias}
                        onClick={() => paginateCategorias(number + 1)}
                      >
                        {number + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </div>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div
              className="custom-container"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                padding: "20px",
                borderRadius: "15px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                marginBottom: "20px",
              }}
            >
              <Button
                variant="primary"
                onClick={() => setShowTipoModal(true)}
                className="mb-3 float-end"
              >
                <FaPlus /> Agregar Tipo de Ejercicio
              </Button>
              <div className="table-responsive custom-table-container">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTiposEjercicios.map((tipo) => (
                      <tr key={tipo.tipo_id}>
                        <td>{tipo.tipo_id}</td>
                        <td>
                          {editTipoEjercicio &&
                          editTipoEjercicio.tipo_id === tipo.tipo_id ? (
                            <Form.Control
                              type="text"
                              value={editTipoEjercicio.nombre_tipo}
                              onChange={(e) =>
                                setEditTipoEjercicio({
                                  ...editTipoEjercicio,
                                  nombre_tipo: e.target.value,
                                })
                              }
                            />
                          ) : (
                            tipo.nombre_tipo
                          )}
                        </td>
                        <td>
                          {editTipoEjercicio &&
                          editTipoEjercicio.tipo_id === tipo.tipo_id ? (
                            <Button
                              variant="success"
                              onClick={handleUpdateTipoEjercicio}
                            >
                              Guardar
                            </Button>
                          ) : (
                            <div className="action-buttons">
                              <Button
                                variant="warning"
                                onClick={() => setEditTipoEjercicio(tipo)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() =>
                                  handleDeleteTipoEjercicio(tipo.tipo_id)
                                }
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-center">
                  <Pagination>
                    {[...Array(totalPagesTipos).keys()].map((number) => (
                      <Pagination.Item
                        key={number + 1}
                        active={number + 1 === currentPageTipos}
                        onClick={() => paginateTipos(number + 1)}
                      >
                        {number + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Modal show={showCategoriaModal} onHide={handleCloseCategoriaModal}>
          <Modal.Header
            closeButton
            style={{ backgroundColor: "#007bff", color: "white" }}
          >
            <Modal.Title>Agregar Categoría</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                editCategoria ? handleUpdateCategoria() : handleAddCategoria();
              }}
            >
              <Form.Group className="mb-3">
                <Form.Label>Nombre de la Categoría</Form.Label>
                <Form.Control
                  type="text"
                  value={
                    editCategoria
                      ? editCategoria.nombre_categoria
                      : newCategoria
                  }
                  onChange={(e) =>
                    editCategoria
                      ? setEditCategoria({
                          ...editCategoria,
                          nombre_categoria: e.target.value,
                        })
                      : setNewCategoria(e.target.value)
                  }
                  placeholder="Nombre de la categoría"
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                {editCategoria ? "Guardar" : "Agregar"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal show={showTipoModal} onHide={handleCloseTipoModal}>
          <Modal.Header
            closeButton
            style={{ backgroundColor: "#007bff", color: "white" }}
          >
            <Modal.Title>Agregar Tipo de Ejercicio</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                editTipoEjercicio
                  ? handleUpdateTipoEjercicio()
                  : handleAddTipoEjercicio();
              }}
            >
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Tipo de Ejercicio</Form.Label>
                <Form.Control
                  type="text"
                  value={
                    editTipoEjercicio
                      ? editTipoEjercicio.nombre_tipo
                      : newTipoEjercicio
                  }
                  onChange={(e) =>
                    editTipoEjercicio
                      ? setEditTipoEjercicio({
                          ...editTipoEjercicio,
                          nombre_tipo: e.target.value,
                        })
                      : setNewTipoEjercicio(e.target.value)
                  }
                  placeholder="Nombre del tipo de ejercicio"
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                {editTipoEjercicio ? "Guardar" : "Agregar"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </Layout>
  );
};

export default Categorias;
