import React, { useState } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, CardBody } from 'reactstrap';
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
import logo2 from '../Images/backgrounds/logo_msp.png';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResumenPorServicio = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [resumenExtra, setResumenExtra] = useState([]);
  const [resumenIntra, setResumenIntra] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFiltrar = async () => {
    if (fechaInicio && fechaFin) {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/donadora_detalle/stats/?fecha_inicio=${fechaInicio.toISOString().split('T')[0]}&fecha_fin=${fechaFin.toISOString().split('T')[0]}`
        );
        
        const { data } = response;
        
        setResumenExtra(data.litros_por_servicio.extrahospitalario);
        setResumenIntra(data.litros_por_servicio.intrahospitalario);
        setEstadisticas(data.estadisticas_generales);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al obtener el resumen. Por favor, intenta nuevamente.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Vacíos',
        text: 'Por favor, completa las fechas de inicio y fin.',
      });
    }
  };

  // Función para generar el PDF
  const handlePrint = async () => {
    const doc = new jsPDF();

    // Añadir logo
    const imgLogo = new Image();
    imgLogo.src = logo;
    doc.addImage(imgLogo, 'PNG', 10, 10, 35, 33);

    const imgLogo2 = new Image();
    imgLogo2.src = logo2;
    doc.addImage(imgLogo2, 'PNG', 155, 15, 35, 15);

    // Agrega el título con fechas
    const fechaInicioFormatted = fechaInicio ? fechaInicio.toLocaleDateString() : 'N/A';
    const fechaFinFormatted = fechaFin ? fechaFin.toLocaleDateString() : 'N/A';
    doc.setFontSize(12);
    doc.text('Dr. Miguel Angel Soto Galindo',75,20);
    doc.text('Coordinador Banco de Leche Humana',69,25);
    doc.text('Jefe Departamento de Pediatría ',75,30);

    doc.setFontSize(14);
    doc.text(`Resumen de donadoras de ${fechaInicioFormatted} a ${fechaFinFormatted}`, 50, 43);

    // Estadísticas Generales
    doc.setFontSize(12);
    doc.text('Estadísticas Generales:', 10, 55);
    doc.text(`Total Donadoras: ${estadisticas?.total_donadoras}`, 10, 70);
    doc.text(`Donadoras Nuevas: ${estadisticas?.total_nuevas}`, 100, 70);
    doc.text(`Donadoras Constantes: ${estadisticas?.total_constantes}`, 100, 75);
    doc.text(`Total Donaciones: ${estadisticas?.total_donaciones}`, 10, 75);
    doc.text(`Total Litros: ${estadisticas?.total_litros}`, 10, 80);

    // Servicios Extrahospitalarios
    if (resumenExtra.length > 0) {
      doc.text('Servicios Extrahospitalarios:', 10, 90);
      doc.autoTable({
        head: [['Servicio', 'Total Donaciones', 'Total Donadoras', 'Litros', 'Nuevas','Constantes']],
        body: resumenExtra.map(item => [
          item.servicio,
          item.total_donaciones,
          item.total_donadoras,
          item.litros,
          item.nuevas,
          item.constantes
        ]),
        startY: 100
      });
    }

    // Servicios Intrahospitalarios
    if (resumenIntra.length > 0) {
      const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 110;
      doc.text('Servicios Intrahospitalarios:', 10, startY);
      doc.autoTable({
        head: [['Servicio', 'Total Donaciones', 'Total Donadoras', 'Litros', 'Nuevas', 'Constantes']],
        body: resumenIntra.map(item => [
          item.servicio,
          item.total_donaciones,
          item.total_donadoras,
          item.litros,
          item.nuevas,
          item.constantes
        ]),
        startY: startY + 10
      });
    }

    // Pie de página
  
    doc.save('ResumenPorServicio.pdf');
  };

  addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    today: 'Hoy',
    clear: 'Limpiar',
  });

  locale('es');

  return (
    <Container>
      <h3 className="my-4">Resumen por Servicio</h3>
      
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

        <Button color="secondary" onClick={handlePrint}>
          <FaPrint className="me-2" /> Imprimir Resumen
        </Button>
      </div>

      {estadisticas && (
        <Row className="mb-4">
          <Col>
            <Card>
              <CardBody>
                <h5>Estadísticas Generales</h5>
                <Row>
                  <Col md={4}>
                    <p>Total Donadoras: {estadisticas.total_donadoras}</p>
                    <p>Total Donaciones: {estadisticas.total_donaciones}</p>
                  </Col>
                  <Col md={4}>
                    <p>Donadoras Nuevas: {estadisticas.total_nuevas}</p>
                    <p>Donadoras Constantes: {estadisticas.total_constantes}</p>
                  </Col>
                  <Col md={4}>
                    <p>Total Litros: {estadisticas.total_litros}</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Servicios Extrahospitalarios */}
      <div className="mb-4">
        <h4>Servicios Extrahospitalarios</h4>
        <Table striped responsive>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Total Donaciones</th>
              <th>Total Donadoras</th>
              <th>Litros</th>
              <th>Constante</th>
              <th>Nuevas</th>
            </tr>
          </thead>
          <tbody>
            {resumenExtra.length > 0 ? (
              resumenExtra.map((servicio, index) => (
                <tr key={index}>
                  <td>{servicio.servicio}</td>
                  <td>{servicio.total_donaciones}</td>
                  <td>{servicio.total_donadoras}</td>
                  <td>{servicio.litros}</td>
                  <td>{servicio.constantes}</td>
                  <td>{servicio.nuevas}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Servicios Intrahospitalarios */}
      <div className="mb-4">
        <h4>Servicios Intrahospitalarios</h4>
        <Table striped responsive>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Total Donaciones</th>
              <th>Total Donadoras</th>
              <th>Litros</th>
              <th>Constante</th>
              <th>Nuevas</th>
            </tr>
          </thead>
          <tbody>
            {resumenIntra.length > 0 ? (
              resumenIntra.map((servicio, index) => (
                <tr key={index}>
                  <td>{servicio.servicio}</td>
                  <td>{servicio.total_donaciones}</td>
                  <td>{servicio.total_donadoras}</td>
                  <td>{servicio.litros}</td>
                  <td>{servicio.constantes}</td>
                  <td>{servicio.nuevas}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Gráfico de barras */}
      {(resumenExtra.length > 0 || resumenIntra.length > 0) && (
        <div className="my-5" id="graficoResumen">
          <h4>Visualización de Datos</h4>
          <Bar 
            data={{
              labels: [...resumenExtra, ...resumenIntra].map(servicio => servicio.servicio),
              datasets: [
                {
                  label: 'Total Donaciones',
                  data: [...resumenExtra, ...resumenIntra].map(servicio => servicio.total_donaciones),
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
                {
                  label: 'Total Donadoras',
                  data: [...resumenExtra, ...resumenIntra].map(servicio => servicio.total_donadoras),
                  backgroundColor: 'rgba(153, 102, 255, 0.6)',
                },
                {
                  label: 'Litros',
                  data: [...resumenExtra, ...resumenIntra].map(servicio => servicio.litros),
                  backgroundColor: 'rgba(255, 159, 64, 0.6)',
                },
              ],
            }}
            options={{ responsive: true }}
          />
        </div>
      )}
    </Container>
  );
};

export default ResumenPorServicio;