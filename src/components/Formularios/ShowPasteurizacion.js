import React, { Component } from 'react';
import axios from 'axios';
import { Paginator } from 'primereact/paginator';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FaChartBar } from 'react-icons/fa';
import { Button } from 'reactstrap';

const url = "https://banco-leche-backend.onrender.com/api/trabajo_de_pasteurizaciones/";

class ShowPasteurizacion extends Component {
  state = {
    pasteurizaciones: [],
    modalInsertar: false,
    modalEliminar: false,
    mesActual: false,
    mostrarTodos: false,
    form: {
      id_pasteurizacion: '',
      fecha: '',
      numero: '',
      no_frasco: '',
      crematorio_1_1: '',
      crematorio_1_2: '',
      crematorio_2_1: '',
      crematorio_2_2: '',
      crematorio_3_1: '',
      crematorio_3_2: '',
      acidez: '',
      total_crematorio_1: '',
      total_crematorio_2: '',
      total_crematorio_3: '',
      porcentaje_crema: '',
      kcal_l: '',
      kcal_onz: '',
      porcentaje_grasa: ''
    },
      // Estados para la paginación
      totalRecords: 0,
      page: 1,
      rows: 10, // Número de registros por página
  }
  handleNavigate = () => {
    // Usa la función navigate pasada como prop
    this.props.navigate('/resumenpasteurizacion');
  };
  // Add more detailed logging to understand what's happening
  peticionGet = () => {
    const { page, rows, mostrarTodos } = this.state;
    
    // Preparar los parámetros de la solicitud
    const params = new URLSearchParams({
      page: page,            // Número de página
      pageSize: rows,        // Tamaño de página
      mesActual: mostrarTodos ? 'false' : 'true'  // Modificado para ser más explícito
    });
  
    console.log('Parámetros de solicitud:', params.toString());
    
    axios
      .get(`${url}?${params.toString()}`)
      .then(response => {
        console.log('Respuesta completa:', response.data);
        
        this.setState({ 
          pasteurizaciones: response.data.pasteurizaciones || [], 
          totalRecords: response.data.totalRecords || 0,
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1
        });
      })
      .catch(error => {
        console.error('Error detallado:', error.response || error);
        Swal.fire('Error', 'No se pudo cargar la lista de pasteurizaciones', 'error');
      });
  };
  
  
  // Update the onPageChange method
  onPageChange = (event) => {
    const newPage = event.page + 1; // PrimeReact usa índices basados en cero
    
    this.setState({ 
      page: newPage 
    }, () => {
      this.peticionGet(); // Obtener datos para la nueva página
    });
  };
  
  peticionPost = async () => {
    delete this.state.form.id_pasteurizacion;
    await axios.post(url, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Pasteurización creada exitosamente', 'success');
    }).catch(error => {
      console.log(error.message);
      Swal.fire('Error', 'Error al crear la pasteurización', 'error');
    });
  }

  peticionPut = () => {
    axios.put(url + this.state.form.id_pasteurizacion, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Pasteurización actualizada exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al actualizar la pasteurización', 'error');
      console.log(error.message);
    });
  }

  peticionDelete = () => {
    axios.delete(url + this.state.form.id_pasteurizacion).then(response => {
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Pasteurización eliminada exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al eliminar la pasteurización', 'error');
      console.log(error.message);
    });
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  seleccionarPasteurizacion = (pasteurizacion) => {
    this.setState({
      form: {
        id_pasteurizacion: pasteurizacion.id_pasteurizacion,
        fecha: pasteurizacion.fecha,
        numero: pasteurizacion.numero,
        no_frasco: pasteurizacion.no_frasco,
        crematorio_1_1: pasteurizacion.crematorio_1_1,
        crematorio_1_2: pasteurizacion.crematorio_1_2,
        crematorio_2_1: pasteurizacion.crematorio_2_1,
        crematorio_2_2: pasteurizacion.crematorio_2_2,
        crematorio_3_1: pasteurizacion.crematorio_3_1,
        crematorio_3_2: pasteurizacion.crematorio_3_2,
        acidez: pasteurizacion.acidez,
        total_crematorio_1: pasteurizacion.total_crematorio_1,
        total_crematorio_2: pasteurizacion.total_crematorio_2,
        total_crematorio_3: pasteurizacion.total_crematorio_3,
        porcentaje_crema: pasteurizacion.porcentaje_crema,
        kcal_l: pasteurizacion.kcal_l,
        kcal_onz: pasteurizacion.kcal_onz,
        porcentaje_grasa: pasteurizacion.porcentaje_grasa
      }
    });
  }

  handleChange = async (e) => {
    e.persist();
    await this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value
      }
    });
  }

  componentDidMount() {
    this.peticionGet();
  }

  render() {
    const {pasteurizaciones, form, totalRecords, rows, page,currentPage, totalPages } = this.state;
    const navigate = this.props.navigate; // Obtenemos la función navigate desde props

    return (
      <div className="container-fluid">
         <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-success" onClick={() => { this.setState({ form: {}, tipoModal: 'insertar' }); this.modalInsertar() }}>Agregar Pasteurización</button>
        <br /><br />
        <Button color="info" onClick={this.handleNavigate} className="d-flex align-items-center">
          <FaChartBar className="me-2" /> {/* Ícono a la izquierda */}
          Mostrar Resumen por Servicio
          </Button>
        </div>
        <div className="form-check mb-3">
        <input 
          type="checkbox" 
          className="form-check-input" 
          id="mostrarTodos"
          checked={!this.state.mostrarTodos}
          onChange={() => this.setState({ 
            mostrarTodos: !this.state.mostrarTodos, 
            page: 1 
          }, () => this.peticionGet())}
        />
        <label className="form-check-label" htmlFor="mostrarTodos">
          Mostrar solo del mes actual
        </label>
      </div>

        <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Número</th>
              <th>No. Frasco</th>
              <th>C1_1</th>
              <th>C1_2</th>
              <th>Total Crematorio 1</th>
              <th>C2_1</th>
              <th>C2_2</th>
              <th>Total Crematorio 2</th>
              <th>C3_1</th>
              <th>C3_2</th>
              <th>Total Crematorio 3</th>
              <th>Crema %</th>
              <th>kcal_l %</th>
              <th>kcal_onz</th>
              <th>Acidez</th>
              <th>Grasa %</th>
              
              <th>Acciones</th>

            </tr>
          </thead>
          <tbody>
            {this.state.pasteurizaciones.map(pasteurizacion => {
              return (
                <tr key={pasteurizacion.id_pasteurizacion}>
                  <td>{pasteurizacion.id_pasteurizacion}</td>
                  <td>{pasteurizacion.fecha}</td>
                  <td>{pasteurizacion.numero}</td>
                  <td>{pasteurizacion.no_frasco}</td>
                  <td>{pasteurizacion.crematorio_1_1}</td>
                  <td>{pasteurizacion.crematorio_1_2}</td>
                  <td>{pasteurizacion.total_crematorio_1}</td>
                  <td>{pasteurizacion.crematorio_2_1}</td>
                  <td>{pasteurizacion.crematorio_2_2}</td>
                  <td>{pasteurizacion.total_crematorio_2}</td>
                  <td>{pasteurizacion.crematorio_3_1}</td>
                  <td>{pasteurizacion.crematorio_3_2}</td>
                  <td>{pasteurizacion.total_crematorio_3}</td>
                  <td>{pasteurizacion.porcentaje_crema}</td>
                  <td>{pasteurizacion.kcal_l}</td>
                  <td>{pasteurizacion.kcal_onz}</td>
                  <td>{pasteurizacion.acidez}</td>
                  <td>{pasteurizacion.porcentaje_grasa}</td>
                  
                  <td>
                    <button className="btn btn-primary" onClick={() => { this.seleccionarPasteurizacion(pasteurizacion); this.modalInsertar() }}>Editar</button>
                    {"   "}
                    <button className="btn btn-danger" onClick={() => { this.seleccionarPasteurizacion(pasteurizacion); this.setState({ modalEliminar: true }) }}>Eliminar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        <div className="d-flex justify-content-center mt-3">      
        <Paginator 
          first={(page - 1) * rows} 
          rows={rows} 
          totalRecords={totalRecords} 
          onPageChange={this.onPageChange}
          totalPages={totalPages}
        /> 
      </div>
        <div className="modal-dialog">
          <Modal size="lg" isOpen={this.state.modalInsertar} toggle={() => this.modalInsertar()}>
            <ModalHeader toggle={() => this.modalInsertar()}>{this.state.tipoModal === 'insertar' ? 'Insertar Pasteurización' : 'Editar Pasteurización'}</ModalHeader>
            <ModalBody>
              <div className="Container">
             
                <label htmlFor="id_pasteurizacion">ID</label>
                <input className="form-control" type="text" name="id_pasteurizacion" id="id_pasteurizacion" readOnly onChange={this.handleChange} value={form ? form.id_pasteurizacion : ''} />
                <br />
                <div className="row">
                <div className="form-group col-md-6">
                <label htmlFor="fecha">Fecha</label>
                <input className="form-control" type="date" name="fecha" id="fecha" onChange={this.handleChange} value={form ? form.fecha : ''} />
                </div>
                <div className="form-group col-md-6">
                <label htmlFor="no_frasco">No. Frasco</label>
                <input className="form-control" type="text" name="no_frasco" id="no_frasco" onChange={this.handleChange} value={form ? form.no_frasco : ''} />
                </div>
                <div className="form-group col-md-6">
                <label htmlFor="crematorio_1_1">Crematorio 1.1</label>
                <input className="form-control" type="number" name="crematorio_1_1" id="crematorio_1_1" onChange={this.handleChange} value={form ? form.crematorio_1_1 : ''} />
                </div>
                <div className="form-group col-md-6">
                <label htmlFor="crematorio_1_2">Crematorio 1.2</label>
                <input className="form-control" type="number" name="crematorio_1_2" id="crematorio_1_2" onChange={this.handleChange} value={form ? form.crematorio_1_2 : ''} />
                </div>
                <div className="form-group col-md-6">
                <label htmlFor="crematorio_2_1">Crematorio 2.1</label>
                <input className="form-control" type="number" name="crematorio_2_1" id="crematorio_2_1" onChange={this.handleChange} value={form ? form.crematorio_2_1 : ''} />
                </div>
                <div className="form-group col-md-6">
                <label htmlFor="crematorio_2_2">Crematorio 2.2</label>
                <input className="form-control" type="number" name="crematorio_2_2" id="crematorio_2_2" onChange={this.handleChange} value={form ? form.crematorio_2_2 : ''} />
                </div>
                <div className="form-group col-md-6">
                <label htmlFor="crematorio_3_1">Crematorio 3.1</label>
                <input className="form-control" type="number" name="crematorio_3_1" id="crematorio_3_1" onChange={this.handleChange} value={form ? form.crematorio_3_1 : ''} />
                </div>
                <div className="form-group col-md-6">
                <label htmlFor="crematorio_3_2">Crematorio 3.2</label>
                <input className="form-control" type="number" name="crematorio_3_2" id="crematorio_3_2" onChange={this.handleChange} value={form ? form.crematorio_3_2 : ''} />
                </div>
                <div className="form-group col-md-6">
                <label htmlFor="acidez">Acidez</label>
                <input className="form-control" type="number" name="acidez" id="acidez" onChange={this.handleChange} value={form ? form.acidez : ''} />
                </div>
              </div>
              </div>
            </ModalBody>
            <ModalFooter>
              {this.state.tipoModal === 'insertar' ? 
                <button className="btn btn-success" onClick={() => this.peticionPost()}>Insertar</button> : 
                <button className="btn btn-primary" onClick={() => this.peticionPut()}>Actualizar</button>
              }
              <button className="btn btn-danger" onClick={() => this.modalInsertar()}>Cancelar</button>
            </ModalFooter>
          </Modal>
        </div>

        <div className="modal-dialog">
          <Modal isOpen={this.state.modalEliminar} toggle={() => this.modalInsertar()}>
            <ModalHeader>Eliminar Pasteurización</ModalHeader>
            <ModalBody>
              Estás seguro que deseas eliminar la pasteurización con ID {form && form.id_pasteurizacion}?
            </ModalBody>
            <ModalFooter>
              <button className="btn btn-danger" onClick={() => this.peticionDelete()}>Sí</button>
              <button className="btn btn-secondary" onClick={() => this.setState({ modalEliminar: false })}>No</button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    );
  }
}

function ShowPasteurizacionWrapper() {
  const navigate = useNavigate();
  return <ShowPasteurizacion navigate={navigate} />;
}


export default ShowPasteurizacionWrapper;
