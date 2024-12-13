import React, { useState } from 'react';
import axios from 'axios';
import { Button, Table, Container, Card, CardHeader, CardBody } from 'reactstrap';
import { Calendar } from 'primereact/calendar';
import { locale, addLocale } from 'primereact/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaFilter } from 'react-icons/fa';
import Swal from 'sweetalert2';


// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopDonadoras = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [topDonadoras, setTopDonadoras] = useState({
    extrahospitalario: [],
    intrahospitalario: []
  });
  const [loading, setLoading] = useState(false);

    const handleFiltrar = async () => {
        // Validate date inputs
        if (!fechaInicio || !fechaFin) {
          Swal.fire({
            icon: 'warning',
            title: 'Campos Vacíos',
            text: 'Por favor, completa las fechas de inicio y fin.',
          });
          return;
        }
      
        // Validate that fechaInicio is not greater than fechaFin
        if (new Date(fechaInicio) > new Date(fechaFin)) {
          Swal.fire({
            icon: 'error',
            title: 'Fechas Inválidas',
            text: 'La fecha de inicio no puede ser mayor que la fecha de fin.',
          });
          return;
        }
      
        // Validate that fechaFin is not less than fechaInicio
        if (new Date(fechaFin) < new Date(fechaInicio)) {
          Swal.fire({
            icon: 'error',
            title: 'Fechas Inválidas',
            text: 'La fecha de fin no puede ser menor que la fecha de inicio.',
          });
          return;
        }
      
      
    

    setLoading(true);
    try {
      const response = await axios.get(
        `https://banco-leche-backend.onrender.com/api/donadora_detalle/top-donadoras?fechaInicio=${fechaInicio.toISOString().split('T')[0]}&fechaFin=${fechaFin.toISOString().split('T')[0]}`
      );

      setTopDonadoras(response.data);
      setLoading(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al obtener las donadoras top. Por favor, intenta nuevamente.',
      });
      setLoading(false);
    }
  };

  // Prepare data for charts
  const prepareChartData = (data, type) => {
    const dataset = type === 'extrahospitalario' ? data.extrahospitalario : data.intrahospitalario;
    return {
      labels: dataset.map(d => d.donadora_nombre),
      datasets: [
        {
          label: 'Total Donaciones',
          data: dataset.map(d => parseInt(d.total_donaciones)),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Total Onzas',
          data: dataset.map(d => parseFloat(d.total_onzas)),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        },
        {
          label: 'Total Litros',
          data: dataset.map(d => parseFloat(d.total_litros)),
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
        }
      ]
    };
  };

  addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'MI', 'J', 'V', 'S'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    today: 'Hoy',
    clear: 'Limpiar',
  });

  locale('es');
  return (
    <Container>
      <h3 className="my-4">Madres con Mayor Contribución de Leche Donada </h3>
      
      {/* Date Input Section */}
      <div className="mb-4 text-center">
        <div className="d-inline-block me-3">
          <label htmlFor="fechaInicio" className="me-2">Fecha de Inicio</label>
          <Calendar
            id="fechaInicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.value)}
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Seleccione la fecha de inicio"
          />
        </div>

        <div className="d-inline-block me-3">
          <label htmlFor="fechaFin" className="me-2">Fecha de Fin</label>
          <Calendar
            id="fechaFin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.value)}
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Seleccione la fecha de fin"
          />
        </div>

        <Button color="primary" onClick={handleFiltrar} className="me-2">
          <FaFilter className="me-2" /> Filtrar
        </Button>
      </div>

      {/* Extrahospitalario Section */}
      <Card className="mb-4">
        <CardHeader>Top Donadoras Extrahospitalarias</CardHeader>
        <CardBody>
          <Table striped responsive>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Total Donaciones</th>  
                <th>Total Onzas</th>
                <th>Total Litros</th>
              </tr>
            </thead>
            <tbody>
              {topDonadoras.extrahospitalario.length > 0 ? (
                topDonadoras.extrahospitalario.map((donadora) => (
                  <tr key={donadora.id_donadora}>
                    <td>{donadora.donadora_nombre}</td>
                    <td>{donadora.donadora_apellido}</td>
                    <td>{donadora.total_donaciones}</td>
                    <td>{donadora.total_onzas}</td>
                    <td>{donadora.total_litros}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No hay donadoras extrahospitalarias
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Intrahospitalario Section */}
      <Card className="mb-4">
        <CardHeader>Top Donadoras Intrahospitalarias</CardHeader>
        <CardBody>
          <Table striped responsive>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Total Donaciones</th>
                <th>Total Onzas</th>
                <th>Total Litros</th>
              </tr>
            </thead>
            <tbody>
              {topDonadoras.intrahospitalario.length > 0 ? (
                topDonadoras.intrahospitalario.map((donadora) => (
                  <tr key={donadora.id_donadora}>
                    <td>{donadora.donadora_nombre}</td>
                    <td>{donadora.donadora_apellido}</td>
                    <td>{donadora.total_donaciones}</td> 
                    <td>{donadora.total_onzas}</td>
                    <td>{donadora.total_litros}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No hay donadoras intrahospitalarias
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Extrahospitalario Chart */}
      {topDonadoras.extrahospitalario.length > 0 && (
        <div className="my-5">
          <h4>Visualización de Datos Extrahospitalario</h4>
          <Bar 
            data={prepareChartData(topDonadoras, 'extrahospitalario')}
            options={{ responsive: true }}
          />
        </div>
      )}

      {/* Intrahospitalario Chart */}
      {topDonadoras.intrahospitalario.length > 0 && (
        <div className="my-5">
          <h4>Visualización de Datos Intrahospitalario</h4>
          <Bar 
            data={prepareChartData(topDonadoras, 'intrahospitalario')}
            options={{ responsive: true }}
          />
        </div>
      )}
    </Container>
  );
};

export default TopDonadoras;