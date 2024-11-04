import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Container } from 'reactstrap';
import { FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';

const ResumenDonadoraNombre = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Función para buscar sugerencias de donadoras
  const fetchSuggestions = async (value) => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`https://banco-leche-backend.onrender.com/api/donadora?nombre=${value}`);
      setSuggestions(response.data.donadoras);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para manejar el debounce de la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = async (id_donadora) => {
    if (id_donadora) {
      try {
        const response = await axios.get(`https://banco-leche-backend.onrender.com/api/donadora_detalle/buscar/id_donadora?id_donadora=${id_donadora}`);
        setResumen(response.data);
        setShowSuggestions(false);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al obtener los datos. Por favor, intenta nuevamente.',
        });
      }
    }
  };

  const handleDonadoraSelect = (donadora) => {
    setSearchTerm(`${donadora.nombre} ${donadora.apellido}`);
    setShowSuggestions(false);
    handleSearch(donadora.id_donadora);
  };

  return (
    <Container>
      <h3 className="my-4">Resumen de Donaciones por Donadora</h3>
      
      <div className="mb-4 text-center position-relative">
        <div className="d-flex justify-content-center align-items-center">
          <div className="position-relative" style={{ minWidth: '300px' }}>
            <input
              type="text"
              placeholder="Ingrese el nombre de la donadora"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              className="form-control"
              onFocus={() => setShowSuggestions(true)}
            />
            
            {/* Lista de sugerencias */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                className="position-absolute w-100 mt-1 shadow-sm bg-white rounded border"
                style={{ 
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}
              >
                {suggestions.map((donadora) => (
                  <div
                    key={donadora.id}
                    className="p-2 border-bottom cursor-pointer"
                    onClick={() => handleDonadoraSelect(donadora)}
                    style={{ cursor: 'pointer' }}
                  >
                    {donadora.nombre} {donadora.apellido}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mostrar resumen de donaciones */}
      {resumen && (
        <>
          <div className="mb-4">
            <h5>Estadísticas Generales</h5>
            <Table bordered>
              <thead>
                <tr>
                  <th>Total Donadoras Encontradas</th>
                  <th>Total Donaciones</th>
                  <th>Promedio Donaciones por Donadora</th>
                  <th>Total Onzas Recolectadas</th>
                  <th>Total Litros Recolectados</th>
                  <th>Servicios Más Frecuentes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{resumen.estadisticas_generales.total_donadoras_encontradas}</td>
                  <td>{resumen.estadisticas_generales.total_donaciones}</td>
                  <td>{resumen.estadisticas_generales.promedio_donaciones_por_donadora}</td>
                  <td>{resumen.estadisticas_generales.total_onzas_recolectadas}</td>
                  <td>{resumen.estadisticas_generales.total_litros_recolectados}</td>
                  <td>
                    {Object.entries(resumen.estadisticas_generales.servicios_mas_frecuentes).map(
                      ([servicio, frecuencia], index) => (
                        <div key={index}>
                          {servicio}: {frecuencia}
                        </div>
                      )
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>

          <div className="mb-4">
            <h5>Detalles de Donadoras Encontradas</h5>
            {resumen.resultados.map((donadora, index) => (
              <div key={index} className="mb-4">
                <h6>Información Personal</h6>
                <Table bordered>
                  <tbody>
                    <tr>
                      <th>ID</th>
                      <td>{donadora.informacion_personal.id}</td>
                    </tr>
                    <tr>
                      <th>Nombre</th>
                      <td>{donadora.informacion_personal.nombre} </td>
                    </tr>
                    <tr>
                      <th>Apellido</th>
                      <td>{donadora.informacion_personal.apellido}</td>
                    </tr>
                    <tr>
                      <th>Total Donaciones</th>
                      <td>{donadora.resumen.total_donaciones}</td>
                    </tr>
                    <tr>
                      <th>Primera Donación</th>
                      <td>{donadora.resumen.primera_donacion}</td>
                    </tr>
                    <tr>
                      <th>Última Donación</th>
                      <td>{donadora.resumen.ultima_donacion}</td>
                    </tr>
                    <tr>
                      <th>Donacion Nuevas</th>
                      <td>{donadora.resumen.total_nuevas}</td>
                    </tr>
                    <tr>
                      <th>Donaciones Constantes</th>
                      <td>{donadora.resumen.total_constantes}</td>
                    </tr>
                    <tr>
                      <th>Servicios Visitados</th>
                      <td>{donadora.resumen.servicios_visitados.join(', ')}</td>
                    </tr>
                    <tr>
                      <th>Personal que Atendió</th>
                      <td>{donadora.resumen.personal_atendio.join(', ')}</td>
                    </tr>
                    <tr>
                      <th>Días Desde Última Donación</th>
                      <td>{donadora.resumen.dias_desde_ultima_donacion}</td>
                    </tr>
                    <tr>
                      <th>Promedio Onzas por Donación</th>
                      <td>{donadora.resumen.promedio_onzas_por_donacion}</td>
                    </tr>
                  </tbody>
                </Table>

                <h6>Detalles de Donaciones</h6>
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>No. Frasco</th>
                      <th>Onzas</th>
                      <th>Litros</th>
                      <th>Servicio</th>
                      <th>Tipo de Servicio</th>
                      <th>Personal que Atendió</th>
                      <th>Tipo de Donación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donadora.donaciones.map((donacion, dIndex) => (
                      <tr key={dIndex}>
                        <td>{donacion.fecha}</td>
                        <td>{donacion.no_frasco}</td>
                        <td>{donacion.onzas}</td>
                        <td>{donacion.litros}</td>
                        <td>{donacion.servicio}</td>
                        <td>{donacion.tipo_servicio}</td>
                        <td>{donacion.personal_atendio}</td>
                        <td>{donacion.tipo.nueva ? 'Nueva' : 'Constante'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ))}
          </div>
        </>
      )}
    </Container>
  );
};

export default ResumenDonadoraNombre;
