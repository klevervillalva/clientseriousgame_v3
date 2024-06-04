import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Modal,
  Table,
  Pagination,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "./Conceptos.css";
import Layout from "./Layout"; // Asumiendo que Layout ya tiene NavbarLateral y TopNavbar
import backgroundImage from "../img/ciencia.jpg"; // Ruta a tu imagen de fondo

const usePreguntas = () => {
  const [preguntas, setPreguntas] = useState([]);

  useEffect(() => {
    fetchPreguntas();
  }, []);

  const fetchPreguntas = async () => {
    try {
      const response = await axios.get(
        "https://backseriousgame.onrender.com/api/preguntas/obtener"
      );
      setPreguntas(response.data);
    } catch (error) {
      console.error("Error al obtener preguntas:", error);
    }
  };

  return { preguntas, fetchPreguntas };
};

const Evaluacion = () => {
  const { preguntas, fetchPreguntas } = usePreguntas();
  const [showModal, setShowModal] = useState(false);
  const [currentPregunta, setCurrentPregunta] = useState({
    pregunta_id: null,
    texto_pregunta: "",
    imagen: null,
    tipo_pregunta: "",
    detalles: "",
    explicacion_solucion: "",
    opciones: [{ texto_opcion: "", es_correcta: false }],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Número de preguntas por página

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setCurrentPregunta({ ...currentPregunta, imagen: files[0] });
    } else {
      setCurrentPregunta({ ...currentPregunta, [name]: value });
    }
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = currentPregunta.opciones.map((option, idx) =>
      idx === index ? { ...option, [field]: value } : option
    );
    setCurrentPregunta({ ...currentPregunta, opciones: updatedOptions });
  };

  const addOption = () => {
    setCurrentPregunta({
      ...currentPregunta,
      opciones: [
        ...currentPregunta.opciones,
        { texto_opcion: "", es_correcta: false },
      ],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validOptions = currentPregunta.opciones.filter(
      (op) => op.texto_opcion.trim() !== ""
    );

    if (validOptions.length !== currentPregunta.opciones.length) {
      alert("Todas las opciones deben tener texto antes de guardar.");
      return;
    }

    const formData = new FormData();
    formData.append("texto_pregunta", currentPregunta.texto_pregunta);
    formData.append("tipo_pregunta", currentPregunta.tipo_pregunta);
    formData.append("detalles", currentPregunta.detalles);
    formData.append(
      "explicacion_solucion",
      currentPregunta.explicacion_solucion
    );
    formData.append("opciones", JSON.stringify(validOptions));

    if (currentPregunta.imagen && currentPregunta.imagen instanceof File) {
      formData.append(
        "imagen",
        currentPregunta.imagen,
        currentPregunta.imagen.name
      );
    }

    try {
      const method = currentPregunta.pregunta_id ? "put" : "post";
      const url = currentPregunta.pregunta_id
        ? `https://backseriousgame.onrender.com/api/preguntas/${currentPregunta.pregunta_id}`
        : "https://backseriousgame.onrender.com/api/preguntas";

      await axios({
        method: method,
        url: url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModal(false);
      fetchPreguntas();
    } catch (error) {
      console.error(
        "Error al guardar la pregunta:",
        error.response?.data || error.message
      );
    }
  };

  const handleDelete = async (preguntaId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta pregunta?")) {
      try {
        await axios.delete(
          `https://backseriousgame.onrender.com/api/preguntas/${preguntaId}`
        );
        fetchPreguntas();
      } catch (error) {
        console.error("Error al eliminar la pregunta:", error);
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = preguntas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(preguntas.length / itemsPerPage);

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
    <Layout pageTitle="Gestión de Evaluaciones">
      <Container
        fluid
        className="p-4 d-flex flex-column align-items-center justify-content-start"
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
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
            marginBottom: "20px",
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: "bold",
            marginTop: "10px", // Reduce el margen superior
          }}
        >
          Panel de Administración de Evaluación
        </div>
        <div
          className="custom-container"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: "1200px",
          }}
        >
          <Row className="justify-content-md-center">
            <Col xs={12}>
              <Button
                variant="primary"
                className="mb-2 add-button float-end"
                onClick={() => {
                  setCurrentPregunta({
                    pregunta_id: null,
                    texto_pregunta: "",
                    imagen: null,
                    tipo_pregunta: "",
                    detalles: "",
                    explicacion_solucion: "",
                    opciones: [{ texto_opcion: "", es_correcta: false }],
                  });
                  setShowModal(true);
                }}
              >
                <FaPlus /> Agregar Pregunta
              </Button>

              <div className="table-responsive custom-table-container mt-3">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Pregunta</th>
                      <th>Imagen</th>
                      <th>Tipo de Pregunta</th>
                      <th>Detalles</th>
                      <th>Explicación Solución</th>
                      <th>Opciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((pregunta) => (
                      <tr key={pregunta.pregunta_id}>
                        <td>{pregunta.pregunta_id}</td>
                        <td>{pregunta.texto_pregunta}</td>
                        <td>
                          {pregunta.imagen && (
                            <img
                              src={`https://backseriousgame.onrender.com/src/uploads/${pregunta.imagen}`}
                              alt={pregunta.texto_pregunta}
                              className="pregunta-imagen"
                            />
                          )}
                        </td>
                        <td>{pregunta.tipo_pregunta}</td>
                        <td>{pregunta.detalles}</td>
                        <td>{pregunta.explicacion_solucion}</td>
                        <td>
                          {pregunta.opciones.map((opc, idx) => (
                            <div key={idx}>
                              {opc.texto_opcion} (
                              {opc.es_correcta ? "Correcta" : "Incorrecta"})
                            </div>
                          ))}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              variant="warning"
                              onClick={() => {
                                setCurrentPregunta({ ...pregunta });
                                setShowModal(true);
                              }}
                              className="me-2"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDelete(pregunta.pregunta_id)}
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

              <div className="d-flex justify-content-center">
                <Pagination className="mt-3">
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

              <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>
                    {currentPregunta.pregunta_id
                      ? "Editar Pregunta"
                      : "Nueva Pregunta"}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Texto de la Pregunta</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        name="texto_pregunta"
                        value={currentPregunta.texto_pregunta}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Imagen</Form.Label>
                      <Form.Control type="file" onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Pregunta</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        name="tipo_pregunta"
                        value={currentPregunta.tipo_pregunta}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Detalles</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        name="detalles"
                        value={currentPregunta.detalles}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Explicación Solución</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        name="explicacion_solucion"
                        value={currentPregunta.explicacion_solucion}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    {currentPregunta.opciones.map((opcion, index) => (
                      <div key={index} className="mb-3">
                        <Form.Label>Opciones</Form.Label>
                        <div className="option-group">
                          <Form.Control
                            type="text"
                            placeholder="Texto de la opción"
                            value={opcion.texto_opcion || ""}
                            onChange={(e) =>
                              handleOptionChange(
                                index,
                                "texto_opcion",
                                e.target.value
                              )
                            }
                            required
                          />
                          <Form.Check
                            type="checkbox"
                            label="Correcta"
                            checked={opcion.es_correcta}
                            onChange={(e) =>
                              handleOptionChange(
                                index,
                                "es_correcta",
                                e.target.checked
                              )
                            }
                            className="ms-2"
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={addOption}
                      variant="secondary"
                      className="mb-3"
                    >
                      <FaPlus /> Agregar Opción
                    </Button>
                    <Button type="submit" variant="success" className="mt-3">
                      Guardar
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>
            </Col>
          </Row>
        </div>
      </Container>
    </Layout>
  );
};

export default Evaluacion;
