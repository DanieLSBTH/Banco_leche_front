import React, { useContext, useState,useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Container, Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaHospital, FaRobot, FaComments, FaCommentAlt, FaPaperPlane, FaUsers, FaFemale, FaUserNurse, FaHospitalUser, FaUserMd, FaBaby, FaClipboard, FaChartLine, FaSignOutAlt, FaHeartbeat, FaFlask, FaWater, FaHandsHelping } from 'react-icons/fa';
import './Navbar.css';
import logo from '../Images/backgrounds/Logo_bancon.png';


const NavbarComponent = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (auth.token) {
      // Pequeño retraso para asegurar que los elementos del DOM estén listos
      setTimeout(() => setAnimate(true), 100);
    } else {
      setAnimate(false);
    }
  }, [auth.token]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const NavContent = () => (
    <>
      <Nav className={`me-auto ${animate ? 'nav-animate' : ''}`}>
        <Link className="nav-link" to="/dashboard" onClick={handleClose}>
          <FaChartLine /> <span>Dashboard</span>
        </Link>
        <Link className="nav-link" to="/showpersonal" onClick={handleClose}>
          <FaUserNurse /> <span>Personal</span>
        </Link>
        <Link className="nav-link" to="/showusuario" onClick={handleClose}>
          <FaUserNurse /> <span>Usuario</span>
        </Link>
        <Link className="nav-link" to="/showstimulation" onClick={handleClose}>
          <FaHeartbeat /> <span>Estimulacion</span>
        </Link>
        <NavDropdown title={<><FaUsers /> <span>Donadoras</span></>} id="donadoras-dropdown">
          <Link className="dropdown-item" to="/showdonadoradetalle" onClick={handleClose}>
            <FaBaby /> Donadora Detalle
          </Link>
          <Link className="dropdown-item" to="/showdonadora" onClick={handleClose}>
            <FaFemale /> Donadora
          </Link>
        </NavDropdown>
        <NavDropdown title={<><FaHospitalUser /> <span>Servicios</span></>} id="servicios-dropdown">
          <Link className="dropdown-item" to="/showservicioex" onClick={handleClose}>
            <FaUserNurse /> ServicioEx
          </Link>
          <Link className="dropdown-item" to="/showservicioin" onClick={handleClose}>
            <FaUserMd /> ServicioIn
          </Link>
        </NavDropdown>
        <Link className="nav-link" to="/Showpasteurizacion" onClick={handleClose}>
          <FaFlask /> <span>Pasteurización</span>
        </Link>
        <Link className="nav-link" to="/Showcontrolleche" onClick={handleClose}>
          <FaWater /> <span>Control Leche</span>
        </Link>
        <Link className="nav-link" to="/Showsolicitudleche" onClick={handleClose}>
          <FaHandsHelping /> <span>Solicitud</span>
        </Link>
        
        <NavDropdown title={<><FaRobot /> <span>Bot</span></>} id="bot-dropdown">
          <Link className="dropdown-item" to="/showchat" onClick={handleClose}>
            <FaComments /> Chat-tema
          </Link>
          <Link className="dropdown-item" to="/showsubchat" onClick={handleClose}>
            <FaCommentAlt /> Chat-sub-tema
          </Link>
          <Link className="dropdown-item" to="/showchatrespuestas" onClick={handleClose}>
            <FaPaperPlane /> Chat-respuesta
          </Link>
          <Link className="dropdown-item" to="/chatbotexample" onClick={handleClose}>
          <FaRobot /> <span>ChatBot</span>
        </Link>
        </NavDropdown>
      </Nav>
      <Button variant="outline-light" onClick={handleLogout} className="logout-btn">
        <FaSignOutAlt /> Cerrar Sesión
      </Button>
      
    </>
    
  );

  return (
    <Navbar expand="lg" className="navbar" variant="dark">
      <Container fluid>
      <Navbar.Brand as={Link} to="/" className="navbar-logo ms-0"> {/* Añadimos ms-0 para quitar margen izquierdo */}
          <img
            src={logo}
            width="80"
            height="80"
            className="d-inline-block align-top"
            alt="Logo"
          />
        </Navbar.Brand>
        {!auth.token && (
          <div className="navbar-centered-title">
            <h1>Banco de leche humana</h1>
            <h2>Departamento de pediatría</h2>
          </div>
        )}

        <Navbar.Toggle aria-controls="navbar-content" onClick={handleShow} />
        
        {/* Desktop view */}
        <Navbar.Collapse id="navbar-content" className="d-none d-lg-flex justify-content-end">
       
          {auth.token && <NavContent />}
          
        </Navbar.Collapse>
        
        
        {/* Mobile view */}
        <Offcanvas show={show} onHide={handleClose} placement="end" className="d-lg-none">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
          
            {auth.token && <NavContent />}
            
          </Offcanvas.Body>
        </Offcanvas>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;