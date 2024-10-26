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

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResumenPasteurizacion = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [resumen, setResumen] = useState({});

  const handleFiltrar = async () => {
    if (fechaInicio && fechaFin) {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/trabajo_de_pasteurizaciones/getStatsByDateRange?fechaInicio=${fechaInicio.toISOString().split('T')[0]}&fechaFin=${fechaFin.toISOString().split('T')[0]}`
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

    // Agregar el título con las fechas
    const fechaInicioFormatted = fechaInicio ? fechaInicio.toLocaleDateString() : 'N/A';
    const fechaFinFormatted = fechaFin ? fechaFin.toLocaleDateString() : 'N/A';
    doc.setFontSize(14);
    doc.text(`Resumen de Pasteurización de ${fechaInicioFormatted} a ${fechaFinFormatted}`, 50, 20);

    // Añadir tabla con jsPDF autoTable
    doc.autoTable({
      head: [['Promedio Kcal/l', 'Total Acidez', 'Total Registros']],
      body: [[resumen.promedio_kcal_l, resumen.total_acidez, resumen.total_registros]],
      margin: { top: 30 },
    });

    // Captura la gráfica como imagen y la inserta debajo de la tabla
    const chart = document.getElementById('graficoPasteurizacion');
    const canvasGrafica = await html2canvas(chart);
    const imgGrafica = canvasGrafica.toDataURL('image/png');
    const pageHeight = doc.internal.pageSize.height;
    const yPosition = doc.lastAutoTable.finalY + 10;

    if (yPosition + 100 <= pageHeight) {
      doc.addImage(imgGrafica, 'PNG', 10, yPosition, 190, 100);
    } else {
      doc.addPage();
      doc.addImage(imgGrafica, 'PNG', 10, 10, 190, 100);
    }

    doc.save('ResumenPasteurizacion.pdf');
  };

  // Configuración de los datos para la gráfica
  const chartData = {
    labels: ['Promedio Kcal/l', 'Total Acidez', 'Total Registros'],
    datasets: [
      {
        label: 'Resumen Pasteurización',
        data: [resumen.promedio_kcal_l, resumen.total_acidez, resumen.total_registros],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
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
      <h3 className="my-4">Resumen de Pasteurización</h3>
      
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

      <Table striped responsive>
        <thead>
          <tr>
            <th>Promedio Kcal/l</th>
            <th>Total Acidez</th>
            <th>Total Registros</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{resumen.promedio_kcal_l || 'N/A'}</td>
            <td>{resumen.total_acidez || 'N/A'}</td>
            <td>{resumen.total_registros || 'N/A'}</td>
          </tr>
        </tbody>
      </Table>

      {/* Gráfico de barras debajo de la tabla */}
      <div className="my-5" id="graficoPasteurizacion">
        <h4>Visualización de Datos</h4>
        <Bar data={chartData} options={{ responsive: true }} />
      </div>
    </Container>
  );
};

export default ResumenPasteurizacion;
