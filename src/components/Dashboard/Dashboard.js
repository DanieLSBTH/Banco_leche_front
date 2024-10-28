// src/components/Dashboard/Dashboard.js
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Grafica from './Grafica';

const Dashboard = () => {
  const { auth } = useContext(AuthContext);

  return (
    <div>
      <h2>Dashboard</h2>
      <Grafica />
      
      {auth.user ? (
        <p>Bienvenido, {auth.user.nombre}!</p>
      ) : (
        <p>Cargando información del usuario...</p>
      )}
    </div>
  );
};

export default Dashboard;
