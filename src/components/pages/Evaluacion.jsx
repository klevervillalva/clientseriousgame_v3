import React, { useState, useEffect, useCallback } from "react";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import Layout from "./Layout";
import backgroundImage from "../img/ciencia.jpg";
import "./Conceptos.css";
import "./modal.css";

const usePreguntas = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  const fetchPreguntas = useCallback(async () => {
    try {
      let url = "https://back-serious-game.vercel.app/api/preguntas/obtener";
      if (filter) {
        url = `https://back-serious-game.vercel.app/api/evaluaciones/preguntas/${filter}`;
      }
      if (stateFilter) {
        url = `https://back-serious-game.vercel.app/api/evaluaciones/activos?estado=${stateFilter}`;
      }
      if (searchQuery) {
        url = `https://back-serious-game.vercel.app/api/search/${encodeURIComponent(
          searchQuery
        )}`;
      }

      const token = localStorage.getItem("token");
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPreguntas(response.data);
    } catch (error) {
      console.error("Error al obtener preguntas:", error);
    }
  }, [searchQuery, filter, stateFilter]);

  useEffect(() => {
    fetchPreguntas();
  }, [fetchPreguntas]);

  return {
    preguntas,
    fetchPreguntas,
    setSearchQuery,
    setFilter,
    setStateFilter,
  };
};

const Evaluacion = () => {
  const {
    preguntas,
    fetchPreguntas,
    setSearchQuery,
    setFilter,
    setStateFilter,
  } = usePreguntas();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [preguntaToDelete, setPreguntaToDelete] = useState(null);
  const [conceptos, setConceptos] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [currentPregunta, setCurrentPregunta] = useState({
    pregunta_id: null,
    texto_pregunta: "",
    imagen: null,
    tipo_pregunta: "Selección Múltiple",
    detalles: "",
    explicacion_solucion: "",
    estado: true,
    opciones: [
      { texto_opcion: "", es_correcta: false },
      { texto_opcion: "", es_correcta: false },
      { texto_opcion: "", es_correcta: false },
      { texto_opcion: "", es_correcta: false },
    ],
    concepto_id: null,
    ejercicio_id: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchConceptos();
    fetchEjercicios();
  }, []);

  const fetchConceptos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://back-serious-game.vercel.app/api/getconceptos/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setConceptos(response.data);
    } catch (error) {
      console.error("Error al obtener conceptos:", error);
    }
  };

  const fetchEjercicios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://back-serious-game.vercel.app/api/getejercicios/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEjercicios(response.data);
    } catch (error) {
      console.error("Error al obtener ejercicios:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setCurrentPregunta({ ...currentPregunta, imagen: files[0] });
    } else if (type === "checkbox") {
      setCurrentPregunta({ ...currentPregunta, [name]: e.target.checked });
    } else {
      setCurrentPregunta({ ...currentPregunta, [name]: value || null });
    }
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = currentPregunta.opciones.map((option, idx) =>
      idx === index ? { ...option, [field]: value } : option
    );
    setCurrentPregunta({ ...currentPregunta, opciones: updatedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validOptions = currentPregunta.opciones.filter(
      (op) => op.texto_opcion.trim() !== ""
    );

    if (validOptions.length !== currentPregunta.opciones.length) {
      toast.error("Todas las opciones deben tener texto antes de guardar.");
      return;
    }

    const correctOptions = currentPregunta.opciones.filter(
      (op) => op.es_correcta
    );

    if (correctOptions.length === 0) {
      toast.error("Debe seleccionar al menos una opción correcta.");
      return;
    }

    if (!currentPregunta.concepto_id && !currentPregunta.ejercicio_id) {
      toast.error("Debe seleccionar un Concepto o un Ejercicio Asociado.");
      return;
    }

    const formData = new FormData();
    formData.append("texto_pregunta", currentPregunta.texto_pregunta);
    formData.append("tipo_pregunta", "Selección Múltiple");
    formData.append("detalles", currentPregunta.detalles);
    formData.append(
      "explicacion_solucion",
      currentPregunta.explicacion_solucion
    );
    formData.append("estado", currentPregunta.estado);
    formData.append("opciones", JSON.stringify(validOptions));
    formData.append(
      "concepto_id",
      currentPregunta.concepto_id !== null ? currentPregunta.concepto_id : ""
    );
    formData.append(
      "ejercicio_id",
      currentPregunta.ejercicio_id !== null ? currentPregunta.ejercicio_id : ""
    );

    if (currentPregunta.imagen && currentPregunta.imagen instanceof File) {
      formData.append(
        "imagen",
        currentPregunta.imagen,
        currentPregunta.imagen.name
      );
    } else {
      formData.append("imagenExistente", currentPregunta.imagen);
    }

    try {
      const method = currentPregunta.pregunta_id ? "put" : "post";
      const url = currentPregunta.pregunta_id
        ? `https://back-serious-game.vercel.app/api/preguntas/${currentPregunta.pregunta_id}`
        : "https://back-serious-game.vercel.app/api/preguntas";

      const token = localStorage.getItem("token");
      await axios({
        method: method,
        url: url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setShowModal(false);
      fetchPreguntas();
      toast.success(
        `Pregunta ${
          currentPregunta.pregunta_id ? "actualizada" : "agregada"
        } exitosamente.`
      );
    } catch (error) {
      console.error(
        "Error al guardar la pregunta:",
        error.response?.data || error.message
      );
      toast.error(
        `Error al guardar la pregunta: ${error.response?.data || error.message}`
      );
    }
  };

  const handleDelete = async () => {
    if (preguntaToDelete) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://back-serious-game.vercel.app/api/preguntas/${preguntaToDelete}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        fetchPreguntas();
        toast.success("Pregunta eliminada exitosamente.");
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error al eliminar la pregunta:", error);
        toast.error(
          "Hubo un error al eliminar la pregunta. Inténtalo de nuevo."
        );
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const form = e.target;
    const pregunta = form.elements["search_pregunta"].value;
    const filter = form.elements["filter"].value;
    const stateFilter = form.elements["state_filter"].value;
    setSearchQuery(pregunta);
    setFilter(filter);
    setStateFilter(stateFilter);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = preguntas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(preguntas.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEstadoChange = async (pregunta) => {
    const updatedPregunta = { ...pregunta, estado: !pregunta.estado };

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://back-serious-game.vercel.app/api/preguntas/${pregunta.pregunta_id}`,
        {
          ...updatedPregunta,
          concepto_id: updatedPregunta.concepto_id || null,
          ejercicio_id: updatedPregunta.ejercicio_id || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchPreguntas();
      toast.success("Estado de la pregunta actualizado.");
    } catch (error) {
      console.error("Error al actualizar el estado de la pregunta:", error);
      toast.error("Error al actualizar el estado de la pregunta.");
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    if (name === "concepto_id") {
      setCurrentPregunta({
        ...currentPregunta,
        concepto_id: value ? Number(value) : null,
        ejercicio_id: value ? null : currentPregunta.ejercicio_id,
      });
    } else if (name === "ejercicio_id") {
      setCurrentPregunta({
        ...currentPregunta,
        ejercicio_id: value ? Number(value) : null,
        concepto_id: value ? null : currentPregunta.concepto_id,
      });
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 10;
    const startPage = Math.max(
      1,
      Math.min(
        currentPage - Math.floor(maxVisiblePages / 2),
        totalPages - maxVisiblePages + 1
      )
    );
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    return items;
  };

  return (
    <Layout pageTitle="Gestión de Evaluaciones">
      <ToastContainer />
      <Container
        fluid
        className="p-4 d-flex flex-column align-items-center justify-content-start"
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: "30px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "15px",
            borderRadius: "15px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            maxWidth: "1200px",
            width: "100%",
            marginBottom: "20px",
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Panel de Administración de Evaluación
        </div>

        <Form
          onSubmit={handleSearch}
          className="d-flex justify-content-between mb-3 w-100 search-form"
          style={{ maxWidth: "1200px" }}
        >
          <Form.Control
            type="text"
            name="search_pregunta"
            placeholder="Buscar por pregunta"
            className="me-2"
            style={{ flex: "1" }}
          />
          <Form.Control
            as="select"
            name="filter"
            className="me-2"
            style={{ flex: "1" }}
          >
            <option value="">Seleccionar Filtro</option>
            <option value="conceptos">Conceptos</option>
            <option value="ejercicios">Ejercicios</option>
          </Form.Control>
          <Form.Control
            as="select"
            name="state_filter"
            className="me-2"
            style={{ flex: "1" }}
          >
            <option value="">Seleccionar Estado</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </Form.Control>
          <Button type="submit" variant="primary">
            <FaSearch /> Buscar
          </Button>
        </Form>

        <div
          className="custom-container"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: "1200px",
            overflowY: "auto",
            maxHeight: "500px",
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
                    tipo_pregunta: "Selección Múltiple",
                    detalles: "",
                    explicacion_solucion: "",
                    estado: true,
                    opciones: [
                      { texto_opcion: "", es_correcta: false },
                      { texto_opcion: "", es_correcta: false },
                      { texto_opcion: "", es_correcta: false },
                      { texto_opcion: "", es_correcta: false },
                    ],
                    concepto_id: null,
                    ejercicio_id: null,
                  });
                  setShowModal(true);
                }}
              >
                <FaPlus /> Agregar Pregunta
              </Button>

              <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="lg"
                dialogClassName="modal-70vh"
              >
                <Modal.Header className="modal-header-custom" closeButton>
                  <Modal.Title className="modal-title-custom">
                    {currentPregunta.pregunta_id ? "Editar" : "Agregar"}{" "}
                    Pregunta
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3 custom-input">
                      <Form.Label>Texto de la Pregunta</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        name="texto_pregunta"
                        value={currentPregunta.texto_pregunta}
                        onChange={handleInputChange}
                        placeholder="Escribe la pregunta"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3 custom-input">
                      <Form.Label>Imagen</Form.Label>
                      <Form.Control type="file" onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3 custom-input">
                      <Form.Label>Tipo de Pregunta</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        name="tipo_pregunta"
                        value={currentPregunta.tipo_pregunta}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </Form.Group>
                    <Form.Group className="mb-3 custom-input">
                      <Form.Label>Detalles</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        required
                        name="detalles"
                        value={currentPregunta.detalles}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3 custom-input">
                      <Form.Label>Explicación Solución</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        required
                        name="explicacion_solucion"
                        value={currentPregunta.explicacion_solucion}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3 custom-input">
                      <Form.Check
                        type="checkbox"
                        label="Activo"
                        name="estado"
                        checked={currentPregunta.estado}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3 custom-input">
                      <Form.Label>Concepto</Form.Label>
                      <Form.Control
                        as="select"
                        name="concepto_id"
                        value={currentPregunta.concepto_id || ""}
                        onChange={handleSelectChange}
                        required={!currentPregunta.ejercicio_id}
                      >
                        <option value="">Seleccionar Concepto</option>
                        {conceptos.map((concepto) => (
                          <option
                            key={concepto.concepto_id}
                            value={concepto.concepto_id}
                          >
                            {concepto.titulo}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3 custom-input">
                      <Form.Label>Ejercicio Asociado</Form.Label>
                      <Form.Control
                        as="select"
                        name="ejercicio_id"
                        value={currentPregunta.ejercicio_id || ""}
                        onChange={handleSelectChange}
                        required={!currentPregunta.concepto_id}
                      >
                        <option value="">Seleccionar Ejercicio</option>
                        {ejercicios.map((ejercicio) => (
                          <option
                            key={ejercicio.ejercicio_id}
                            value={ejercicio.ejercicio_id}
                          >
                            {ejercicio.pregunta}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3 custom-input">
                      <Form.Label>Opciones</Form.Label>
                      {currentPregunta.opciones.map((opcion, index) => (
                        <div key={index} className="mb-3">
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
                    </Form.Group>
                    <Button type="submit" variant="success" className="mt-3">
                      Guardar
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>

              <Table striped bordered hover responsive className="mt-2">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Pregunta</th>
                    <th>Imagen</th>
                    <th>Tipo de Pregunta</th>
                    <th>Detalles</th>
                    <th>Explicación Solución</th>
                    <th>Opciones</th>
                    <th>Estado</th>
                    <th>Concepto</th>
                    <th>Ejercicio Asociado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((pregunta, index) => (
                    <tr key={pregunta.pregunta_id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{pregunta.texto_pregunta}</td>
                      <td>
                        {pregunta.imagen && (
                          <img
                            src={`https://back-serious-game.vercel.app/src/uploads/${pregunta.imagen}`}
                            alt={pregunta.texto_pregunta}
                            className="pregunta-imagen"
                            style={{ maxWidth: "100px", maxHeight: "100px" }}
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
                        <Form.Check
                          type="checkbox"
                          checked={pregunta.estado}
                          onChange={() => handleEstadoChange(pregunta)}
                        />
                      </td>
                      <td>{pregunta.concepto_titulo || "N/A"}</td>
                      <td>
                        {ejercicios.find(
                          (ej) => ej.ejercicio_id === pregunta.ejercicio_id
                        )?.pregunta || "N/A"}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="warning"
                            onClick={() => {
                              setCurrentPregunta({
                                ...pregunta,
                                tipo_pregunta: "Selección Múltiple",
                              });
                              setShowModal(true);
                            }}
                            className="me-2 btn-sm"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => {
                              setPreguntaToDelete(pregunta.pregunta_id);
                              setShowDeleteModal(true);
                            }}
                            className="btn-sm"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {renderPaginationItems()}
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
        </div>
      </Container>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        dialogClassName="modal-50w no-scroll"
      >
        <Modal.Header className="modal-header-custom" closeButton>
          <Modal.Title className="modal-title-custom">
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <p>¿Estás seguro de que deseas eliminar esta pregunta?</p>
          <div className="d-flex justify-content-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="me-2"
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Evaluacion;
