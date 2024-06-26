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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/homepage" element={<Principal />} />
        <Route path="/add-user" element={<UserAdd />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/conceptos" element={<Conceptos />} />
        <Route path="/ejercicios" element={<Ejercicios />} />
        <Route path="/evaluacion" element={<Evaluacion />} />
        <Route path="/categorias" element={<Categorias/>} />
      </Routes>
    </Router>
  );
}

export default App;
