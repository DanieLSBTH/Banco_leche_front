import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { Paginator } from 'primereact/paginator';
import { FaChartBar } from 'react-icons/fa';
import { Button } from 'reactstrap';
import InsertarPersonaModal from './InsertarPersonaModal';
const url = "https://banco-leche-backend.onrender.com/api/estimulacion/";
const personalUrl = 'https://banco-leche-backend.onrender.com/api/personal_estimulacion/';
const servicioUrl = 'https://banco-leche-backend.onrender.com/api/servicio_in/';

class ShowStimulation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      estimulaciones: [],
      personal: [],
      servicios: [],
      searchPersonal: '', // Nuevo estado para la búsqueda de personal
      filteredPersonal: [], // Nuevo estado para los resultados filtrados
      modalInsertar: false,
      selectedPersona: '', // Persona seleccionada en el campo de selección
      modalInsertarPersona: false, // Estado del modal de insertar persona
      modalEliminar: false,
      form: this.getInitialFormState(),
      tipoModal: '',
      totalRecords: 0,
      currentPage: 1,
      rowsPerPage: 10,
      isLoading: true,
    }
    
  }

  getInitialFormState = () => ({
    id_estimulacion: '',
    id_personal_estimulacion: '',
    fecha: '',
    id_intrahospitalario: '',
    constante: false,
    nueva: false,
  });

  componentDidMount() {
    this.cargarDatos(); 
  }
  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  filteredEstimulaciones = () => {
    const { estimulaciones, searchTerm } = this.state;
    // Filtra por nombre del personal
    return estimulaciones.filter((estimulacion) =>
      (estimulacion.personal_estimulaciones?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  obtenerPersonal = async () => {
    const response = await axios.get('https://banco-leche-backend.onrender.com/api/personal_estimulacion/');
    this.setState({ personal: response.map });
  };

  handlePersonaInsertada = (nuevaPersona) => {
    this.setState((prevState) => ({
      personal: [...prevState.personal, nuevaPersona],
      selectedPersona: nuevaPersona.id_personal_estimulacion,
      form: {
        ...prevState.form,
        id_personal_estimulacion: nuevaPersona.id_personal_estimulacion // Actualizar el form directamente
      }
    }));
  };
  formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Create date object and adjust for timezone
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const adjustedDate = new Date(date.getTime() + timezoneOffset);
    return adjustedDate.toISOString().split('T')[0];
  };

  formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    // Create date object and adjust for timezone
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + timezoneOffset);
    return adjustedDate.toLocaleDateString();
  };
 

  handleNavigate = () => {
    // Usa la función navigate pasada como prop
    this.props.navigate('/resumen-estimulacion');

  };
  handleNavigate2 = () => {
    
    this.props.navigate('/resumenestimulacionnombre');
  };


  cargarDatos = async () => {
    try {
      this.setState({ isLoading: true });
      await Promise.all([
        this.peticionGet(),
        this.cargarPersonalYServicios()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire('Error', 'Error al cargar los datos iniciales', 'error');
    } finally {
      this.setState({ isLoading: false });
    }
  };

  peticionGet = async () => {
    try {
      const { currentPage, rowsPerPage } = this.state;
      const response = await axios.get(`${url}?page=${currentPage}&pageSize=${rowsPerPage}`);
      
      if (response.data && response.data.estimulaciones) {
        this.setState({
          estimulaciones: response.data.estimulaciones,
          totalRecords: response.data.totalRecords || 0
        });
      }
    } catch (error) {
      console.error('Error al obtener estimulaciones:', error);
      Swal.fire('Error', 'No se pudieron cargar las estimulaciones', 'error');
      this.setState({ estimulaciones: [] });
    }
  };

  validateForm = () => {
    const { id_personal_estimulacion, fecha, id_intrahospitalario } = this.state.form;
    console.log('Validating:', { id_personal_estimulacion, fecha, id_intrahospitalario });
    if (!id_personal_estimulacion || !fecha || !id_intrahospitalario) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return false;
    }
    return true;
  };
  

  peticionPost = async () => {
    if (!this.validateForm()) return;
  
    try {
      // Adjust the date for timezone before sending to server
      const formData = {
        ...this.state.form,
        fecha: new Date(this.state.form.fecha).toISOString().split('T')[0] // Format as YYYY-MM-DD
      };
      
      await axios.post(url, formData);
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Estimulación agregada exitosamente', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo agregar la estimulación', 'error');
      console.error('Error al agregar estimulación:', error);
    }
  };
  
  peticionPut = async () => {
    if (!this.validateForm()) return;
  
    try {
      const formData = {
        ...this.state.form,
        id_personal_estimulacion: parseInt(this.state.form.id_personal_estimulacion),
        id_intrahospitalario: parseInt(this.state.form.id_intrahospitalario),
        constante: Boolean(this.state.form.constante),
        nueva: Boolean(this.state.form.nueva),
        fecha: new Date(this.state.form.fecha).toISOString().split('T')[0] // Format as YYYY-MM-DD
      };
  
      await axios.put(`${url}${this.state.form.id_estimulacion}`, formData);
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Estimulación actualizada exitosamente', 'success');
    } catch (error) {
      console.error('Error al actualizar estimulación:', error);
      Swal.fire('Error', 'No se pudo actualizar la estimulación', 'error');
    }
  };

  peticionDelete = async () => {
    try {
      await axios.delete(`${url}${this.state.form.id_estimulacion}`);
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Estimulación eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar estimulación:', error);
      Swal.fire('Error', 'No se pudo eliminar la estimulación', 'error');
    }
  };

  cargarPersonalYServicios = async () => {
    try {
      const [personalResponse, servicioResponse] = await Promise.all([
        axios.get(personalUrl),
        axios.get(servicioUrl)
      ]);

      this.setState({
        personal: personalResponse.data?.personal_estimulaciones || personalResponse.data || [],
        servicios: servicioResponse.data?.servicios || servicioResponse.data || []
      });
    } catch (error) {
      console.error('Error al cargar personal y servicios:', error);
      Swal.fire('Error', 'Error al cargar datos de personal y servicios', 'error');
      this.setState({ personal: [], servicios: [] });
    }
  };

  seleccionarEstimulacion = (estimulacion) => {
    // Convertir la fecha al formato correcto para el input date
    const fechaFormateada = this.formatDateForInput(estimulacion.fecha);
    
    this.setState({
        modalInsertar: true,  // Abre el modal
        tipoModal: 'editar',
        form: {
            ...estimulacion,
            fecha: fechaFormateada,
            id_personal_estimulacion: estimulacion.id_personal_estimulacion.toString(),
            id_intrahospitalario: estimulacion.id_intrahospitalario.toString(),
            constante: Boolean(estimulacion.constante),
            nueva: Boolean(estimulacion.nueva)
        }
    });
};

modalInsertar = () => {
  this.setState(prevState => ({
      modalInsertar: !prevState.modalInsertar,
      form: !prevState.modalInsertar ? 
          (this.state.tipoModal === 'insertar' ? this.getInitialFormState() : this.state.form) 
          : this.state.form
  }));
};

  handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    let val = type === 'checkbox' ? checked : value;
    
    // Si es un campo numérico, asegurarse de que sea string
    if (name === 'id_personal_estimulacion' || name === 'id_intrahospitalario') {
      val = value.toString();
    }
    
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        [name]: val,
        ...(type === 'checkbox' && name === 'constante' && checked && { nueva: false }),
        ...(type === 'checkbox' && name === 'nueva' && checked && { constante: false })
      }
    }));
  };

  onPageChange = (event) => {
    this.setState({
      currentPage: event.page + 1,
      rowsPerPage: event.rows
    }, this.peticionGet);
  };

  

  toggleInsertarPersonaModal = () => {
    this.setState({ modalInsertarPersona: !this.state.modalInsertarPersona });
  };

 
  render() {
    const { isLoading, form, personal, servicios, estimulaciones, totalRecords, currentPage, rowsPerPage, searchTerm } = this.state;
    const navigate = this.props.navigate;
    if (isLoading) {
      return <div className="text-center mt-5">Cargando datos...</div>;
    }

    return (
      <div className="App">
        <br />
        <button className="btn btn-success" onClick={() => {
          this.setState({
            form: this.getInitialFormState(),
            tipoModal: 'insertar',
            selectedPersona: '' 
          }, this.modalInsertar);
        }}>
          Agregar Estimulación
        </button>
        <br /><br />
        <Button color="info" onClick={this.handleNavigate} className="d-flex align-items-center">
          <FaChartBar className="me-2" /> {/* Ícono a la izquierda */}
          Mostrar Resumen estimulacion
          </Button>
          <br />
          <Button color="info" onClick={this.handleNavigate2} className="d-flex align-items-center">
          <FaChartBar className="me-2" /> {/* Ícono a la izquierda */}
          Mostrar Resumen por nombre
          </Button>

        {estimulaciones.length === 0 ? (
          <div className="alert alert-info">No hay datos de estimulaciones disponibles</div>
        ) : (
          <>
           <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Personal</th>
                  <th>Fecha</th>
                  <th>Servicio</th>
                  <th>Constante</th>
                  <th>Nueva</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                
                {estimulaciones.map(estimulacion => (
                  <tr key={estimulacion.id_estimulacion}>
                    <td>{estimulacion.id_estimulacion}</td>
                    <td>{estimulacion.personal_estimulaciones?.nombre +' '+ estimulacion.personal_estimulaciones?.apellido }</td>
                    <td>{this.formatDateForDisplay(estimulacion.fecha)}</td>
                    <td>{estimulacion.servicio_ins?.servicio || 'N/A'}</td>
                    <td> <input type="checkbox"checked={estimulacion.constante}disabledstyle={{ accentColor: "blue" }} /></td>
                    <td> <input type="checkbox"checked={estimulacion.nueva} disabledstyle={{ accentColor: "blue" }} /></td>
                    <td>
                    <button className="btn btn-primary" onClick={() => this.seleccionarEstimulacion(estimulacion)}>Editar</button>
                     {"  "}
                     <button
  className="btn btn-danger"
  onClick={() => {
    this.setState({
      modalEliminar: true,
      form: {
        ...estimulacion,
      }
    });
  }}
>
  Eliminar
</button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            
            <Paginator
              first={(currentPage - 1) * rowsPerPage}
              rows={rowsPerPage}
              totalRecords={totalRecords}
              onPageChange={this.onPageChange}
            />
          </>
        )}

<Modal isOpen={this.state.modalInsertar}>
          <ModalHeader>
            {this.state.tipoModal === 'insertar' ? 'Insertar Estimulación' : 'Editar Estimulación'}
          
          </ModalHeader>
          <ModalBody>
             {/* Botón para abrir el modal de agregar persona */}
             <button className="btn btn-outline-secondary" type="button" onClick={this.toggleInsertarPersonaModal}>Agregar Nueva Persona</button>
              {/* Barra de búsqueda de personal */}
    <div className="form-group mb-3">
      <label htmlFor="searchPersonal">Buscar Persona estimulada</label>
      <input
        type="text"
        className="form-control"
        id="searchPersonal"
        placeholder="Buscar por nombre..."
        value={this.state.searchPersonal || ''}
        onChange={(e) => {
          const searchTerm = e.target.value.toLowerCase();
          this.setState({ 
            searchPersonal: e.target.value,
            filteredPersonal: this.state.personal.filter(persona => 
              `${persona.nombre} ${persona.apellido}`.toLowerCase().includes(searchTerm)
            )
          });
        }}
      />
    </div>
      {/* Lista de resultados de búsqueda */}
    {this.state.searchPersonal && (
      <div className="list-group mb-3">
        {(this.state.filteredPersonal || []).map(persona => (
          <button
            key={persona.id_personal_estimulacion}
            type="button"
            className="list-group-item list-group-item-action"
            onClick={() => {
              this.setState(prevState => ({
                selectedPersona: persona.id_personal_estimulacion,
                searchPersonal: '', // Limpiar la búsqueda
                form: {
                  ...prevState.form,
                  id_personal_estimulacion: persona.id_personal_estimulacion.toString()
                }
              }));
            }}
          >
            {persona.nombre} {persona.apellido}
          </button>
        ))}
      </div>
    )}
        {/* Modal para insertar persona */}
        <InsertarPersonaModal
          isOpen={this.state.modalInsertarPersona}
          toggle={this.toggleInsertarPersonaModal}
          onPersonaInsertada={this.handlePersonaInsertada} // Llamado cuando se inserta una nueva persona
        />

            {/* Mostrar el nombre de la persona seleccionada */}
            {this.state.selectedPersona && (
              <div>
                <label>Persona seleccionada: {this.state.selectedPersona.nombre} {this.state.selectedPersona.apellido}</label>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="id_personal_estimulacion">Persona estimulada </label>
              <select className="form-control" name="id_personal_estimulacion"
  value={this.state.selectedPersona || ''}
  onChange={(e) => {
    const selectedId = e.target.value;
    this.setState(prevState => ({
      selectedPersona: selectedId,
      form: {
        ...prevState.form,
        id_personal_estimulacion: selectedId // Actualiza el estado del formulario
      }
    }));
  }}
>

          <option value="">Seleccione personal</option>
          {this.state.personal.map((persona) => (
            <option key={persona.id_personal_estimulacion} value={persona.id_personal_estimulacion}>
              {persona.nombre} {persona.apellido}
            </option>
          ))}
        </select>
              <br />

              <label htmlFor="fecha">Fecha </label>
              <input
                className="form-control"
                type="date"
                name="fecha"
                value={form.fecha || ''}
                onChange={this.handleChange}
              />
              <br />

              <label htmlFor="id_intrahospitalario">Servicio </label>
              <select
                className="form-control"
                name="id_intrahospitalario"
                value={form.id_intrahospitalario || ''}
                onChange={this.handleChange}
              >
                <option value="">Seleccione Servicio</option>
                {servicios.map(servicio => (
                  <option 
                    key={servicio.id_intrahospitalario} 
                    value={servicio.id_intrahospitalario.toString()}
                  >
                    {servicio.servicio}
                  </option>
                ))}
              </select>
              <br />
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="constante"
                  id="constante"
                  checked={form.constante}
                  onChange={this.handleChange}
                />
                <label className="form-check-label" htmlFor="constante">
                  Constante
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="nueva"
                  id="nueva"
                  checked={form.nueva}
                  onChange={this.handleChange}
                />
                <label className="form-check-label" htmlFor="nueva">
                  Nueva
                </label>
              </div>
            </div>

            </ModalBody>
          <ModalFooter>
            {this.state.tipoModal === 'insertar' ? 
              <button className="btn btn-success" onClick={this.peticionPost}>
                Insertar
              </button>: 
              <button className="btn btn-primary" onClick={this.peticionPut}>
                Actualizar
              </button>
            }
            <button className="btn btn-danger" onClick={this.modalInsertar}>
              Cancelar
            </button>
              {/* Modal de agregar persona */}
        
          </ModalFooter>
        </Modal>
        <Modal isOpen={this.state.modalEliminar}>
          <ModalHeader>Eliminar Registro</ModalHeader>
          <ModalBody>
            Estás seguro que deseas eliminar el registro {form && form.id_donadora_detalle}?
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-danger" onClick={() => this.peticionDelete()}>Sí</button>
            <button className="btn btn-secondary" onClick={() => this.setState({ modalEliminar: false })}>No</button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

function ShowStimulationWrapper() {
  const navigate = useNavigate();
  return <ShowStimulation navigate={navigate} />;
}

export default ShowStimulationWrapper;