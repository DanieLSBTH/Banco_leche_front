import React, { useState, useContext, useEffect } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash  } from 'react-icons/fa';
import { Galleria } from 'primereact/galleria';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import Swal from 'sweetalert2';
import '../Css/Login.css';
import ChatBotExample from '../ChatBot/ChatBotExample';
import logo from '../Images/backgrounds/Logo_banco2.png';
import fondo1 from '../Images/backgrounds/Fondo_banco-1.jpg';
import fondo2 from '../Images/backgrounds/Fondo_banco-2.jpg';
import fondo3 from '../Images/backgrounds/banco-de-leche.jpg';
import fondo4 from '../Images/backgrounds/Fondo_banco-3.jpg';



const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [snowflakes, setSnowflakes] = useState([]);

  const navigate = useNavigate();


  useEffect(() => {
    // Array de imágenes para la galería
    setImages([
      {
        itemImageSrc: fondo1,
        thumbnailImageSrc: fondo1, // Puedes usar la misma imagen como thumbnail
        alt: 'Banco de Leche 1'
      },
      {
        itemImageSrc: fondo2,
        thumbnailImageSrc: fondo1, // Puedes usar la misma imagen como thumbnail
        alt: 'Banco de Leche 2'
      },
      {
        itemImageSrc: fondo3,
        thumbnailImageSrc: fondo1, // Puedes usar la misma imagen como thumbnail
        alt: 'Banco de Leche 3'
      },
      
      {
        itemImageSrc: fondo4,
        thumbnailImageSrc: fondo1, // Puedes usar la misma imagen como thumbnail
        alt: 'Banco de Leche 4'
      },
      
      
      
      // Agrega más imágenes según necesites
    ]);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
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

  const itemTemplate = (item) => {
    return (
      <img 
        src={item.itemImageSrc} 
        alt={item.alt} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />
    );
  };

  const responsiveOptions = [
    {
      breakpoint: '991px',
      numVisible: 4
    },
    {
      breakpoint: '767px',
      numVisible: 3
    },
    {
      breakpoint: '575px',
      numVisible: 1
    }
  ];
  useEffect(() => {
    // Generate snowflakes
    const generateSnowflakes = () => {
      const snowflakeCount = 20; // Adjust number of snowflakes
      const newSnowflakes = Array.from({ length: snowflakeCount }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        animationDuration: `${5 + Math.random() * 10}s`,
        size: `${5 + Math.random() * 10}px`
      }));
      setSnowflakes(newSnowflakes);
  };

  generateSnowflakes();
  }, []);

  return (
    <div className="login-container">
      <div className="gallery-background">
        <Galleria 
          value={images} 
          responsiveOptions={responsiveOptions} 
          numVisible={1}
          circular 
          autoPlay 
          transitionInterval={3000}
          showThumbnails={false}
          showIndicators
          item={itemTemplate}
        />
      </div>
      
      <div className="login-box">
        <div className="flex justify-center items-center">
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
    type={showPassword ? 'text' : 'password'}
    placeholder="Contraseña"
    value={contrasena}
    onChange={(e) => setContrasena(e.target.value)}
    required
  />
  <button
    type="button"
    onClick={togglePasswordVisibility}
    className="toggle-password"
    aria-label="Mostrar u ocultar contraseña"
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </button>
</div>

          <button type="submit" className="btn-login">INGRESAR</button>
        </form>
        <ChatBotExample></ChatBotExample>
      </div>
    </div>
  );
};

export default Login;