import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, CardBody  } from 'reactstrap';
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
      const response = await axios.get(`https://banco-leche-backend.onrender.com/api/personal_estimulacion?nombre=${value}`);
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
        const response = await axios.get(`https://banco-leche-backend.onrender.com/api/estimulacion/buscar/id_personal_estimulacion?id_personal_estimulacion=${id_personal_estimulacion}`);
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
    <Container fluid className="px-3 px-md-4">
      <Row className="justify-content-center my-4">
        <Col xs={12} lg={10}>
          <h3 className="text-center mb-4">Resumen de Estimulación por Nombre</h3>
          
          {/* Barra de búsqueda responsive */}
          <Row className="justify-content-center mb-4">
            <Col xs={12} sm={8} md={6}>
              <div className="position-relative">
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
                
                {/* Lista de sugerencias mejorada */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="position-absolute w-100 mt-1 shadow-sm bg-white rounded border"
                       style={{ 
                         maxHeight: '200px',
                         overflowY: 'auto',
                         zIndex: 1000,
                         top: '100%'
                       }}>
                    {suggestions.map((person) => (
                      <div
                        key={person.id_personal_estimulacion}
                        className="p-2 border-bottom hover-bg-light"
                        onClick={() => handlePersonSelect(person)}
                        style={{ cursor: 'pointer' }}
                      >
                        {person.nombre} {person.apellido}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* Contenido del resumen */}
          {resumen && (
            <div className="mb-4">
              {/* Card de Estadísticas Generales */}
              <Card className="mb-4 shadow-sm">
                <CardBody>
                  <h5 className="card-title">Estadísticas Generales</h5>
                  <div className="table-responsive">
                    <Table bordered hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Total Personas</th>
                          <th>Promedio Visitas</th>
                          <th>Servicios Frecuentes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{resumen.estadisticas_generales.total_personas_encontradas}</td>
                          <td>{resumen.estadisticas_generales.promedio_visitas_por_persona}</td>
                          <td>
                            {Object.entries(resumen.estadisticas_generales.servicios_mas_frecuentes)
                              .map(([servicio, frecuencia], index) => (
                                <div key={index} className="small">
                                  {servicio}: {frecuencia}
                                </div>
                              ))}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>

              {/* Detalles de personas encontradas */}
              {resumen.resultados.map((persona, index) => (
                <Card key={index} className="mb-4 shadow-sm">
                  <CardBody>
                    <h5 className="card-title">Información Personal</h5>
                    <Row>
                      {/* Columna de información básica */}
                      <Col xs={12} md={6}>
                        <div className="table-responsive">
                          <Table bordered hover size="sm" className="mb-3">
                            <tbody>
                              <tr>
                                <th className="bg-light w-40">ID</th>
                                <td>{persona.informacion_personal.id}</td>
                              </tr>
                              <tr>
                                <th className="bg-light">Nombre</th>
                                <td>{persona.informacion_personal.nombre}</td>
                              </tr>
                              <tr>
                                <th className="bg-light">Apellido</th>
                                <td>{persona.informacion_personal.apellido}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                      
                      {/* Columna de estadísticas */}
                      <Col xs={12} md={6}>
                        <div className="table-responsive">
                          <Table bordered hover size="sm" className="mb-3">
                            <tbody>
                              <tr>
                                <th className="bg-light w-40">Total Visitas</th>
                                <td>{persona.resumen.total_visitas}</td>
                              </tr>
                              <tr>
                                <th className="bg-light">Visitas Nuevas</th>
                                <td>{persona.resumen.total_nuevas}</td>
                              </tr>
                              <tr>
                                <th className="bg-light">Visitas Constantes</th>
                                <td>{persona.resumen.total_constantes}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                    </Row>

                    {/* Fechas importantes */}
                    <Row className="mt-3">
                      <Col xs={12}>
                        <div className="table-responsive">
                          <Table bordered hover size="sm">
                            <tbody>
                              <tr>
                                <th className="bg-light" style={{width: '25%'}}>Primera Visita</th>
                                <td>{persona.resumen.primera_visita}</td>
                                <th className="bg-light" style={{width: '25%'}}>Última Visita</th>
                                <td>{persona.resumen.ultima_visita}</td>
                              </tr>
                              <tr>
                                <th className="bg-light">Días Desde Última</th>
                                <td colSpan="3">{persona.resumen.dias_desde_ultima_visita}</td>
                              </tr>
                              <tr>
                                <th className="bg-light">Servicios Visitados</th>
                                <td colSpan="3">{persona.resumen.servicios_visitados.join(', ')}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                    </Row>

                    {/* Tabla de visitas */}
                    <h6 className="mt-4">Detalles de Visitas</h6>
                    <div className="table-responsive">
                      <Table bordered hover size="sm">
                        <thead className="bg-light">
                          <tr>
                            <th>Fecha</th>
                            <th>Servicio</th>
                            <th>Tipo</th>
                            <th>ID Est.</th>
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
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ResumenEstimulacionNombre;