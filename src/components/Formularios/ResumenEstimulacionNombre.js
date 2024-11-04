import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Container } from 'reactstrap';
import { FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';

const ResumenEstimulacionNombre = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Función para buscar sugerencias
  const fetchSuggestions = async (value) => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:8080/api/personal_estimulacion?nombre=${value}`);
      setSuggestions(response.data.personal_estimulaciones);
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

  const handleSearch = async (id_personal_estimulacion) => {
    if (id_personal_estimulacion) {
      try {
        const response = await axios.get(`http://localhost:8080/api/estimulacion/buscar/id_personal_estimulacion?id_personal_estimulacion=${id_personal_estimulacion}`);
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

  const handlePersonSelect = (person) => {
    setSearchTerm(`${person.nombre} ${person.apellido}`);
    setShowSuggestions(false);
    handleSearch(person.id_personal_estimulacion); // Realiza la búsqueda automáticamente con solo el nombre
  };

  return (
    <Container>
      <h3 className="my-4">Resumen de Estimulación por Nombre</h3>
      
      <div className="mb-4 text-center position-relative">
        <div className="d-flex justify-content-center align-items-center">
          <div className="position-relative" style={{ minWidth: '300px' }}>
            <input
              type="text"
              placeholder="Ingrese el nombre"
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
                {suggestions.map((person) => (
                  <div
                    key={person.id_personal_estimulacion}
                    className="p-2 border-bottom cursor-pointer hover:bg-gray-100"
                    onClick={() => handlePersonSelect(person)}
                    style={{ cursor: 'pointer' }}
                  >
                    {person.nombre} {person.apellido}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* El resto del código para mostrar el resumen permanece igual */}
      {resumen && (
        <>
          <div className="mb-4">
            <h5>Estadísticas Generales</h5>
            <Table bordered>
              <thead>
                <tr>
                  <th>Total Personas Encontradas</th>
                  <th>Promedio Visitas por Persona</th>
                  <th>Servicios Más Frecuentes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{resumen.estadisticas_generales.total_personas_encontradas}</td>
                  <td>{resumen.estadisticas_generales.promedio_visitas_por_persona}</td>
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
            <h5>Detalles de Personas Encontradas</h5>
            {resumen.resultados.map((persona, index) => (
              <div key={index} className="mb-4">
                <h6>Información Personal</h6>
                <Table bordered>
                  <tbody>
                    <tr>
                      <th>ID</th>
                      <td>{persona.informacion_personal.id}</td>
                    </tr>
                    <tr>
                      <th>Nombre</th>
                      <td>{persona.informacion_personal.nombre}</td>
                    </tr>
                    <tr>
                      <th>Apellido</th>
                      <td> {persona.informacion_personal.apellido}</td>
                    </tr>
                    <tr>
                      <th>Total Visitas</th>
                      <td>{persona.resumen.total_visitas}</td>
                    </tr>
                    <tr>
                      <th>Primera Visita</th>
                      <td>{persona.resumen.primera_visita}</td>
                    </tr>
                    <tr>
                      <th>Última Visita</th>
                      <td>{persona.resumen.ultima_visita}</td>
                    </tr>
                    <tr>
                      <th>Total Nuevas</th>
                      <td>{persona.resumen.total_nuevas}</td>
                    </tr>
                    <tr>
                      <th>Total Constantes</th>
                      <td>{persona.resumen.total_constantes}</td>
                    </tr>
                    <tr>
                      <th>Servicios Visitados</th>
                      <td>{persona.resumen.servicios_visitados.join(', ')}</td>
                    </tr>
                    <tr>
                      <th>Días Desde Última Visita</th>
                      <td>{persona.resumen.dias_desde_ultima_visita}</td>
                    </tr>
                  </tbody>
                </Table>

                <h6>Detalles de Visitas</h6>
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Servicio</th>
                      <th>Tipo de Visita</th>
                      <th>ID Estimulación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {persona.visitas.map((visita, vIndex) => (
                      <tr key={vIndex}>
                        <td>{visita.fecha}</td>
                        <td>{visita.servicio}</td>
                        <td>{visita.tipo.nueva ? 'Nueva' : 'Constante'}</td>
                        <td>{visita.id_estimulacion}</td>
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

export default ResumenEstimulacionNombre;