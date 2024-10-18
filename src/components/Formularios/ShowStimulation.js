import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../Css/Button.css';
import { Modal, ModalBody, ModalFooter, ModalHeader,Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

import { FaClipboardList } from 'react-icons/fa';

const url = "https://banco-leche-backend.onrender.com/api/estimulacion/";
const personalUrl = 'https://banco-leche-backend.onrender.com/api/personal/';
const servicioUrl = 'https://banco-leche-backend.onrender.com/api/servicio_in/';


class ShowStimulation extends Component {
    state = {
      stimulations: [],
      personal: [],
      servicios: [],
      fechaInicio:'',
      fechaFin:'',
      filteredStimulations: [],
      isFilterActive: false,
      modalInsertar: false,
      modalEliminar: false,
      mesActual: false,
      mostrarTodos: false,
      form: {
        id_estimulacion: '',
        nombre: '',
        apellido: '',
        fecha: '',
        id_intrahospitalario: '',
        constante: false,
        nueva: false,
        id_personal: '',
        tipoModal: '',
        
      }
    }
    
    componentDidMount() {
      this.peticionGet();
      }

      handleNavigate = () => {
        // Usa la función navigate pasada como prop
        this.props.navigate('/resumen-estimulacion');
      };
    


      peticionGet = () => {
        const params = this.state.mostrarTodos ? '' : '?mesActual=true';
    axios.get(url + params).then(response => {
      const sortedStimulations = response.data.sort((a, b) => a.id_estimulacion - b.id_estimulacion);
      this.setState({ stimulations: sortedStimulations, filteredStimulations: sortedStimulations });
    }).catch(error => {
      console.log(error.message);
      Swal.fire('Error', 'Error al cargar los datos', 'error');
    });
    
        axios.get(personalUrl).then(response => {
          this.setState({ personal: response.data.personal });
        }).catch(error => {
          console.log(error.message);
        });
    
        axios.get(servicioUrl).then(response => {
          this.setState({ servicios: response.data });
        }).catch(error => {
          console.log(error.message);
        });
      }

      validarFormulario = () => {
        const { nombre, apellido, id_intrahospitalario, constante, nueva } = this.state.form;
      
        // Validar que todos los campos requeridos tengan valor
        if (!nombre || !apellido || !id_intrahospitalario) {
          Swal.fire('Error', 'Debe completar todos los campos obligatorios: Nombre, Apellido y Servicio', 'error');
          return false;
        }
      
        // Validar que solo se seleccione una opción: Constante o Nueva
        if ((constante && nueva) || (!constante && !nueva)) {
          Swal.fire('Error', 'Debe seleccionar solo una opción: Constante o Nueva', 'error');
          return false;
        }
      
        return true;
      }    

      peticionPost = async () => {
        if (!this.validarFormulario()) return;
      
        delete this.state.form.id_estimulacion;
        await axios.post(url, this.state.form).then(response => {
          this.modalInsertar();
          this.peticionGet();
          Swal.fire('Éxito', 'Estimulación creada exitosamente', 'success');
        }).catch(error => {
          console.log(error.message);
          Swal.fire('Error', 'Error al crear la estimulación', 'error');
        });
      }

      peticionPut = () => {
        if (!this.validarFormulario()) return;
      
        axios.put(url + this.state.form.id_estimulacion, this.state.form).then(response => {
          this.modalInsertar();
          this.peticionGet();
          Swal.fire('Éxito', 'Estimulación actualizada exitosamente', 'success');
        }).catch(error => {
          Swal.fire('Error', 'Error al actualizar la estimulación', 'error');
          console.log(error.message);
        });
      }

  peticionDelete = () => {
    axios.delete(url + this.state.form.id_estimulacion).then(response => {
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Estimulación eliminada exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al eliminar la estimulación', 'error');
      console.log(error.message);
    })
  }
 
  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  seleccionarEstimulación = (estimulación) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_estimulacion: estimulación.id_estimulacion,
        nombre: estimulación.nombre,
        apellido: estimulación.apellido,
        fecha: estimulación.fecha,
        id_intrahospitalario: estimulación.id_intrahospitalario,
        constante: estimulación.constante,
        nueva: estimulación.nueva,
        id_personal: estimulación.id_personal,
      }
    })
  }

  handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Manejo de checkboxes
    if (type === "checkbox") {
      this.setState(prevState => ({
        form: {
          ...prevState.form,
          [name]: checked,
          // Desmarca el otro checkbox si uno es marcado
          constante: name === 'constante' ? checked : false,
          nueva: name === 'nueva' ? checked : false
        }
      }));
    } else {
      this.setState(prevState => ({
        form: {
          ...prevState.form,
          [name]: value
        }
      }));
    }
  }
  // Validación antes de enviar datos
  validarFormulario = () => {
    const { constante, nueva } = this.state.form;
    if ((constante && nueva) || (!constante && !nueva)) {
      Swal.fire('Error', 'Debe seleccionar solo una opción: Constante o Nueva', 'error');
      return false;
    }
    return true;
  }

  peticionPost = async () => {
    if (!this.validarFormulario()) return;

    delete this.state.form.id_estimulacion;
    await axios.post(url, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Estimulación creada exitosamente', 'success');
    }).catch(error => {
      console.log(error.message);
      Swal.fire('Error', 'Error al crear la estimulación', 'error');
    });
  }

  peticionPut = () => {
    if (!this.validarFormulario()) return;

    axios.put(url + this.state.form.id_estimulacion, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Estimulación actualizada exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al actualizar la estimulación', 'error');
      console.log(error.message);
    });
  }


 // Nueva función para manejar los cambios en el formulario de filtrado
    handleFilterChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

   // Nueva función para realizar la solicitud de filtrado
  filtrarAsistencias = () => {
    const { fechaInicio, fechaFin } = this.state;

    if (!fechaInicio || !fechaFin) {
      Swal.fire('Error', 'Por favor, selecciona ambas fechas para filtrar', 'error');
      return;
    }

    axios.get(`${url}asistencias?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      .then(response => {
        // Filtramos los datos para que solo contengan los campos requeridos
        const filteredData = response.data.map(item => ({
          nombre: item.nombre,
          apellido: item.apellido,
          constante: item.constante,
          nueva: item.nueva,
          asistencias: item.asistencias
        }));
        this.setState({ filteredStimulations: filteredData, isFilterActive: true });
      })
      .catch(error => {
        console.log(error.message);
        Swal.fire('Error', 'Error al filtrar las asistencias', 'error');
      });
  }
  
   // Función para quitar el filtro y mostrar todos los datos
   quitarFiltro = () => {
    this.setState({ filteredStimulations: this.state.stimulations, isFilterActive: false });
  }

  getPersonalName = (id_personal) => {
    const person = this.state.personal.find(p => p.id_personal === id_personal);
    return person ? `${person.nombre} ${person.apellido}` : 'Desconocido';
  }

  getServicioName = (id_intrahospitalario) => {
    const servicio = this.state.servicios.find(s => s.id_intrahospitalario === id_intrahospitalario);
    return servicio ? servicio.servicio : 'Desconocido';
  }
  componentDidMount() {
    this.peticionGet();
  }
  seleccionarEstimulación = (estimulación) => {
    this.setState({
        tipoModal: 'actualizar',
        form: {
            id_estimulacion: estimulación.id_estimulacion,
            nombre: estimulación.nombre,
            apellido: estimulación.apellido,
            fecha: estimulación.fecha,
            id_intrahospitalario: estimulación.id_intrahospitalario,
            constante: estimulación.constante,
            nueva: estimulación.nueva,
            id_personal: estimulación.id_personal,
        }
    });
    this.modalInsertar(); // Abre el modal para editar
}

// Función para formatear la fecha
formatDate = (dateString) => {
  if (!dateString) {
      return ''; // O un valor por defecto
  }
  const date = new Date(dateString);
  return isNaN(date) ? '' : date.toISOString().split('T')[0];
}


handleMostrarTodosChange = (e) => {
  this.setState({ mostrarTodos: e.target.checked }, this.peticionGet);
}


    render() {
      const { form, fechaInicio, fechaFin, filteredStimulations, isFilterActive, mostrarTodos } = this.state;
    
      return (
        <div className="container mb-4">
        {/* Encabezado con el título */}
        <div className="row align-items-center mb-3">
          <div className="col-12 col-md-6">
            <h3 className="mb-0">Gestión de Estimulación</h3>
          </div>
          
          {/* Botones Agregar Estimulación y Ver Resumen */}
          <div className="col-12 col-md-6 d-flex justify-content-md-end justify-content-start mt-3 mt-md-0">
            <button
              className="btn btn-success me-2"
              onClick={() => {
                this.setState({
                  form: {
                    id_estimulacion: '',
                    nombre: '',
                    apellido: '',
                    fecha: '',
                    id_intrahospitalario: '',
                    constante: false,
                    nueva: false,
                    id_personal: '',
                  },
                  tipoModal: 'insertar',
                });
                this.modalInsertar();
              }}
            >
              Agregar Estimulación
            </button>
      
            <Button color="info" onClick={this.handleNavigate} className="d-flex align-items-center">
              <FaClipboardList className="me-2" /> {/* Ícono */}
              Ver Resumen de Estimulación
            </Button>
          </div>
        </div>
      
        {/* Filtros de Fechas */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-6">
            <label className="custom-label">Fecha Inicio:</label>
            <input
              type="date"
              name="fechaInicio"
              value={fechaInicio}
              onChange={this.handleFilterChange}
              className="form-control"
            />
          </div>
      
          <div className="col-12 col-md-6">
            <label className="custom-label">Fecha Fin:</label>
            <input
              type="date"
              name="fechaFin"
              value={fechaFin}
              onChange={this.handleFilterChange}
              className="form-control"
            />
          </div>
        </div>
      
        {/* Botones de Filtrar y Quitar Filtro */}
        <div className="row">
          <div className="col-12 d-flex justify-content-start justify-content-md-end">
            <button className="btn btn-primary btn-sm me-2" onClick={this.filtrarAsistencias}>
              Filtrar Asistencias
            </button>
      
            {isFilterActive && (
              <button className="btn btn-secondary btn-sm" onClick={this.quitarFiltro}>
                Quitar Filtro
              </button>
            )}
          </div>
        </div>
      
      

          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  {isFilterActive ? (
                    <>
                      <th>Constante</th>
                      <th>Nueva</th>
                      <th>Asistencias</th>
                    </>
                  ) : (
                    <>
                      <th>Fecha</th>
                      <th>Servicio Intrahospitalario</th>
                      <th>Personal</th>
                      <th>Constante</th>
                      <th>Nueva</th>
                      <th>Acciones</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredStimulations.map(stimulation => (
                  <tr key={stimulation.id_estimulacion || stimulation.nombre}>
                    <td>{stimulation.id_estimulacion || '-'}</td>
                    <td>{stimulation.nombre}</td>
                    <td>{stimulation.apellido}</td>
                    {isFilterActive ? (
                      <>
                        <td>
                          <input type="checkbox" checked={stimulation.constante} disabled />
                        </td>
                        <td>
                          <input type="checkbox" checked={stimulation.nueva} disabled />
                        </td>
                        <td>{stimulation.asistencias}</td>
                      </>
                    ) : (
                      <>
                        <td>{this.formatDate(stimulation.fecha)}</td>
                        <td>{this.getServicioName(stimulation.id_intrahospitalario)}</td>
                        <td>{this.getPersonalName(stimulation.id_personal)}</td>
                        <td>
                          <input type="checkbox" checked={stimulation.constante} disabled />
                        </td>
                        <td>
                          <input type="checkbox" checked={stimulation.nueva} disabled />
                        </td>
                        <td>
                          <button className="btn btn-primary" onClick={() => this.seleccionarEstimulación(stimulation)}>Editar</button>
                          <button className="btn btn-danger" onClick={() => this.setState({ modalEliminar: true, form: stimulation })}>Eliminar</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    
          <div className="modal-dialog">
            <Modal isOpen={this.state.modalInsertar} toggle={() => this.modalInsertar()}>
              <ModalHeader toggle={() => this.modalInsertar()}>{this.state.tipoModal === 'insertar' ? 'Insertar Estimulación' : 'Editar Estimulación'}</ModalHeader>
              <ModalBody>
                <div className="form-group">
                  <label htmlFor="id_estimulacion">ID</label>
                  <input className="form-control" type="text" name="id_estimulacion" id="id_estimulacion" readOnly onChange={this.handleChange} value={form ? form.id_estimulacion : this.state.stimulations.length + 1} />
                  <br />
                  <label htmlFor="nombre">Nombre</label>
                  <input className="form-control" type="text" name="nombre" id="nombre" onChange={this.handleChange} value={form ? form.nombre : ''} />
                  <br />
                  <label htmlFor="apellido">Apellido</label>
                  <input className="form-control" type="text" name="apellido" id="apellido" onChange={this.handleChange} value={form ? form.apellido : ''} />
                  <br />
                  <label htmlFor="fecha">Fecha</label>
                  <input className="form-control" type="date" name="fecha" id="fecha" onChange={this.handleChange} value={form ? form.fecha : ''} />
                  <br />
                  <div className="form-group">
                    <label htmlFor="id_intrahospitalario">Servicio</label>
                    <select
                      className="form-control"
                      name="id_intrahospitalario"
                      id="id_intrahospitalario"
                      onChange={this.handleChange}
                      value={form ? form.id_intrahospitalario : ''}
                    >
                      <option value="">Seleccione un servicio</option>
                      {this.state.servicios.map((servicio) => (
                        <option key={servicio.id_intrahospitalario} value={servicio.id_intrahospitalario}>
                          {servicio.servicio}
                        </option>
                      ))}
                    </select>
                  </div>
                  <br />
                  <label htmlFor="constante">Constante</label>
                  <input
                    className="form-control"
                    type="checkbox"
                    name="constante"
                    id="constante"
                    onChange={this.handleChange}
                    checked={form.constante} // Asegúrate de usar checked en lugar de value
                  />
                  <br />
    
                  <label htmlFor="nueva">Nueva</label>
                  <input
                    className="form-control"
                    type="checkbox"
                    name="nueva"
                    id="nueva"
                    onChange={this.handleChange}
                    checked={form.nueva} // Asegúrate de usar checked en lugar de value
                  />
                  <br />
                  <div className="form-group">
                    <label htmlFor="id_personal">Personal</label>
                    <select
                      className="form-control"
                      name="id_personal"
                      id="id_personal"
                      onChange={this.handleChange}
                      value={form ? form.id_personal : ''}
                    >
                      <option value="">Seleccione un personal</option>
                      {this.state.personal.map((person) => (
                        <option key={person.id_personal} value={person.id_personal}>
                          {person.nombre} {person.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <br />
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
              <ModalHeader toggle={() => this.modalInsertar()}>Eliminar Estimulación</ModalHeader>
              <ModalBody>
                ¿Estás seguro que deseas eliminar la estimulación {this.state.form && this.state.form.nombre}?
              </ModalBody>
              <ModalFooter>
                <button className="btn btn-danger" onClick={() => this.peticionDelete()}>Eliminar</button>
                <button className="btn btn-secondary" onClick={() => this.modalInsertar()}>Cancelar</button>
              </ModalFooter>
            </Modal>
          </div>
        </div>
      );
    }
    
}

function ShowStimulationWrapper() {
  const navigate = useNavigate();
  return <ShowStimulation navigate={navigate} />;
}

export default ShowStimulationWrapper; 
