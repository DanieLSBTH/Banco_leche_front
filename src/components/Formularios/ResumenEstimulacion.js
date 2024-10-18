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

const ResumenEstimulacion = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [resumen, setResumen] = useState([]);

  const handleFiltrar = async () => {
    if (fechaInicio && fechaFin) {
      try {
        const response = await axios.get(
          `https://banco-leche-backend.onrender.com/api/estimulacion/resumen_estimulacion-rangoFecha?fechaInicio=${fechaInicio.toISOString().split('T')[0]}&fechaFin=${fechaFin.toISOString().split('T')[0]}`
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

  // Función para generar el PDF
  const handlePrint = async () => {
    const doc = new jsPDF();

    // Añadir logo
    const imgLogo = new Image();
    imgLogo.src = logo;
    doc.addImage(imgLogo, 'PNG', 10, 10, 30, 30); // Posición y tamaño del logo

    // Agregar el título con las fechas
    const fechaInicioFormatted = fechaInicio ? fechaInicio.toLocaleDateString() : 'N/A';
    const fechaFinFormatted = fechaFin ? fechaFin.toLocaleDateString() : 'N/A';
    doc.setFontSize(14);
    doc.text(`Resumen de Estimulación de ${fechaInicioFormatted} a ${fechaFinFormatted}`, 50, 20);

    // Añadir tabla con jsPDF autoTable
    const tableData = resumen.map((mes) => [
      mes.mes,
      mes.total_estimulaciones,
      mes.total_constantes,
      mes.total_nuevas,
    ]);

    doc.autoTable({
      head: [['Mes', 'Total Estimulaciones', 'Total Constantes', 'Total Nuevas']],
      body: tableData,
      margin: { top: 50 },
    });

    // Verificar si la gráfica cabe debajo de la tabla
    const pageHeight = doc.internal.pageSize.height;
    const yPosition = doc.lastAutoTable.finalY + 10;

    if (yPosition + 100 <= pageHeight) {
      // Captura la gráfica como imagen y la inserta debajo de la tabla
      const chart = document.getElementById('graficoEstimulacion');
      const canvasGrafica = await html2canvas(chart);
      const imgGrafica = canvasGrafica.toDataURL('image/png');
      doc.addImage(imgGrafica, 'PNG', 10, yPosition, 190, 100);
    } else {
      // Si no cabe, crear una nueva página para la gráfica
      doc.addPage();
      const chart = document.getElementById('graficoEstimulacion');
      const canvasGrafica = await html2canvas(chart);
      const imgGrafica = canvasGrafica.toDataURL('image/png');
      doc.addImage(imgGrafica, 'PNG', 10, 10, 190, 100);
    }

    // Pie de página
    doc.setFontSize(12);
    doc.text('Dr. Miguel Angel Soto Galindo', 10, pageHeight - 20);
    doc.text('Jefe Departamento de Pediatría - Coordinador Banco de Leche Humana', 10, pageHeight - 10);

    // Descarga el PDF
    doc.save('ResumenEstimulacion.pdf');
  };

  // Datos para la gráfica
  const chartData = {
    labels: resumen.map((mes) => mes.mes),
    datasets: [
      {
        label: 'Total Estimulaciones',
        data: resumen.map((mes) => mes.total_estimulaciones),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Total Constantes',
        data: resumen.map((mes) => mes.total_constantes),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
      {
        label: 'Total Nuevas',
        data: resumen.map((mes) => mes.total_nuevas),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      },
    ],
  };

   // Configuración del calendario en español
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

      <Button color="secondary" onClick={handlePrint}>
        <FaPrint className="me-2" /> Imprimir Resumen
      </Button>

      <Table striped responsive id="tablaEstimulacion">
        <thead>
          <tr>
            <th>Mes</th>
            <th>Total Estimulaciones</th>
            <th>Total Constantes</th>
            <th>Total Nuevas</th>
          </tr>
        </thead>
        <tbody>
          {resumen.length > 0 ? (
            resumen.map((mes, index) => (
              <tr key={index}>
                <td>{mes.mes}</td>
                <td>{mes.total_estimulaciones}</td>
                <td>{mes.total_constantes}</td>
                <td>{mes.total_nuevas}</td>
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

      {/* Gráfico de barras debajo de la tabla */}
      <div className="my-5" id="graficoEstimulacion">
        <h4>Visualización de Datos</h4>
        <Bar data={chartData} options={{ responsive: true }} />
      </div>
    </Container>
  );
};

export default ResumenEstimulacion;
