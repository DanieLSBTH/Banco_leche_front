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
import logo from '../Images/backgrounds/Logo_banco2.png'; // Importar el logo

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResumenPorFechaSolicitud = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [resumen, setResumen] = useState([]);
  const [totales, setTotales] = useState({ totalBeneficiados: 0, totalLitros: 0, totalOnzas: 0 });

  const handleFiltrar = async () => {
    if (fechaInicio && fechaFin) {
      try {
        const response = await axios.get(
          `https://banco-leche-backend.onrender.com/api/solicitud_de_leches/resumen/por-servicio-y-fechas?fechaInicio=${fechaInicio.toISOString().split('T')[0]}&fechaFin=${fechaFin.toISOString().split('T')[0]}`
        );
        const data = response.data.asistencia;

        // Transformar los datos para el resumen
        const servicios = Object.entries(data).map(([servicio, detalles]) => ({
          servicio_tipo: servicio,
          total_beneficiados: detalles.totalBeneficiados,
          total_litros: detalles.totalLitrosDistribuidos,
          total_onzas: detalles.totalOnzas,
        }));

        // Establecer los totales generales
        setTotales(response.data.totalGeneral);

        setResumen(servicios);
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

  // Función para generar el PDF
  const handlePrint = async () => {
    const doc = new jsPDF();

    // Añadir logo
    const imgLogo = new Image();
    imgLogo.src = logo;
    doc.addImage(imgLogo, 'PNG', 10, 10, 40, 35); // Posición y tamaño del logo

    // Agrega el título con fechas
    const fechaInicioFormatted = fechaInicio ? fechaInicio.toLocaleDateString() : 'N/A';
    const fechaFinFormatted = fechaFin ? fechaFin.toLocaleDateString() : 'N/A';
    doc.setFontSize(14);
    doc.text(`Resumen control de despacho de ${fechaInicioFormatted} a ${fechaFinFormatted}`, 50, 35);

    // Añadir tabla con jsPDF autoTable
    const tableData = resumen.map((servicio) => [
      servicio.servicio_tipo,
      servicio.total_beneficiados,
      servicio.total_onzas,
      servicio.total_litros,
    ]);

    // Agregar la fila de totales generales
    tableData.push([
      'Total General',
      totales.totalBeneficiados,
      totales.totalOnzas,
      totales.totalLitrosDistribuidos,
    ]);

    doc.autoTable({
      head: [['Tipo de Servicio', 'Total Beneficiados', 'Total Onzas', 'Total Litros']],
      body: tableData,
      margin: { top: 50 },
    });

    // Captura la gráfica como imagen y la inserta
    const chart = document.getElementById('graficoResumen');
    const canvasGrafica = await html2canvas(chart);
    const imgGrafica = canvasGrafica.toDataURL('image/png');
    doc.addImage(imgGrafica, 'PNG', 10, doc.lastAutoTable.finalY + 10, 190, 100);

    // Pie de página
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(12);
    doc.text('Dr. Miguel Angel Soto Galindo', 10, pageHeight - 20);
    doc.text('Coordinador Banco de Leche Humana', 10, pageHeight - 15);
    doc.text('Jefe Departamento de Pediatría', 10, pageHeight - 10);

    // Descarga el PDF
    doc.save('ResumenPorFechaSolicitud.pdf');
  };

  // Datos para la gráfica
  const chartData = {
    labels: resumen.map((servicio) => servicio.servicio_tipo),
    datasets: [
      {
        label: 'Total Beneficiados',
        data: resumen.map((servicio) => servicio.total_beneficiados),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Total Litros Distribuidos',
        data: resumen.map((servicio) => servicio.total_litros),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
      {
        label: 'Total Onzas',
        data: resumen.map((servicio) => servicio.total_onzas),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      },
    ],
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
      <h3 className="my-4">Resumen por Fecha y Servicio</h3>
      
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

      <Button color="secondary" onClick={handlePrint}>
        <FaPrint className="me-2" /> Imprimir Resumen
      </Button>

      <Table striped responsive id="tablaResumen">
        <thead>
          <tr>
            <th>Tipo de Servicio</th>
            <th>Total Beneficiados</th>
            <th>Total Onzas</th>
            <th>Total Litros</th>
          </tr>
        </thead>
        <tbody>
          {resumen.length > 0 ? (
            resumen.map((servicio, index) => (
              <tr key={index}>
                <td>{servicio.servicio_tipo}</td>
                <td>{servicio.total_beneficiados}</td>
                <td>{servicio.total_onzas}</td>
                <td>{servicio.total_litros}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No se encontraron resultados.
              </td>
            </tr>
          )}
          {/* Fila para los totales generales */}
          {resumen.length > 0 && (
            <tr>
              <td><strong>Total General</strong></td>
              <td><strong>{totales.totalBeneficiados}</strong></td>
              <td><strong>{totales.totalOnzas}</strong></td>
              <td><strong>{totales.totalLitrosDistribuidos}</strong></td>
            </tr>
          )}
        </tbody>
      </Table>

      {resumen.length > 0 && (
        <div id="graficoResumen" className="my-4">
          <Bar data={chartData} />
        </div>
      )}
    </Container>
  );
};

export default ResumenPorFechaSolicitud;
