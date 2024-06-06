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
import "./Conceptos.css";

const Conceptos = () => {
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
          "http://localhost:4000/api/auth/perfil",
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

  const [conceptos, setConceptos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [show, setShow] = useState(false);
  const [currentConcepto, setCurrentConcepto] = useState({
    titulo: "",
    descripcion: "",
    imagen: null,
    categoria_id: "",
    concepto_id: null,
  });

  const [search, setSearch] = useState("");
  const [searchCategoria, setSearchCategoria] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchConceptos();
    fetchCategorias();
  }, []);

  const fetchConceptos = async (searchQuery = "", searchCategoria = "") => {
    const { data } = await axios.get(
      "http://localhost:4000/api/getconceptos/",
      {
        params: { titulo: searchQuery, categoria_id: searchCategoria },
      }
    );
    setConceptos(data);
  };

  const fetchCategorias = async () => {
    try {
      const { data } = await axios.get("http://localhost:4000/api/categorias");
      setCategorias(data);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  const handleDelete = async (concepto_id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este concepto?")) {
      try {
        const response = await axios.delete(
          `http://localhost:4000/api/deleteconceptos/${concepto_id}`
        );
        if (response.status === 200) {
          setConceptos(
            conceptos.filter((concepto) => concepto.concepto_id !== concepto_id)
          );
        }
      } catch (error) {
        console.error("Error al eliminar el concepto:", error);
      }
    }
  };

  const handleShow = (concepto = {}) => {
    setCurrentConcepto({
      titulo: concepto.titulo || "",
      descripcion: concepto.descripcion || "",
      imagen: concepto.imagen || null,
      categoria_id: concepto.categoria_id || "",
      concepto_id: concepto.concepto_id || null,
    });
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setCurrentConcepto({
      titulo: "",
      descripcion: "",
      imagen: null,
      categoria_id: "",
      concepto_id: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("titulo", currentConcepto.titulo);
    formData.append("descripcion", currentConcepto.descripcion);
    formData.append("categoria_id", currentConcepto.categoria_id);
    if (currentConcepto.imagen instanceof File) {
      formData.append("imagen", currentConcepto.imagen);
    } else if (currentConcepto.imagen) {
      formData.append("imagenExistente", currentConcepto.imagen);
    }

    const method = currentConcepto.concepto_id ? "put" : "post";
    const url = currentConcepto.concepto_id
      ? `http://localhost:4000/api/edit/${currentConcepto.concepto_id}`
      : "http://localhost:4000/api/postconceptos/";

    try {
      const response = await axios({
        method: method,
        url: url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (currentConcepto.concepto_id) {
        setConceptos(
          conceptos.map((c) =>
            c.concepto_id === currentConcepto.concepto_id ? response.data : c
          )
        );
      } else {
        setConceptos([...conceptos, response.data]);
      }
      handleClose();
    } catch (error) {
      handleClose();
      console.error(error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchConceptos(search, searchCategoria);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = conceptos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(conceptos.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <Layout pageTitle="Gestión de Conceptos">
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
          <Col xs={12} className="text-center mb-2 title-container">
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
              Panel de Administración de Conceptos
            </div>
          </Col>
          <Col xs={12}>
            <Form onSubmit={handleSearch} className="mb-3">
              <Row>
                <Col md={5}>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por título"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
                <Col md={5}>
                  <Form.Control
                    as="select"
                    value={searchCategoria}
                    onChange={(e) => setSearchCategoria(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map((categoria) => (
                      <option
                        key={categoria.categoria_id}
                        value={categoria.categoria_id}
                      >
                        {categoria.nombre_categoria}
                      </option>
                    ))}
                  </Form.Control>
                </Col>
                <Col md={2}>
                  <Button type="submit" variant="primary">
                    Buscar
                  </Button>
                </Col>
              </Row>
            </Form>
            <div
              className="custom-container"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                padding: "20px",
                borderRadius: "15px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                overflowY: "auto",
                maxHeight: "500px",
                marginBottom: "20px",
              }}
            >
              <Button
                variant="primary"
                onClick={() => handleShow({})}
                className="mb-3 float-end"
              >
                <FaPlus /> Agregar Concepto
              </Button>
              <div className="table-responsive custom-table-container">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Título</th>
                      <th>Descripción</th>
                      <th>Imagen</th>
                      <th>Categoría</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((concepto, index) => (
                      <tr key={concepto.concepto_id}>
                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                        <td>{concepto.titulo}</td>
                        <td>{concepto.descripcion}</td>
                        <td>
                          {concepto.imagen ? (
                            <img
                              src={`http://localhost:4000/src/uploads/${concepto.imagen}`}
                              alt="Concepto"
                              className="concepto-imagen"
                            />
                          ) : (
                            <div style={{ width: "100px", height: "100px" }} />
                          )}
                        </td>
                        <td>{concepto.categoria}</td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              variant="warning"
                              onClick={() => handleShow(concepto)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDelete(concepto.concepto_id)}
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
                {paginationItems}
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
          </Col>
        </Row>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              {currentConcepto.concepto_id
                ? "Editar Concepto"
                : "Agregar Nuevo Concepto"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese el título"
                  value={currentConcepto.titulo}
                  onChange={(e) =>
                    setCurrentConcepto({
                      ...currentConcepto,
                      titulo: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Descripción del concepto"
                  value={currentConcepto.descripcion}
                  onChange={(e) =>
                    setCurrentConcepto({
                      ...currentConcepto,
                      descripcion: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Imagen</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) =>
                    setCurrentConcepto({
                      ...currentConcepto,
                      imagen: e.target.files[0],
                    })
                  }
                />
                {currentConcepto.imagen &&
                  !(currentConcepto.imagen instanceof File) && (
                    <div className="mt-3">
                      <img
                        src={`http://localhost:4000/src/uploads/${currentConcepto.imagen}`}
                        alt="Concepto"
                        className="concepto-imagen"
                      />
                    </div>
                  )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Control
                  as="select"
                  value={currentConcepto.categoria_id}
                  onChange={(e) =>
                    setCurrentConcepto({
                      ...currentConcepto,
                      categoria_id: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((categoria) => (
                    <option
                      key={categoria.categoria_id}
                      value={categoria.categoria_id}
                    >
                      {categoria.nombre_categoria}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Button variant="success" type="submit">
                {currentConcepto.concepto_id
                  ? "Actualizar Concepto"
                  : "Agregar Concepto"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </Layout>
  );
};

export default Conceptos;
