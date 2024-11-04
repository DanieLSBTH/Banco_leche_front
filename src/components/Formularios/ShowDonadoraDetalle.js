
import React, { Component } from 'react';
import axios from 'axios';
import { Paginator } from 'primereact/paginator';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FaChartBar } from 'react-icons/fa';
import { Button } from 'reactstrap';

import ResumenPorServicio from './ResumenPorServicio';

// URLs de las APIs
const urlDonadoraDetalle = "https://banco-leche-backend.onrender.com/api/donadora_detalle/";
const urlPersonal = "https://banco-leche-backend.onrender.com/api/personal/";
const urlServicioEx = "https://banco-leche-backend.onrender.com/api/servicio_ex/";
const urlServicioIn = "https://banco-leche-backend.onrender.com/api/servicio_in/"; // Nueva URL
const urlDonadora = "https://banco-leche-backend.onrender.com/api/donadora/";

class ShowDonadoraDetalle extends Component {
  state = {
    donadoraDetalles: [],
    personales: [],
    serviciosEx: [],
    donadoras: [],
    serviciosIn: [], // Estado para los servicios intrahospitalarios
    modalInsertar: false,
    modalEliminar: false,
    modalInsertarDonadora: false, // Nuevo estado para el modal de donadora
    mesActual: false,
    mostrarTodos: false,
    form: {
      id_donadora_detalle: '',
      no_frasco: '', 
      id_donadora: '',
      fecha: '',
      onzas: '',
      id_extrahospitalario: '',
      id_intrahospitalario: '', // Nuevo campo id_intrahospitalario
      constante: false,
      nueva: false,
      id_personal: '',
      litros: '',
      tipoModal: ''
    },
    errors: {},
    // Estados para la paginación
    totalRecords: 0,
    page: 1,
    rows: 10, // Número de registros por página
    searchValue: '', // Valor de búsqueda de donadora
    filteredDonadoras: [], // Lista de donadoras filtradas
    showSuggestions: false, // Nuevo estado para controlar la visibilidad de las sugerencias
 

    nuevaDonadora: {
      nombre: '',
      apellido: ''
    }
    
  }

  componentDidMount() {
    this.peticionGet();
    this.cargarListasRelacionadas();
  }

  cargarDonadoras = async () => {
    try {
      const response = await axios.get(urlDonadora);
      this.setState({ donadoras: response.data.donadoras });
    } catch (error) {
      console.error("Error al cargar donadoras: ", error);
    }
  };

  handleSearchChange = (e) => {
    const searchValue = e.target.value;
    this.setState({
      searchValue,
      showSuggestions: searchValue.length > 0, // Mostrar sugerencias solo si hay texto
      filteredDonadoras: searchValue
        ? this.state.donadoras.filter((donadora) =>
            `${donadora.nombre} ${donadora.apellido}`.toLowerCase().includes(searchValue.toLowerCase())
          )
        : []
    });
  };

  handleDonadoraSelect = (donadora) => {
    this.setState((prevState) => ({
      form: { ...prevState.form, id_donadora: donadora.id_donadora },
      searchValue: `${donadora.nombre} ${donadora.apellido}`,
      filteredDonadoras: [],
      showSuggestions: false // Ocultar sugerencias después de seleccionar
    }));
  };

  handleNavigate = () => {
    // Usa la función navigate pasada como prop
    this.props.navigate('/resumen-por-servicio');
  };
  handleNavigate2 = () => {
    // Usa la función navigate pasada como prop
    this.props.navigate('/resumendonadoranombre');
  };
  cargarListasRelacionadas = async () => {
    try {
      const [personalRes, servicioExRes, servicioInRes, donadoraRes] = await Promise.all([
        axios.get(urlPersonal),
        axios.get(urlServicioEx),
        axios.get(urlServicioIn), // Cargar servicios intrahospitalarios
        axios.get(urlDonadora)
      ]);
      this.setState({
        personales: personalRes.data.personal,
        serviciosEx: servicioExRes.data,
        serviciosIn: servicioInRes.data, // Guardar los servicios intrahospitalarios
        donadoras: donadoraRes.data.donadoras
      });
    } catch (error) {
      console.log("Error cargando listas relacionadas: ", error);
    }
  };

  peticionGet = () => {
    const { page, rows, mostrarTodos } = this.state;
    const params = mostrarTodos ? '' : '&mesActual=true';
    axios.get(`${urlDonadoraDetalle}?page=${page}&pageSize=${rows}${params}`).then(response => {
      this.setState({
        donadoraDetalles: response.data.donadoraDetalles,
        totalRecords: response.data.totalRecords,
        searchValue: '', // Limpiar el campo de búsqueda
        filteredDonadoras: [], // Limpiar las sugerencias
        showSuggestions: false // Ocultar las sugerencias
      });
    }).catch(error => {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'No se pudo cargar la lista de donadoraDetalles', 'error');
    });
  }

onPageChange = (event) => {
  this.setState({ page: event.page + 1 }, () => {
    this.peticionGet(); // Actualiza los datos cuando se cambia de página
  });
}
  cleanFormData = (formData) => {
    const cleanedData = { ...formData };
    const integerFields = ['id_donadora', 'id_extrahospitalario', 'id_intrahospitalario', 'id_personal'];
    const floatFields = ['onzas', 'litros'];

    for (let field of integerFields) {
      if (cleanedData[field] === '') {
        cleanedData[field] = null;
      } else if (cleanedData[field]) {
        cleanedData[field] = parseInt(cleanedData[field], 10);
      }
    }

    for (let field of floatFields) {
      if (cleanedData[field] === '') {
        cleanedData[field] = null;
      } else if (cleanedData[field]) {
        cleanedData[field] = parseFloat(cleanedData[field]);
      }
    }

    return cleanedData;
  }

  validateForm = () => {
    const { form } = this.state;
    const requiredFields = ['no_frasco', 'id_donadora', 'onzas', 'id_personal'];
    const emptyFields = requiredFields.filter(field => !form[field] && form[field] !== 0);

    if (emptyFields.length > 0) {
      Swal.fire('Error', `Los siguientes campos son requeridos: ${emptyFields.join(', ')}`, 'error');
      return false;
    }

    if (!form.id_extrahospitalario && !form.id_intrahospitalario) {
      Swal.fire('Error', 'Debe seleccionar un servicio extrahospitalario o intrahospitalario', 'error');
      return false;
    }

    return true;
  }

  peticionPost = async () => {
    if (!this.validateForm()) return;

    try {
      const cleanedForm = this.cleanFormData(this.state.form);
      delete cleanedForm.id_donadora_detalle;
      console.log('Datos a enviar:', cleanedForm);
      const response = await axios.post(urlDonadoraDetalle, cleanedForm);
      console.log('Respuesta del servidor:', response.data);
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Registro creado exitosamente', 'success');
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Mensaje de error:', error.message);
      if (error.response) {
        console.error('Datos de la respuesta de error:', error.response.data);
        console.error('Estado de la respuesta de error:', error.response.status);
        console.error('Encabezados de la respuesta de error:', error.response.headers);
        Swal.fire('Error', `Error del servidor: ${error.response.data.message || 'No se pudo crear el registro'}`, 'error');
      } else if (error.request) {
        console.error('Error de solicitud:', error.request);
        Swal.fire('Error', 'No se recibió respuesta del servidor', 'error');
      } else {
        console.error('Error de configuración:', error.message);
        Swal.fire('Error', 'Error al crear el registro', 'error');
      }
    }
  }

  peticionPut = async () => {
    if (!this.validateForm()) return;

    try {
      const cleanedForm = this.cleanFormData(this.state.form);
      console.log('Datos a actualizar:', cleanedForm);
      const response = await axios.put(urlDonadoraDetalle + cleanedForm.id_donadora_detalle, cleanedForm);
      console.log('Respuesta del servidor:', response.data);
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Registro actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Mensaje de error:', error.message);
      if (error.response) {
        console.error('Datos de la respuesta de error:', error.response.data);
        console.error('Estado de la respuesta de error:', error.response.status);
        console.error('Encabezados de la respuesta de error:', error.response.headers);
        Swal.fire('Error', `Error del servidor: ${error.response.data.message || 'No se pudo actualizar el registro'}`, 'error');
      } else if (error.request) {
        console.error('Error de solicitud:', error.request);
        Swal.fire('Error', 'No se recibió respuesta del servidor', 'error');
      } else {
        console.error('Error de configuración:', error.message);
        Swal.fire('Error', 'Error al actualizar el registro', 'error');
      }
    }
  }

  peticionDelete = () => {
    axios.delete(urlDonadoraDetalle + this.state.form.id_donadora_detalle).then(response => {
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Registro eliminado exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al eliminar el registro', 'error');
      console.log(error.message);
    })
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  modalInsertarDonadora = () => {
    this.setState({ modalInsertarDonadora: !this.state.modalInsertarDonadora });
  }

  seleccionarDonadoraDetalle = (donadoraDetalle) => {
    this.setState({
      tipoModal: 'actualizar',
      form: { ...donadoraDetalle }
    });
  }

  handleChange = async (e) => {
    const { name, type, checked, value } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    this.setState(prevState => {
      const newForm = { ...prevState.form, [name]: val };
      
      if (name === 'constante') {
        newForm.nueva = false; // Desmarcar "nueva" si "constante" se marca
      } else if (name === 'nueva') {
        newForm.constante = false; // Desmarcar "constante" si "nueva" se marca
      }  else if (name === 'id_extrahospitalario' || name === 'id_intrahospitalario') {
        // Si el valor seleccionado es vacío, no hacemos nada con el otro campo
        if (val === '') {
          // No hacemos nada, permitimos que el campo se vacíe
        } else {
          // Si se selecciona un valor, limpiamos el otro campo
          newForm.id_extrahospitalario = name === 'id_extrahospitalario' ? val : '';
          newForm.id_intrahospitalario = name === 'id_intrahospitalario' ? val : '';
        }
      }

      return { form: newForm };
    });
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

  handleNewDonadoraChange = (e) => {
    this.setState({
      nuevaDonadora: {
        ...this.state.nuevaDonadora,
        [e.target.name]: e.target.value
      }
    });
  }

  addNewDonadora = async () => {
    const { nuevaDonadora } = this.state;
    try {
      const response = await axios.post(urlDonadora, nuevaDonadora);
      const newDonadora = response.data;
      this.setState(prevState => ({
        donadoras: [...prevState.donadoras, newDonadora],
        form: {
          ...prevState.form,
          id_donadora: newDonadora.id_donadora
        },
        modalInsertarDonadora: false
      }));
      Swal.fire('Éxito', 'Donadora creada exitosamente', 'success');
    } catch (error) {
      console.log(error.message);
      Swal.fire('Error', 'Error al crear la donadora', 'error');
    }
  }
  handleGuardar = () => {
    // Lógica para guardar, después limpia el campo de búsqueda
    this.peticionPost();
    this.setState({ searchValue: '', filteredDonadoras: [] }); // Limpia el campo y las sugerencias
  };

  render() {
    const { form,searchValue, filteredDonadoras, showSuggestions, mostrarTodos, donadoras, modalInsertarDonadora,donadoraDetalles,totalRecords, rows, page  } = this.state;
    const navigate = this.props.navigate; // Obtenemos la función navigate desde props

    return (
      <div className="container-fluid">
         {/* Campo de búsqueda */}
      

        <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-success" onClick={() => { this.setState({ form: null, tipoModal: 'insertar' }); this.modalInsertar() }}>Agregar Registro</button>
        <br /><br />
        
        <div className="filter-form">
          <div className="checkbox-container">
            <input
              type="checkbox"
              checked={mostrarTodos}
              onChange={this.handleMostrarTodosChange}
            />
            <label className="checkbox-label">Mostrar todos los registros</label>
          </div>
          <Button color="info" onClick={this.handleNavigate} className="d-flex align-items-center">
          <FaChartBar className="me-2" /> {/* Ícono a la izquierda */}
          Mostrar Resumen por Servicio
          </Button>
          <Button color="info" onClick={this.handleNavigate2} className="d-flex align-items-center">
          <FaChartBar className="me-2" /> {/* Ícono a la izquierda */}
          Mostrar Resumen por nombre
          </Button>
        </div>
        </div>
       
        <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>No. Frasco</th> {/* Añadir No. Frasco en la tabla */}
              <th>Donadora</th>
              <th>Fecha</th>
              <th>Onzas</th>
              <th>Litros</th>
              <th>Extrahospitalario</th>
              <th>Intrahospitalario</th> {/* Añadir el servicio intrahospitalario */}
              <th>Constante</th>
              <th>Nueva</th>
              <th>Personal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {donadoraDetalles.map(detalle => {
              return (
                <tr key={detalle.id_donadora_detalle}>
                  <td>{detalle.id_donadora_detalle}</td>
                  <td>{detalle.no_frasco}</td> {/* Mostrar No. Frasco */}
                  <td>{detalle.donadoras ? detalle.donadoras.nombre + ' ' + detalle.donadoras.apellido : ''}</td>
                  <td>{this.formatDate(detalle.fecha)}</td>
                  <td>{detalle.onzas}</td>
                  <td>{detalle.litros}</td>
                  <td>{detalle.servicio_exes ? detalle.servicio_exes.servicio : ''}</td>
                  <td>{detalle.servicio_ins ? detalle.servicio_ins.servicio : ''}</td> {/* Mostrar el servicio intrahospitalario */}
                  <td><input type="checkbox" checked={detalle.constante} disabledstyle={{ accentColor: "blue" }}  /></td>
                  <td><input type="checkbox" checked={detalle.nueva} disabledstyle={{ accentColor: "blue" }} /></td>
                  <td>{detalle.personals ? detalle.personals.nombre : ''}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => { this.seleccionarDonadoraDetalle(detalle); this.modalInsertar() }}>Editar</button>
                    {"   "}
                    <button className="btn btn-danger" onClick={() => { this.seleccionarDonadoraDetalle(detalle); this.setState({ modalEliminar: true }) }}>Eliminar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
        <Paginator
          first={(page - 1) * rows}
          rows={rows}
          totalRecords={totalRecords}
          onPageChange={this.onPageChange}
        />
        
        <Modal isOpen={this.state.modalInsertar} toggle={() => this.modalInsertar()}>
          <ModalHeader toggle={() => this.modalInsertar()}>{this.state.tipoModal === 'insertar' ? 'Insertar Registro' : 'Editar Registro'}</ModalHeader>
          <ModalBody>
            <div className="Container">
            <label htmlFor="no_frasco">No. Frasco</label> {/* Nuevo campo no_frasco */}
              <input className="form-control" type="text" name="no_frasco" id="no_frasco" onChange={this.handleChange} value={form ? form.no_frasco : ''} />
              <br />
              <div className="form-group">
      <label htmlFor="donadora-search">Buscar Donadora:</label>
      <input
        type="text"
        id="donadora-search"
        className="form-control"
        placeholder="Nombre de la donadora"
        value={searchValue}
        onChange={this.handleSearchChange}
      />
          {/* Sugerencias de donadoras */}
          {this.state.showSuggestions && filteredDonadoras.length > 0 && (
        <ul className="list-group">
          {filteredDonadoras.map((donadora) => (
            <li
              key={donadora.id_donadora}
              className="list-group-item list-group-item-action"
              onClick={() => this.handleDonadoraSelect(donadora)}
            >
              {donadora.nombre} {donadora.apellido}
            </li>
          ))}
            </ul>
          )}
        </div>
              <label htmlFor="id_donadora">Donadora</label>
              <div className="input-group">
                <select className="form-control" name="id_donadora" onChange={this.handleChange} value={form ? form.id_donadora : ''}>
                  <option value="">Seleccione una donadora</option>
                  {this.state.donadoras.map(donadora => (
                    <option key={donadora.id_donadora} value={donadora.id_donadora}>
                      {donadora.nombre} {donadora.apellido}
                    </option>
                  ))}
                </select>
                <div className="input-group-append">
                  <button className="btn btn-outline-secondary" type="button" onClick={this.modalInsertarDonadora}>
                    Agregar Nueva Donadora
                  </button>
                </div>
              </div>
              <br />
              <label htmlFor="fecha">Fecha</label>
              <input className="form-control" type="date" name="fecha" id="fecha" onChange={this.handleChange} value={form ? form.fecha : ''} />
              <br />
              <label htmlFor="onzas">Onzas</label>
              <input className="form-control" type="number" name="onzas" id="onzas" onChange={this.handleChange} value={form ? form.onzas : ''} />
              <br />
              <label htmlFor="litros">Litros</label>
              <input className="form-control" type="text" name="litros" id="litros" value={form ? form.litros : ''} readOnly />
              <br />
              <label htmlFor="id_extrahospitalario">Servicio Extrahospitalario</label>
              <select className="form-control" name="id_extrahospitalario" onChange={this.handleChange} value={form ? form.id_extrahospitalario : ''}>
                <option value="">Seleccione un servicio</option>
                {this.state.serviciosEx.map(servicio => (
                  <option key={servicio.id_extrahospitalario} value={servicio.id_extrahospitalario}>
                    {servicio.servicio}
                  </option>
                ))}
              </select>
              <br />
              <label htmlFor="id_intrahospitalario">Servicio Intrahospitalario</label> {/* Nuevo campo para servicios intrahospitalarios */}
              <select className="form-control" name="id_intrahospitalario" onChange={this.handleChange} value={form ? form.id_intrahospitalario : ''}>
                <option value="">Seleccione un servicio</option>
                {this.state.serviciosIn.map(servicio => (
                  <option key={servicio.id_intrahospitalario} value={servicio.id_intrahospitalario}>{servicio.servicio}</option>
                ))}
              </select>
              <br />
              <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                name="constante"
                id="constante"
                onChange={this.handleChange}
                checked={form ? form.constante : false}
              />
              <label className="form-check-label" htmlFor="constante">Constante</label>
              </div>

              <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                name="nueva"
                id="nueva"
                onChange={this.handleChange}
                checked={form ? form.nueva : false}
              />
              <label className="form-check-label" htmlFor="nueva">Nueva</label>
              </div>
             
              <label htmlFor="id_personal">Personal</label>
              <select className="form-control" name="id_personal" onChange={this.handleChange} value={form ? form.id_personal : ''}>
                <option value="">Seleccione personal</option>
                {this.state.personales.map(personal => (
                  <option key={personal.id_personal} value={personal.id_personal}>
                    {personal.nombre} {personal.apellido}
                  </option>
                ))}
              </select>
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

        {/* Modal para agregar nueva donadora */}
        <Modal isOpen={this.state.modalInsertarDonadora} toggle={this.modalInsertarDonadora}>
          <ModalHeader toggle={this.modalInsertarDonadora}>Agregar Nueva Donadora</ModalHeader>
          <ModalBody>
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                className="form-control"
                type="text"
                name="nombre"
                id="nombre"
                onChange={this.handleNewDonadoraChange}
                value={this.state.nuevaDonadora.nombre}
              />
              <br />
              <label htmlFor="apellido">Apellido</label>
              <input
                className="form-control"
                type="text"
                name="apellido"
                id="apellido"
                onChange={this.handleNewDonadoraChange}
                value={this.state.nuevaDonadora.apellido}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-success" onClick={this.addNewDonadora}>Agregar</button>
            <button className="btn btn-secondary" onClick={this.modalInsertarDonadora}>Cancelar</button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

// Componente funcional que envuelve el componente basado en clases
function ShowDonadoraDetalleWrapper() {
  const navigate = useNavigate();
  return <ShowDonadoraDetalle navigate={navigate} />;
}

export default ShowDonadoraDetalleWrapper;