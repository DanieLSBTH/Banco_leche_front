import React, { useState } from 'react';
import axios from 'axios';
import { Button, Table, Container } from 'reactstrap';
import { FaFilter, FaPrint } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Calendar } from 'primereact/calendar';
import { locale, addLocale } from 'primereact/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import logo from '../Images/backgrounds/Logo_banco2.png';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResumenEstimulacion = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [resumen, setResumen] = useState(null);

  const handleFiltrar = async () => {
    if (fechaInicio && fechaFin) {
      try {
        const response = await axios.get(
          `https://banco-leche-backend.onrender.com/api/estimulacion/estimulacion-resumen?fechaInicio=${fechaInicio.toISOString().split('T')[0]}&fechaFin=${fechaFin.toISOString().split('T')[0]}`
        );
        setResumen(response.data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al obtener el resumen. Por favor, intenta nuevamente.',
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Vacíos',
        text: 'Por favor, completa las fechas de inicio y fin.',
      });
    }
  };

  const handlePrint = async () => {
    if (!resumen) return;

    const doc = new jsPDF();

    const imgLogo = new Image();
    imgLogo.src = logo;
    doc.addImage(imgLogo, 'PNG', 10, 10, 30, 30);

    const fechaInicioFormatted = fechaInicio ? fechaInicio.toLocaleDateString() : 'N/A';
    const fechaFinFormatted = fechaFin ? fechaFin.toLocaleDateString() : 'N/A';
    doc.setFontSize(12);
    doc.text('Dr. Miguel Angel Soto Galindo', 75, 20);
    doc.text('Coordinador Banco de Leche Humana', 69, 25);
    doc.text('Jefe Departamento de Pediatría ', 75, 30);
    doc.setFontSize(14);
    doc.text(`Resumen de Estimulación de ${fechaInicioFormatted} a ${fechaFinFormatted}`, 50, 43);

    // Totales generales
    doc.autoTable({
      head: [['Total Estimulaciones', 'Total Nuevas', 'Total Constantes', 'Total Personas']],
      body: [[resumen.totalEstimulaciones,resumen.totalNuevas, resumen.totalConstantes, resumen.totalPersonas ]],
      startY: 45,
    });

    // Servicios Intrahospitalarios
    doc.autoTable({
      head: [['Servicio Intrahospitalario', 'Total Estimulaciones', 'Total Nuevas', 'Total Constantes']],
      body: resumen.serviciosIntrahospitalarios.map(servicio => [
        servicio.servicio,
        servicio.total_estimulaciones,
        servicio.total_nuevas,
        servicio.total_constantes
      ]),
      margin: { top: 60 },
    });

    // Servicios Extrahospitalarios
    doc.autoTable({
      head: [['Servicio Extrahospitalario', 'Total Estimulaciones', 'Total Nuevas', 'Total Constantes']],
      body: resumen.serviciosExtrahospitalarios.map(servicio => [
        servicio.servicio,
        servicio.total_estimulaciones,
        servicio.total_nuevas,
        servicio.total_constantes
      ]),
      margin: { top: doc.lastAutoTable.finalY + 10 },
    });

    const chart = document.getElementById('graficoEstimulacion');
    const canvasGrafica = await html2canvas(chart);
    const imgGrafica = canvasGrafica.toDataURL('image/png');
    doc.addImage(imgGrafica, 'PNG', 10, doc.lastAutoTable.finalY + 10, 190, 100);

    doc.save('ResumenEstimulacion.pdf');
  };

  const prepareChartData = () => {
    if (!resumen) return { labels: [], datasets: [] };

    // Combine intrahospitalarios and extrahospitalarios
    const allServicios = [
      ...resumen.serviciosIntrahospitalarios,
      ...resumen.serviciosExtrahospitalarios
    ];

    return {
      labels: allServicios.map(servicio => servicio.servicio),
      datasets: [
        {
          label: 'Total Estimulaciones por Servicio',
          data: allServicios.map(servicio => servicio.total_estimulaciones),
          backgroundColor: 'rgba(75, 192, 192, 0.6)', 
        },
        {
          label: 'Total Nuevas',
          data: allServicios.map(servicio => servicio.total_nuevas),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        },
        {
          label: 'Total Constantes',
          data: allServicios.map(servicio => servicio.total_constantes),
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
        },

      ],
    };
  };

  addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    monthNamesShort: [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ],
    today: 'Hoy',
    clear: 'Limpiar',
  });

  locale('es');

  return (
    <Container>
      <h3 className="my-4">Resumen de Estimulación</h3>
      
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

        <Button color="primary" onClick={handleFiltrar}>
          <FaFilter className="me-2" /> Filtrar
        </Button>
      </div>

      {resumen && (
        <div className="mb-4">
          <h5>Totales Generales</h5>
          <Table bordered>
            <thead>
              <tr>
                <th>Total Estimulaciones</th>
                <th>Total Nuevas</th>
                <th>Total Constantes</th>
                <th>Total Personas</th>
               

              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{resumen.totalEstimulaciones}</td>
                <td>{resumen.totalNuevas}</td>
                <td>{resumen.totalConstantes}</td>
                <td>{resumen.totalPersonas}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      )}

      <Button color="secondary" onClick={handlePrint}>
        <FaPrint className="me-2" /> Imprimir Resumen
      </Button>

      {resumen && (
        <>
          <div className="mt-4">
            <h5>Servicios Intrahospitalarios</h5>
            <Table striped responsive>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Total Estimulaciones</th>
                  <th>Total Nuevas</th>
                  <th>Total Constantes</th>
                </tr>
              </thead>
              <tbody>
                {resumen.serviciosIntrahospitalarios.map((servicio, index) => (
                  <tr key={index}>
                    <td>{servicio.servicio}</td>
                    <td>{servicio.total_estimulaciones}</td>
                    <td>{servicio.total_nuevas}</td>
                    <td>{servicio.total_constantes}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="mt-4">
            <h5>Servicios Extrahospitalarios</h5>
            <Table striped responsive>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Total Estimulaciones</th>
                  <th>Total Nuevas</th>
                  <th>Total Constantes</th>
                </tr>
              </thead>
              <tbody>
                {resumen.serviciosExtrahospitalarios.map((servicio, index) => (
                  <tr key={index}>
                    <td>{servicio.servicio}</td>
                    <td>{servicio.total_estimulaciones}</td>
                    <td>{servicio.total_nuevas}</td>
                    <td>{servicio.total_constantes}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}

      <div className="my-5" id="graficoEstimulacion">
        <h4>Visualización de Datos por Servicio</h4>
        <Bar data={prepareChartData()} options={{ responsive: true }} />
      </div>
    </Container>
  );
};

export default ResumenEstimulacion;