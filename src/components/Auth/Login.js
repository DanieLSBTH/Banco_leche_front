// src/components/Auth/Login.js
import React, { useState, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa'
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import Swal from 'sweetalert2';
import { useSpring, animated } from '@react-spring/web';
import '../Css/Login.css'; // Archivo CSS personalizado
import ChatBotExample from '../ChatBot/ChatBotExample';
import logo from '../Images/backgrounds/Logo_banco2.png';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/usuarios/login', { correo, contrasena });
      login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
      <div className="flex justify-center items-center h-screen">
          <img src={logo} alt="Logo" className="custom-logo-size" />
        </div>
      <h2>Iniciar Sesión</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser className="icon" />
            <input
              type="email"
              placeholder="Usuario"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <FaLock className="icon" />
            <input
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-login">INGRESAR</button>
        </form>
        <ChatBotExample></ChatBotExample>
      </div>
    </div>
  );
};

export default Login;