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
import Layout from "./Layout"; // Asegúrate de tener el Layout importado
import backgroundImage from "../img/ciencia.jpg"; // Ruta correcta a tu imagen
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

  console.log(userData);

  const [conceptos, setConceptos] = useState([]);
  const [show, setShow] = useState(false);
  const [currentConcepto, setCurrentConcepto] = useState({
    titulo: "",
    descripcion: "",
    imagen: null,
    categoria: "",
    concepto_id: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchConceptos();
  }, []);

  const fetchConceptos = async () => {
    const { data } = await axios.get(
      "https://backseriousgame.onrender.com/api/getconceptos/"
    );
    setConceptos(data);
  };

  const handleDelete = async (concepto_id) => {
    const response = await axios.delete(
      `https://backseriousgame.onrender.com/api/deleteconceptos/${concepto_id}`
    );
    if (response.status === 200) {
      setConceptos(
        conceptos.filter((concepto) => concepto.concepto_id !== concepto_id)
      );
    }
  };

  const handleShow = (concepto = {}) => {
    setCurrentConcepto({
      titulo: concepto.titulo || "",
      descripcion: concepto.descripcion || "",
      imagen: concepto.imagen || null,
      categoria: concepto.categoria || "",
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
      categoria: "",
      concepto_id: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("titulo", currentConcepto.titulo);
    formData.append("descripcion", currentConcepto.descripcion);
    formData.append("categoria", currentConcepto.categoria);
    if (currentConcepto.imagen instanceof File) {
      formData.append("imagen", currentConcepto.imagen);
    } else if (currentConcepto.imagen) {
      formData.append("imagenExistente", currentConcepto.imagen);
    }

    const method = currentConcepto.concepto_id ? "put" : "post";
    const url = currentConcepto.concepto_id
      ? `https://backseriousgame.onrender.com/api/edit/${currentConcepto.concepto_id}`
      : "https://backseriousgame.onrender.com/api/postconceptos/";

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
        fetchConceptos();
      } else {
        setConceptos([...conceptos, response.data]);
      }
      handleClose();
    } catch (error) {
      handleClose();
      console.error(error);
    }
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
          paddingTop: "50px", // Agregar padding superior para mover contenido hacia arriba
          overflowY: "auto", // Permitir desplazamiento vertical en la página
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
              Panel de Administración de Conceptos
            </div>
          </Col>
          <Col xs={12}>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                padding: "20px",
                borderRadius: "15px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                overflowY: "auto", // Permitir desplazamiento vertical en el contenedor
                maxHeight: "500px", // Ajustar esta altura según tus necesidades
              }}
            >
              <Button
                variant="primary"
                onClick={() => handleShow({})}
                className="mb-3 float-end" // Mueve el botón a la derecha
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
                              src={`https://backseriousgame.onrender.com/src/uploads/${concepto.imagen}`}
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
                        src={`https://backseriousgame.onrender.com/src/uploads/${currentConcepto.imagen}`}
                        alt="Concepto"
                        className="concepto-imagen"
                      />
                    </div>
                  )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Categoría del concepto"
                  value={currentConcepto.categoria}
                  onChange={(e) =>
                    setCurrentConcepto({
                      ...currentConcepto,
                      categoria: e.target.value,
                    })
                  }
                  required
                />
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
