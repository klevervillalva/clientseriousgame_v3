import React, { useState, useEffect } from "react";
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
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import "./Conceptos.css";
import Layout from "./Layout";
import backgroundImage from "../img/ciencia.jpg"; // Ruta correcta a tu imagen

const useEjercicios = () => {
  const [ejercicios, setEjercicios] = useState([]);

  useEffect(() => {
    fetchEjercicios();
  }, []);

  const fetchEjercicios = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/getejercicios"
      );
      setEjercicios(response.data);
    } catch (error) {
      console.error("Error al obtener ejercicios:", error);
    }
  };

  const searchEjercicios = async (pregunta) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/buscarejercicios?pregunta=${pregunta}`
      );
      setEjercicios(response.data);
    } catch (error) {
      console.error("Error al buscar ejercicios:", error);
    }
  };

  return { ejercicios, fetchEjercicios, searchEjercicios };
};

const Ejercicios = () => {
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

  const { ejercicios, fetchEjercicios, searchEjercicios } = useEjercicios();
  const [tiposEjercicios, setTiposEjercicios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEjercicio, setCurrentEjercicio] = useState({
    ejercicio_id: null,
    pregunta: "",
    imagen: null,
    tipo_id: "",
    detalles: "",
    mostrar_solucion: false,
    explicacion_solucion: "",
    opciones: [{ texto_opcion: "", es_correcta: false }],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Número de ejercicios por página

  useEffect(() => {
    fetchTiposEjercicios();
  }, []);

  const fetchTiposEjercicios = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/tipos");
      setTiposEjercicios(response.data);
    } catch (error) {
      console.error("Error al obtener los tipos de ejercicios:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setCurrentEjercicio({ ...currentEjercicio, imagen: files[0] });
    } else {
      setCurrentEjercicio({ ...currentEjercicio, [name]: value });
    }
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = currentEjercicio.opciones.map((option, idx) =>
      idx === index ? { ...option, [field]: value } : option
    );
    setCurrentEjercicio({ ...currentEjercicio, opciones: updatedOptions });
  };

  const addOption = () => {
    setCurrentEjercicio({
      ...currentEjercicio,
      opciones: [
        ...currentEjercicio.opciones,
        { texto_opcion: "", es_correcta: false },
      ],
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

    const formData = new FormData();
    formData.append("pregunta", currentEjercicio.pregunta);
    formData.append("tipo_id", currentEjercicio.tipo_id);
    formData.append("detalles", currentEjercicio.detalles);
    formData.append("mostrar_solucion", currentEjercicio.mostrar_solucion);
    formData.append(
      "explicacion_solucion",
      currentEjercicio.explicacion_solucion
    );
    formData.append("opciones", JSON.stringify(validOptions));

    if (currentEjercicio.imagen && currentEjercicio.imagen instanceof File) {
      formData.append(
        "imagen",
        currentEjercicio.imagen,
        currentEjercicio.imagen.name
      );
    }

    try {
      const method = currentEjercicio.ejercicio_id ? "put" : "post";
      const url = currentEjercicio.ejercicio_id
        ? `http://localhost:4000/api/ejercicios/${currentEjercicio.ejercicio_id}`
        : "http://localhost:4000/api/ejercicios";

      await axios({
        method: method,
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
          `http://localhost:4000/api/ejercicios/${ejercicioId}`
        );
        fetchEjercicios();
      } catch (error) {
        console.error("Error al eliminar el ejercicio:", error);
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
                    opciones: [{ texto_opcion: "", es_correcta: false }],
                  });
                  setShowModal(true);
                }}
              >
                <FaPlus /> Agregar Ejercicio
              </Button>

              <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="md"
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    {currentEjercicio.ejercicio_id ? "Editar" : "Agregar"}{" "}
                    Ejercicio
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                    {currentEjercicio.opciones.map((opcion, index) => (
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
                    <th>Mostrar Solución</th>
                    <th>Explicación Solución</th>
                    <th>Opciones</th>
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
                            src={`http://localhost:4000/src/uploads/${ejercicio.imagen}`}
                            alt={`http://localhost:4000/${ejercicio.imagen}`}
                            className="pregunta-imagen"
                            style={{ maxWidth: "100px", maxHeight: "100px" }}
                          />
                        )}
                      </td>
                      <td>{ejercicio.nombre_tipo}</td>
                      <td>{ejercicio.detalles}</td>
                      <td>{ejercicio.mostrar_solucion ? "Sí" : "No"}</td>
                      <td>{ejercicio.explicacion_solucion}</td>
                      <td>
                        {ejercicio.opciones_multiples?.map((opc, idx) => (
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
                              setCurrentEjercicio({
                                ...ejercicio,
                                opciones: ejercicio.opciones_multiples,
                              });
                              setShowModal(true);
                            }}
                            className="me-2"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(ejercicio.ejercicio_id)}
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
