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
import { FaPlus, FaEdit, FaTrash, FaQuestionCircle } from "react-icons/fa";
import Layout from "./Layout";
import backgroundImage from "../img/ciencia.jpg";
import "./modal.css";

const Conceptos = () => {
  const [conceptos, setConceptos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [show, setShow] = useState(false);
  const [showModalPregunta, setShowModalPregunta] = useState(false);
  const [currentConcepto, setCurrentConcepto] = useState({
    titulo: "",
    descripcion: "",
    imagen: null,
    categoria_id: "",
    estado: true,
    concepto_id: null,
  });
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
  });

  const [search, setSearch] = useState("");
  const [searchCategoria, setSearchCategoria] = useState("");
  const [searchEstado, setSearchEstado] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchConceptos();
    fetchCategorias();
  }, []);

  const fetchConceptos = async (
    searchQuery = "",
    searchCategoria = "",
    searchEstado = ""
  ) => {
    let url = "https://back-serious-game.vercel.app/api/getconceptos/";
    let params = {};

    if (searchEstado !== "") {
      url = "https://back-serious-game.vercel.app/api/search/state";
      params = { estado: searchEstado };
    } else {
      params = {
        titulo: searchQuery,
        categoria_id: searchCategoria,
      };
    }

    const { data } = await axios.get(url, { params });
    setConceptos(data);
  };

  const fetchCategorias = async () => {
    try {
      const { data } = await axios.get(
        "https://back-serious-game.vercel.app/api/categorias"
      );
      setCategorias(data);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  const handleDelete = async (concepto_id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este concepto?")) {
      try {
        const response = await axios.delete(
          `https://back-serious-game.vercel.app/api/deleteconceptos/${concepto_id}`
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
      estado: concepto.estado !== undefined ? concepto.estado : true,
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
      estado: true,
      concepto_id: null,
    });
  };

  const handleShowModalPregunta = (concepto) => {
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
      concepto_id: concepto.concepto_id,
    });
    setShowModalPregunta(true);
  };

  const handleCloseModalPregunta = () => {
    setShowModalPregunta(false);
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
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("titulo", currentConcepto.titulo);
    formData.append("descripcion", currentConcepto.descripcion);
    formData.append("categoria_id", currentConcepto.categoria_id);
    formData.append("estado", currentConcepto.estado);
    if (currentConcepto.imagen instanceof File) {
      formData.append("imagen", currentConcepto.imagen);
    } else if (currentConcepto.imagen) {
      formData.append("imagenExistente", currentConcepto.imagen);
    }

    const method = currentConcepto.concepto_id ? "put" : "post";
    const url = currentConcepto.concepto_id
      ? `https://back-serious-game.vercel.app/api/edit/${currentConcepto.concepto_id}`
      : "https://back-serious-game.vercel.app/api/postconceptos/";

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

  const handlePreguntaSubmit = async (e) => {
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
    formData.append("concepto_id", currentPregunta.concepto_id);

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
        ? `https://back-serious-game.vercel.app/api/preguntas/${currentPregunta.pregunta_id}`
        : "https://back-serious-game.vercel.app/api/preguntas";

      await axios({
        method: method,
        url: url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModalPregunta(false);
    } catch (error) {
      console.error(
        "Error al guardar la pregunta:",
        error.response?.data || error.message
      );
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchConceptos(search, searchCategoria, searchEstado);
  };

  const handleEstadoChange = async (concepto) => {
    const updatedConcepto = { ...concepto, estado: !concepto.estado };
    try {
      const response = await axios.put(
        `https://back-serious-game.vercel.app/api/edit/${concepto.concepto_id}`,
        updatedConcepto
      );
      setConceptos(
        conceptos.map((c) =>
          c.concepto_id === concepto.concepto_id ? response.data : c
        )
      );
    } catch (error) {
      console.error("Error al actualizar el estado del concepto:", error);
    }
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = currentPregunta.opciones.map((option, idx) =>
      idx === index ? { ...option, [field]: value } : option
    );
    setCurrentPregunta({ ...currentPregunta, opciones: updatedOptions });
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
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por título"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
                <Col md={4}>
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
                  <Form.Control
                    as="select"
                    value={searchEstado}
                    onChange={(e) => setSearchEstado(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="true">Activos</option>
                    <option value="false">Inactivos</option>
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
                      <th>Estado</th>
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
                              src={`https://back-serious-game.vercel.app/src/uploads/${concepto.imagen}`}
                              alt="Concepto"
                              className="concepto-imagen"
                            />
                          ) : (
                            <div style={{ width: "100px", height: "100px" }} />
                          )}
                        </td>
                        <td>{concepto.categoria}</td>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={concepto.estado}
                            onChange={() => handleEstadoChange(concepto)}
                          />
                        </td>
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
                            <Button
                              variant="info"
                              onClick={() => handleShowModalPregunta(concepto)}
                            >
                              <FaQuestionCircle />
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

        <Modal
          show={show}
          onHide={handleClose}
          size="lg"
          dialogClassName="modal-50w no-scroll"
          aria-labelledby="example-custom-modal-styling-title"
        >
          <Modal.Header className="modal-header-custom" closeButton>
            <Modal.Title className="modal-title-custom">
              {currentConcepto.concepto_id
                ? "Editar Concepto"
                : "Agregar Nuevo Concepto"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3 custom-input">
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
              <Form.Group className="mb-3 custom-input">
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
              <Form.Group className="mb-3 custom-input">
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
                        src={`https://back-serious-game.vercel.app/src/uploads/${currentConcepto.imagen}`}
                        alt="Concepto"
                        className="concepto-imagen"
                      />
                    </div>
                  )}
              </Form.Group>
              <Form.Group className="mb-3 custom-input">
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
              <Form.Group className="mb-3 custom-input">
                <Form.Label>Estado</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Activo"
                  checked={currentConcepto.estado}
                  onChange={(e) =>
                    setCurrentConcepto({
                      ...currentConcepto,
                      estado: e.target.checked,
                    })
                  }
                />
              </Form.Group>
              <Button variant="success" type="submit" className="custom-btn">
                {currentConcepto.concepto_id
                  ? "Actualizar Concepto"
                  : "Agregar Concepto"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal
          show={showModalPregunta}
          onHide={handleCloseModalPregunta}
          dialogClassName="modal-50w no-scroll"
        >
          <Modal.Header className="modal-header-custom" closeButton>
            <Modal.Title className="modal-title-custom">
              {currentPregunta.pregunta_id ? "Editar" : "Agregar"} Pregunta
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom">
            <Form onSubmit={handlePreguntaSubmit}>
              <Form.Group className="mb-3 custom-input">
                <Form.Label>Texto de la Pregunta</Form.Label>
                <Form.Control
                  type="text"
                  required
                  name="texto_pregunta"
                  value={currentPregunta.texto_pregunta}
                  onChange={(e) =>
                    setCurrentPregunta({
                      ...currentPregunta,
                      texto_pregunta: e.target.value,
                    })
                  }
                  placeholder="Escribe la pregunta"
                />
              </Form.Group>
              <Form.Group className="mb-3 custom-input">
                <Form.Label>Imagen</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) =>
                    setCurrentPregunta({
                      ...currentPregunta,
                      imagen: e.target.files[0],
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3 custom-input">
                <Form.Label>Tipo de Pregunta</Form.Label>
                <Form.Control
                  type="text"
                  required
                  name="tipo_pregunta"
                  value={currentPregunta.tipo_pregunta}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3 custom-input">
                <Form.Label>Detalles</Form.Label>
                <Form.Control
                  type="text"
                  required
                  name="detalles"
                  value={currentPregunta.detalles}
                  onChange={(e) =>
                    setCurrentPregunta({
                      ...currentPregunta,
                      detalles: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3 custom-input">
                <Form.Label>Explicación Solución</Form.Label>
                <Form.Control
                  type="text"
                  required
                  name="explicacion_solucion"
                  value={currentPregunta.explicacion_solucion}
                  onChange={(e) =>
                    setCurrentPregunta({
                      ...currentPregunta,
                      explicacion_solucion: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3 custom-input">
                <Form.Check
                  type="checkbox"
                  label="Activo"
                  name="estado"
                  checked={currentPregunta.estado}
                  onChange={(e) =>
                    setCurrentPregunta({
                      ...currentPregunta,
                      estado: e.target.checked,
                    })
                  }
                />
              </Form.Group>
              <Form.Label>Agregar Opciones</Form.Label>
              {currentPregunta.opciones.map((opcion, index) => (
                <div key={index} className="mb-3 custom-input">
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
              <Button type="submit" variant="success" className="mt-3">
                Guardar
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </Layout>
  );
};

export default Conceptos;
