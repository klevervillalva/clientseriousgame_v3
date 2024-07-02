import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import './styles.css';

import Login from "./components/pages/Login";
import Principal from "./components/pages/Principal";
import UserAdd from './components/pages/UserAdd';
import Perfil from './components/pages/Perfil';
import Usuarios from "./components/pages/Usuarios";
import Conceptos from "./components/pages/Conceptos";
import Ejercicios from "./components/pages/Ejercicios";
import Evaluacion from "./components/pages/Evaluacion";
import Categorias from "./components/pages/Categorias";
import { AuthProvider } from "./components/pages/AuthContext";
import PrivateRoute from "./components/pages/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/homepage" element={<PrivateRoute><Principal /></PrivateRoute>} />
          <Route path="/add-user" element={<PrivateRoute><UserAdd /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
          <Route path="/conceptos" element={<PrivateRoute><Conceptos /></PrivateRoute>} />
          <Route path="/ejercicios" element={<PrivateRoute><Ejercicios /></PrivateRoute>} />
          <Route path="/evaluacion" element={<PrivateRoute><Evaluacion /></PrivateRoute>} />
          <Route path="/categorias" element={<PrivateRoute><Categorias/></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
