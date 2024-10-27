// src/components/Dashboard/Dashboard.js
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Grafica from './Grafica';
import ChatBot from '../ChatBot/ChatBot';
const Dashboard = () => {
  const { auth } = useContext(AuthContext);

  return (
    <div>
      <h2>Dashboard</h2>
      <Grafica />
      <ChatBot />
      {auth.user ? (
        <p>Bienvenido, {auth.user.nombre}!</p>
      ) : (
        <p>Cargando información del usuario...</p>
      )}
    </div>
  );
};

export default Dashboard;
