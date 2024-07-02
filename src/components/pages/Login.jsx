import React, { useState, useContext } from "react";
import {
  Form,
  Button,
  Card,
  Alert,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../img/utn.png";
import { AuthContext } from "../pages/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Usa el contexto de autenticación

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await axios.post(
        "https://back-serious-game.vercel.app/api/auth/login",
        { email, password }
      );
      console.log("Login successful:", response.data);

      login(response.data.token); // Utiliza el método login del contexto

      localStorage.setItem("user", JSON.stringify(response.data.user));

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      navigate("/homepage");
    } catch (error) {
      console.error("Login error:", error.response);
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        paddingTop: "40px",
        width: "100%",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "15px",
          padding: "20px 40px",
          fontSize: "2rem",
          color: "black",
          textAlign: "center",
          width: "90%",
          maxWidth: "800px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          position: "absolute",
          top: "10px",
        }}
      >
        Mendel's Legacy Admin
      </div>
      <Card
        className="shadow-lg"
        style={{
          maxWidth: "500px",
          width: "90%",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "80px",
        }}
      >
        <Card.Body>
          <h2 className="text-center mb-3">Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>
                <FontAwesomeIcon icon={faEnvelope} className="me-2" /> Correo
                electrónico
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faEnvelope} />
                </InputGroup.Text>
                <FormControl
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>
                <FontAwesomeIcon icon={faLock} className="me-2" /> Contraseña
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faLock} />
                </InputGroup.Text>
                <FormControl
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <InputGroup.Text onClick={togglePasswordVisibility}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Iniciar sesión
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Login;
