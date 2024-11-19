import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Card, CardBody, Button } from 'reactstrap';
import { FaFilter, FaPrint } from 'react-icons/fa';
import { Calendar } from 'primereact/calendar';
import { locale, addLocale } from 'primereact/api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../Images/backgrounds/Logo_banco2.png';


const ResumenControlLecheFrascos = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [datosControl, setDatosControl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Spanish localization
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

  const handleFiltrar = async () => {
    if (fechaInicio && fechaFin) {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://banco-leche-backend.onrender.com/api/control_de_leches/control-de-leche/totales?fechaInicio=${fechaInicio.toISOString().split('T')[0]}&fechaFin=${fechaFin.toISOString().split('T')[0]}`
        );
        
        setDatosControl(response.data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al obtener los datos. Por favor, intenta nuevamente.',
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

  const handlePrint = () => {
    if (!datosControl) return;

    const doc = new jsPDF();
     // Añadir logo
     const imgLogo = new Image();
     imgLogo.src = logo;
     doc.addImage(imgLogo, 'PNG', 10, 10, 35, 33);
    doc.setFontSize(14);
    doc.text('Control de Leche Pasteurizada', 75, 20);

    doc.setFontSize(12);
    doc.text(`Período: ${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`, 77, 25);
    doc.text(`Total Frascos: ${datosControl.totalFrascos}`, 70, 30);
    doc.text(`Total Unidosis: ${datosControl.totalUnidosis}`, 120, 30);

    // Tabla de registros
    const tableColumn = [ "ID","No.Frasco", "Fecha Almacenamiento", "Volumen/ml", "kca/l", "Grasa %", "Acidez","Tipo leche","Fecha entrega", "responsable"];
    const tableRows = datosControl.registros.map(registro => [
      '',
      registro.NoFrasco,
      '',
      `${registro.Volumen} ml`,
      registro.Kcal_l,
      registro.Grasa,
      registro.Acidez,
      registro.TipoDeLeche,
      
     
    ]);

    doc.autoTable({
      head: [tableColumn],
    body: tableRows,
    startY: 50,
    styles: { fontSize: 10 },
    bodyStyles: { valign: "middle" },
    didParseCell: function (data) {
      // Verificar si la celda actual está en la columna "Volumen/ml" y la fila tiene un valor válido
      if (data.column.index === 3) {
        const cellValue = parseInt(data.cell.raw); // Extraer valor del volumen
        if ([10, 20, 30].includes(cellValue)) {
          // Cambiar el color de texto de toda la fila usando row.raw
          Object.values(data.row.cells).forEach((cell) => {
            cell.styles.textColor = [255, 165, 0]; 
          });
        }
      }
    },
  });

    doc.save('ControlLecheFrascos.pdf');
  };

  return (
    <Container>
      <h3 className="my-4">Control de Leche - Pasteurizada</h3>
      
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

        <Button 
          color="secondary" 
          onClick={handlePrint} 
          disabled={!datosControl}
        >
          <FaPrint className="me-2" /> Imprimir Resumen
        </Button>
      </div>

      {datosControl && (
        <Card>
          <CardBody>
            <h4>Resumen General</h4>
            <p>Total Frascos: {datosControl.totalFrascos}</p>
            <p>Total Unidosis: {datosControl.totalUnidosis}</p>
          </CardBody>
        </Card>
      )}

      {datosControl && (
        <div className="mt-4">
          <h4>Detalle de Frascos</h4>
          <Table striped responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>No. Frasco</th>
                <th>Fecha Almacenamiento</th>
                <th>Volumen (ml)</th>
                <th>Kcal/L</th>
                <th>Grasa (%)</th>
                <th>Acidez</th>
                <th>Tipo de Leche</th>
                <th>Fecha Entrega</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {datosControl.registros.map((registro) => (
                <tr key={registro.ID}>
                  <td>{registro.ID}</td>
                  <td>{registro.NoFrasco}</td>
                  <td>{registro.FechaAlmacenamiento}</td>
                  <td>{registro.Volumen}</td>
                  <td>{registro.Kcal_l}</td>
                  <td>{registro.Grasa}</td>
                  <td>{registro.Acidez}</td>
                  <td>{registro.TipoDeLeche}</td>
                  <td>{registro.FechaEntrega || ' '}</td>
                  <td>{registro.Responsable}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default ResumenControlLecheFrascos;