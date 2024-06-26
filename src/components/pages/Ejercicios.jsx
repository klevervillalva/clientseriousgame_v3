import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  Form,
  Table,
  Pagination,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { FaPlus, FaTrash, FaSearch, FaQuestion, FaEdit } from "react-icons/fa";
import "./ejercicios.css";
import Layout from "./Layout";
import backgroundImage from "../img/ciencia.jpg";

const useEjercicios = () => {
  const [ejercicios, setEjercicios] = useState([]);

  useEffect(() => {
    fetchEjercicios();
  }, []);

  const fetchEjercicios = async () => {
    try {
      const response = await axios.get(
        "https://back-serious-game.vercel.app/api/getejercicios"
      );
      setEjercicios(response.data);
    } catch (error) {
      console.error("Error al obtener ejercicios:", error);
    }
  };

  const searchEjercicios = async (pregunta) => {
    try {
      const response = await axios.get(
        `https://back-serious-game.vercel.app/api/buscarejercicios?pregunta=${pregunta}`
      );
      setEjercicios(response.data);
    } catch (error) {
      console.error("Error al buscar ejercicios:", error);
    }
  };

  return { ejercicios, fetchEjercicios, searchEjercicios };
};

const usePreguntas = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPreguntas = useCallback(async () => {
    try {
      const response = await axios.get(
        searchQuery
          ? `https://back-serious-game.vercel.app/api/search/${encodeURIComponent(
              searchQuery
            )}`
          : "https://back-serious-game.vercel.app/api/preguntas/obtener"
      );
      setPreguntas(response.data);
    } catch (error) {
      console.error("Error al obtener preguntas:", error);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPreguntas();
  }, [searchQuery, fetchPreguntas]);

  return { preguntas, fetchPreguntas, setSearchQuery };
};

const Ejercicios = () => {
  const { ejercicios, fetchEjercicios, searchEjercicios } = useEjercicios();
  const { fetchPreguntas } = usePreguntas();
  const [tiposEjercicios, setTiposEjercicios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEjercicio, setCurrentEjercicio] = useState({
    ejercicio_id: null,
    pregunta: "",
    imagen: null,
    tipo_id: "",
    detalles: "",
    mostrar_solucion: false,
    explicacion_solucion: "",
    opciones: Array(4).fill({ texto_opcion: "", es_correcta: false }),
    matriz_punnett: Array(4).fill({ alelo1: "", alelo2: "", resultado: "" }),
    estado: true, // Agregado estado por defecto
  });
  const [showAddPreguntaModal, setShowAddPreguntaModal] = useState(false);
  const [currentPregunta, setCurrentPregunta] = useState({
    pregunta_id: null,
    texto_pregunta: "",
    imagen: null,
    tipo_pregunta: "Selección Múltiple",
    detalles: "",
    explicacion_solucion: "",
    estado: true,
    opciones: [{ texto_opcion: "", es_correcta: false }],
    concepto_id: null,
    ejercicio_id: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Número de ejercicios por página

  useEffect(() => {
    fetchTiposEjercicios();
  }, []);

  const fetchTiposEjercicios = async () => {
    try {
      const response = await axios.get("https://back-serious-game.vercel.app/api/tipos");
      setTiposEjercicios(response.data);
    } catch (error) {
      console.error("Error al obtener los tipos de ejercicios:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setCurrentEjercicio({ ...currentEjercicio, imagen: files[0] });
    } else if (type === "checkbox") {
      setCurrentEjercicio({ ...currentEjercicio, [name]: e.target.checked });
    } else {
      setCurrentEjercicio({ ...currentEjercicio, [name]: value || null });
    }
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = currentEjercicio.opciones.map((option, idx) =>
      idx === index ? { ...option, [field]: value } : option
    );
    setCurrentEjercicio({ ...currentEjercicio, opciones: updatedOptions });
  };

  const handlePunnettChange = (index, field, value) => {
    const updatedPunnett = currentEjercicio.matriz_punnett.map((cell, idx) =>
      idx === index ? { ...cell, [field]: value } : cell
    );
    setCurrentEjercicio({
      ...currentEjercicio,
      matriz_punnett: updatedPunnett,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validOptions = currentEjercicio.opciones.filter(
      (op) => op.texto_opcion.trim() !== ""
    );
    if (validOptions.length !== currentEjercicio.opciones.length) {
      alert("Todas las opciones deben tener texto antes de guardar.");
      return;
    }

    if (currentEjercicio.tipo_id === "1") {
      const hasCorrectOption = currentEjercicio.opciones.some(
        (op) => op.es_correcta
      );
      if (!hasCorrectOption) {
        alert("Debe haber al menos una opción correcta seleccionada.");
        return;
      }
    }

    if (currentEjercicio.tipo_id === "2") {
      const validPunnett = currentEjercicio.matriz_punnett.filter(
        (cell) =>
          cell.alelo1.trim() !== "" &&
          cell.alelo2.trim() !== "" &&
          cell.resultado.trim() !== ""
      );
      if (validPunnett.length !== currentEjercicio.matriz_punnett.length) {
        alert(
          "Todas las celdas de la matriz Punnett deben tener texto antes de guardar."
        );
        return;
      }
    }

    const formData = new FormData();
    formData.append("pregunta", currentEjercicio.pregunta);
    formData.append("tipo_id", currentEjercicio.tipo_id);
    formData.append("detalles", currentEjercicio.detalles);
    formData.append("mostrar_solucion", currentEjercicio.mostrar_solucion);
    formData.append(
      "explicacion_solucion",
      currentEjercicio.explicacion_solucion
    );
    formData.append("estado", currentEjercicio.estado); // Agregado estado
    formData.append("opcionesMultiples", JSON.stringify(validOptions));

    if (currentEjercicio.tipo_id === "2") {
      const validPunnett = currentEjercicio.matriz_punnett.filter(
        (cell) =>
          cell.alelo1.trim() !== "" &&
          cell.alelo2.trim() !== "" &&
          cell.resultado.trim() !== ""
      );
      formData.append("matrizPunnett", JSON.stringify(validPunnett));
    }

    if (currentEjercicio.imagen && currentEjercicio.imagen instanceof File) {
      formData.append(
        "imagen",
        currentEjercicio.imagen,
        currentEjercicio.imagen.name
      );
    }

    try {
      const url = currentEjercicio.ejercicio_id
        ? `https://back-serious-game.vercel.app/api/updateejercicio/${currentEjercicio.ejercicio_id}`
        : "https://back-serious-game.vercel.app/api/postejercicios";

      await axios({
        method: currentEjercicio.ejercicio_id ? "put" : "post",
        url: url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModal(false);
      fetchEjercicios();
    } catch (error) {
      console.error(
        "Error al guardar el ejercicio:",
        error.response?.data || error.message
      );
    }
  };

  const handleDelete = async (ejercicioId) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar este ejercicio?")
    ) {
      try {
        await axios.delete(
          `https://back-serious-game.vercel.app/api/deleteejercicio/${ejercicioId}`
        );
        fetchEjercicios(); // Refresca la lista de ejercicios
      } catch (error) {
        console.error("Error al eliminar el ejercicio:", error);
        alert("Hubo un error al eliminar el ejercicio. Inténtalo de nuevo.");
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const form = e.target;
    const pregunta = form.elements["search_pregunta"].value;
    await searchEjercicios(pregunta);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ejercicios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ejercicios.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEstadoChange = async (ejercicio) => {
    const updatedEjercicio = { ...ejercicio, estado: !ejercicio.estado };

    try {
      await axios.put(
        `https://back-serious-game.vercel.app/api/updateejercicio/${ejercicio.ejercicio_id}`,
        updatedEjercicio
      );
      fetchEjercicios();
    } catch (error) {
      console.error("Error al actualizar el estado del ejercicio:", error);
    }
  };

  const handleAddPreguntaChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setCurrentPregunta({ ...currentPregunta, imagen: files[0] });
    } else if (type === "checkbox") {
      setCurrentPregunta({ ...currentPregunta, [name]: e.target.checked });
    } else {
      setCurrentPregunta({ ...currentPregunta, [name]: value || null });
    }
  };

  const handleAddPreguntaOptionChange = (index, field, value) => {
    const updatedOptions = currentPregunta.opciones.map((option, idx) =>
      idx === index ? { ...option, [field]: value } : option
    );
    setCurrentPregunta({ ...currentPregunta, opciones: updatedOptions });
  };

  const addPreguntaOption = () => {
    setCurrentPregunta({
      ...currentPregunta,
      opciones: [
        ...currentPregunta.opciones,
        { texto_opcion: "", es_correcta: false },
      ],
    });
  };

  const handleAddPreguntaSubmit = async (e) => {
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
    }

    try {
      const url = "https://back-serious-game.vercel.app/api/preguntas";

      await axios({
        method: "post",
        url: url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowAddPreguntaModal(false);
      fetchPreguntas();
    } catch (error) {
      console.error(
        "Error al guardar la pregunta:",
        error.response?.data || error.message
      );
    }
  };

  const handleEdit = async (ejercicioId) => {
    try {
      const response = await axios.get(
        `https://back-serious-game.vercel.app/api/getejercicios/${ejercicioId}`
      );
      const ejercicio = response.data;
      setCurrentEjercicio({
        ejercicio_id: ejercicio.ejercicio_id,
        pregunta: ejercicio.pregunta,
        imagen: null,
        tipo_id: ejercicio.tipo_id.toString(),
        detalles: ejercicio.detalles,
        mostrar_solucion: ejercicio.mostrar_solucion,
        explicacion_solucion: ejercicio.explicacion_solucion,
        opciones:
          ejercicio.opciones_multiples ||
          Array(4).fill({ texto_opcion: "", es_correcta: false }),
        matriz_punnett:
          ejercicio.matriz_punnett ||
          Array(4).fill({ alelo1: "", alelo2: "", resultado: "" }),
        estado: ejercicio.estado,
      });
      setIsEditing(true);
      setShowModal(true);
    } catch (error) {
      console.error("Error al obtener el ejercicio:", error);
    }
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
    <Layout pageTitle="Gestión de Ejercicios">
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
          Panel de Administración de Ejercicios
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
            overflowY: "auto", // Permitir desplazamiento vertical en el contenedor
            maxHeight: "500px", // Ajustar esta altura según tus necesidades
          }}
        >
          <Row className="justify-content-md-center">
            <Col xs={12}>
              <Button
                variant="primary"
                className="mb-2 add-button float-end"
                onClick={() => {
                  setCurrentEjercicio({
                    ejercicio_id: null,
                    pregunta: "",
                    imagen: null,
                    tipo_id: "",
                    detalles: "",
                    mostrar_solucion: false,
                    explicacion_solucion: "",
                    opciones: Array(4).fill({
                      texto_opcion: "",
                      es_correcta: false,
                    }),
                    matriz_punnett: Array(4).fill({
                      alelo1: "",
                      alelo2: "",
                      resultado: "",
                    }),
                    estado: true, // Agregado estado por defecto
                  });
                  setIsEditing(false);
                  setShowModal(true);
                }}
              >
                <FaPlus /> Agregar Ejercicio
              </Button>

              <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="lg" // Tamaño aumentado del modal
                centered // Centrar el modal verticalmente
              >
                <Modal.Header closeButton className="modal-header-custom">
                  <Modal.Title>
                    {currentEjercicio.ejercicio_id ? "Editar" : "Agregar"}{" "}
                    Ejercicio
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pregunta</Form.Label>
                      <Form.Control
                        type="text"
                        name="pregunta"
                        required
                        value={currentEjercicio.pregunta}
                        onChange={handleInputChange}
                        placeholder="Escribe la pregunta"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Imagen</Form.Label>
                      <Form.Control type="file" onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Ejercicio</Form.Label>
                      <Form.Control
                        as="select"
                        name="tipo_id"
                        required
                        value={currentEjercicio.tipo_id}
                        onChange={handleInputChange}
                        disabled={isEditing}
                      >
                        <option value="">Seleccionar tipo</option>
                        {tiposEjercicios.map((tipo) => (
                          <option key={tipo.tipo_id} value={tipo.tipo_id}>
                            {tipo.nombre_tipo}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Detalles</Form.Label>
                      <Form.Control
                        type="text"
                        name="detalles"
                        required
                        value={currentEjercicio.detalles}
                        onChange={handleInputChange}
                        placeholder="Detalles adicionales"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Mostrar Solución"
                        name="mostrar_solucion"
                        checked={currentEjercicio.mostrar_solucion}
                        onChange={(e) =>
                          setCurrentEjercicio({
                            ...currentEjercicio,
                            mostrar_solucion: e.target.checked,
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Explicación de la Solución</Form.Label>
                      <Form.Control
                        type="text"
                        name="explicacion_solucion"
                        required
                        value={currentEjercicio.explicacion_solucion}
                        onChange={handleInputChange}
                        placeholder="Explica la solución"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Activo"
                        name="estado"
                        checked={currentEjercicio.estado}
                        onChange={handleInputChange}
                      />
                    </Form.Group>

                    {currentEjercicio.tipo_id === "1" && (
                      <>
                        <Form.Label>Opciones</Form.Label>
                        {currentEjercicio.opciones.map((opcion, index) => (
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
                      </>
                    )}

                    {currentEjercicio.tipo_id === "2" && (
                      <>
                        <Form.Label>Opciones</Form.Label>
                        {currentEjercicio.opciones.map((opcion, index) => (
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

                        <Form.Label>Llene los datos para la matriz de Punnett</Form.Label>
                        {currentEjercicio.matriz_punnett.map((cell, index) => (
                          <Row key={index} className="mb-3">
                            <Col>
                              <Form.Control
                                type="text"
                                placeholder="Alelo 1"
                                value={cell.alelo1 || ""}
                                onChange={(e) =>
                                  handlePunnettChange(
                                    index,
                                    "alelo1",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </Col>
                            <Col>
                              <Form.Control
                                type="text"
                                placeholder="Alelo 2"
                                value={cell.alelo2 || ""}
                                onChange={(e) =>
                                  handlePunnettChange(
                                    index,
                                    "alelo2",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </Col>
                            <Col>
                              <Form.Control
                                type="text"
                                placeholder="Resultado"
                                value={cell.resultado || ""}
                                onChange={(e) =>
                                  handlePunnettChange(
                                    index,
                                    "resultado",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </Col>
                          </Row>
                        ))}
                      </>
                    )}

                    <Button type="submit" variant="success" className="mt-3">
                      Guardar
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>

              <Modal
                show={showAddPreguntaModal}
                onHide={() => setShowAddPreguntaModal(false)}
                size="md"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Agregar Pregunta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={handleAddPreguntaSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Texto de la Pregunta</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        name="texto_pregunta"
                        value={currentPregunta.texto_pregunta}
                        onChange={handleAddPreguntaChange}
                        placeholder="Escribe la pregunta"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Imagen</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={handleAddPreguntaChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Pregunta</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        name="tipo_pregunta"
                        value={currentPregunta.tipo_pregunta}
                        onChange={handleAddPreguntaChange}
                        readOnly
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Detalles</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        name="detalles"
                        value={currentPregunta.detalles}
                        onChange={handleAddPreguntaChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Explicación Solución</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        name="explicacion_solucion"
                        value={currentPregunta.explicacion_solucion}
                        onChange={handleAddPreguntaChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Activo"
                        name="estado"
                        checked={currentPregunta.estado}
                        onChange={handleAddPreguntaChange}
                      />
                    </Form.Group>
                    <Form.Label>Opciones</Form.Label>
                    {currentPregunta.opciones.map((opcion, index) => (
                      <div key={index} className="mb-3">
                        <div className="option-group">
                          <Form.Control
                            type="text"
                            placeholder="Texto de la opción"
                            value={opcion.texto_opcion || ""}
                            onChange={(e) =>
                              handleAddPreguntaOptionChange(
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
                              handleAddPreguntaOptionChange(
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
                      onClick={addPreguntaOption}
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

              <Table
                striped
                bordered
                hover
                responsive
                className="mt-2 table-responsive"
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Pregunta</th>
                    <th>Imagen</th>
                    <th>Tipo de Ejercicio</th>
                    <th>Detalles</th>
                    <th>Explicación Solución</th>
                    <th>Opciones</th>
                    <th>Punnett</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((ejercicio) => (
                    <tr key={ejercicio.ejercicio_id}>
                      <td>{ejercicio.ejercicio_id}</td>
                      <td>{ejercicio.pregunta}</td>
                      <td>
                        {ejercicio.imagen && (
                          <img
                            src={`https://back-serious-game.vercel.app/src/uploads/${ejercicio.imagen}`}
                            alt={`https://back-serious-game.vercel.app/${ejercicio.imagen}`}
                            className="pregunta-imagen"
                            style={{ maxWidth: "100px", maxHeight: "100px" }}
                          />
                        )}
                      </td>
                      <td>{ejercicio.nombre_tipo}</td>
                      <td>{ejercicio.detalles}</td>
                      <td>{ejercicio.explicacion_solucion}</td>
                      <td>
                        {ejercicio.opciones_multiples[0]
                          ? ejercicio.opciones_multiples?.map((opc, idx) => (
                              <div key={idx}>
                                {opc.texto_opcion}(
                                {opc.es_correcta ? "Correcta" : "Incorrecta"})
                              </div>
                            ))
                          : "No existe"}
                      </td>
                      <td>
                        {ejercicio.matriz_punnett[0]
                          ? ejercicio.matriz_punnett?.map((cell, idx) => (
                              <div key={idx}>
                                {cell.alelo1} x {cell.alelo2} = {cell.resultado}
                              </div>
                            ))
                          : "No existe"}
                      </td>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={ejercicio.estado}
                          onChange={() => handleEstadoChange(ejercicio)}
                        />
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(ejercicio.ejercicio_id)}
                          >
                            <FaTrash />
                          </Button>
                          <Button
                            variant="warning"
                            onClick={() => handleEdit(ejercicio.ejercicio_id)}
                            className="ms-2"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="primary"
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
                                ],
                                concepto_id: null,
                                ejercicio_id: ejercicio.ejercicio_id,
                              });
                              setShowAddPreguntaModal(true);
                            }}
                            className="ms-2"
                          >
                            <FaQuestion />
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
        </div>
      </Container>
    </Layout>
  );
};

export default Ejercicios;
