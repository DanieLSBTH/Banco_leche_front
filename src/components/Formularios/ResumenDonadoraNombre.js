import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, CardBody } from 'reactstrap';
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
    <Container fluid className="px-3 px-md-4">
      <Row className="justify-content-center my-4">
        <Col xs={12} lg={10}>
          <h3 className="text-center mb-4">Resumen de Donaciones por Donadora</h3>
          
          {/* Barra de búsqueda responsive */}
          <Row className="justify-content-center mb-4">
            <Col xs={12} sm={8} md={6}>
              <div className="position-relative">
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
                
                {/* Lista de sugerencias con scroll en móviles */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="position-absolute w-100 mt-1 shadow-sm bg-white rounded border"
                       style={{ 
                         maxHeight: '200px',
                         overflowY: 'auto',
                         zIndex: 1000,
                         top: '100%'
                       }}>
                    {suggestions.map((donadora) => (
                      <div
                        key={donadora.id}
                        className="p-2 border-bottom hover-bg-light"
                        onClick={() => handleDonadoraSelect(donadora)}
                        style={{ cursor: 'pointer' }}
                      >
                        {donadora.nombre} {donadora.apellido}
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
              <Card className="mb-4">
                <CardBody>
                  <h5 className="card-title">Estadísticas Generales</h5>
                  <div className="table-responsive">
                    <Table bordered hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Total Donadoras</th>
                          <th>Total Donaciones</th>
                          <th>Promedio por Donadora</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{resumen.estadisticas_generales.total_donadoras_encontradas}</td>
                          <td>{resumen.estadisticas_generales.total_donaciones}</td>
                          <td>{resumen.estadisticas_generales.promedio_donaciones_por_donadora}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                  
                  <div className="table-responsive mt-3">
                    <Table bordered hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Total Onzas</th>
                          <th>Total Litros</th>
                          <th>Servicios Frecuentes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{resumen.estadisticas_generales.total_onzas_recolectadas}</td>
                          <td>{resumen.estadisticas_generales.total_litros_recolectados}</td>
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

              {/* Detalles de donadoras */}
              {resumen.resultados.map((donadora, index) => (
                <Card key={index} className="mb-4">
                  <CardBody>
                    <h5 className="card-title">Información Personal</h5>
                    <Row>
                      <Col xs={12} md={6}>
                        <div className="table-responsive">
                          <Table bordered hover className="mb-3">
                            <tbody>
                              <tr>
                                <th className="bg-light" style={{width: '40%'}}>ID</th>
                                <td>{donadora.informacion_personal.id}</td>
                              </tr>
                              <tr>
                                <th className="bg-light">Nombre</th>
                                <td>{donadora.informacion_personal.nombre}</td>
                              </tr>
                              <tr>
                                <th className="bg-light">Apellido</th>
                                <td>{donadora.informacion_personal.apellido}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="table-responsive">
                          <Table bordered hover className="mb-3">
                            <tbody>
                              <tr>
                                <th className="bg-light" style={{width: '40%'}}>Total Donaciones</th>
                                <td>{donadora.resumen.total_donaciones}</td>
                              </tr>
                              <tr>
                                <th className="bg-light">Donaciones Nuevas</th>
                                <td>{donadora.resumen.total_nuevas}</td>
                              </tr>
                              <tr>
                                <th className="bg-light">Donaciones Constantes</th>
                                <td>{donadora.resumen.total_constantes}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                    </Row>

                    <h6 className="mt-4">Detalles de Donaciones</h6>
                    <div className="table-responsive">
                      <Table bordered hover size="sm">
                        <thead className="bg-light">
                          <tr>
                            <th>Fecha</th>
                            <th>No. Frasco</th>
                            <th>Onzas</th>
                            <th>Servicio</th>
                            <th>Personal</th>
                            <th>Tipo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donadora.donaciones.map((donacion, dIndex) => (
                            <tr key={dIndex}>
                              <td>{donacion.fecha}</td>
                              <td>{donacion.no_frasco}</td>
                              <td>{donacion.onzas}</td>
                              <td>{donacion.servicio}</td>
                              <td>{donacion.personal_atendio}</td>
                              <td>{donacion.tipo.nueva ? 'Nueva' : 'Constante'}</td>
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

export default ResumenDonadoraNombre;