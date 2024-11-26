import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { FaTrash,FaClipboardList,FaChartBar, FaAddressCard ,FaBuilding, FaClinicMedical, FaBaby, FaSistrix,FaCalendarDay,FaGlassWhiskey, FaTint, FaFlask ,FaClipboardCheck  } from 'react-icons/fa';
import { FcAbout,FcAddRow, FcList, FcAcceptDatabase, FcSurvey, FcAddDatabase } from "react-icons/fc";

// URLs de las APIs
const urlDonadoraDetalle = "https://banco-leche-backend.onrender.com/api/donadora_detalle/";
const urlPersonal = "https://banco-leche-backend.onrender.com/api/personal/";
const urlServicioEx = "https://banco-leche-backend.onrender.com/api/servicio_ex/";
const urlServicioIn = "https://banco-leche-backend.onrender.com/api/servicio_in/"; // Nueva URL
const urlDonadora = "https://banco-leche-backend.onrender.com/api/donadora/";

class InsertarDonadoraModal extends Component {
  state = {
    // Inicializar arrays vacíos
    donadoras: [],
    personales: [],
    serviciosEx: [],
    serviciosIn: [],
    donadoraDetalles: [],
    modalInsertar: false,
    modalInsertarDonadora: false,
    searchValue: '',
    filteredDonadoras: [],
    showSuggestions: false,
    
    // Estados para el nuevo sistema de encabezado-detalle
    encabezado: {
      id_donadora: '',
      tipo_servicio: '',
      id_servicio: '',
      fecha: '',
      id_personal:'',
      
    },
    detalles: [],
    detalleTemp: {
      no_frasco: '',
      onzas: '',
      litros: '',
      constante: false,
      nueva: false
      
      
    },
    
    // Otros estados existentes
    totalRecords: 0,
    page: 1,
    rows: 10,
    nuevaDonadora: {
      nombre: '',
      apellido: ''
    }
  }

  async componentDidMount() {
    try {
      // Cargar todos los datos necesarios
      const [donadorasRes, personalRes, servicioExRes, servicioInRes] = await Promise.all([
        axios.get(urlDonadora),
        axios.get(urlPersonal),
        axios.get(urlServicioEx),
        axios.get(urlServicioIn)
      ]);

      this.setState({
        donadoras: donadorasRes.data.donadoras || [],
        personales: personalRes.data.personal || [],
        serviciosEx: servicioExRes.data || [],
        serviciosIn: servicioInRes.data || []
      });
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos iniciales', 'error');
    }
  }

  // Método para agregar un detalle al "carrito"
  agregarDetalle = () => {
    const { detalleTemp } = this.state;
    
    // Validaciones
    if (!detalleTemp.no_frasco  || !detalleTemp.onzas ) {
      Swal.fire('Error', 'Todos los campos del detalle son requeridos', 'error');
      return;
    }
    if (!detalleTemp.constante && !detalleTemp.nueva) {
      Swal.fire('Error', 'Debe seleccionar "Constante" o "Nueva"', 'error');
      return;
  }
  

    // Calcular litros
    const litros = parseFloat(detalleTemp.onzas) * 0.0295735;

    const nuevoDetalle = {
      ...detalleTemp,
      litros: litros.toFixed(4),
      id: Date.now()
    };

    this.setState(prevState => ({
      detalles: [...prevState.detalles, nuevoDetalle],
      detalleTemp: {
        no_frasco: '',
        onzas: '',
        litros: '',
        constante: false,
        nueva: false
       
      }
    }));
  }

  // Método para eliminar un detalle del "carrito"
  eliminarDetalle = (id) => {
    this.setState(prevState => ({
      detalles: prevState.detalles.filter(detalle => detalle.id !== id)
    }));
  }

  // Método para guardar todo (encabezado y detalles)
  guardarRegistroCompleto = async () => {
    const { encabezado, detalles } = this.state;

    // Validar encabezado
    if (!encabezado.id_donadora || !encabezado.tipo_servicio || !encabezado.id_servicio ||!encabezado.fecha ||!encabezado.id_personal) {
      Swal.fire('Error', 'Debe completar los datos del encabezado', 'error');
      return;
    }

    // Validar que haya detalles
    if (detalles.length === 0) {
      Swal.fire('Error', 'Debe agregar al menos un detalle', 'error');
      return;
    }

    try {
      // Preparar los datos para enviar
      const registrosParaGuardar = detalles.map(detalle => ({
        id_donadora: encabezado.id_donadora,
        id_extrahospitalario: encabezado.tipo_servicio === 'extrahospitalario' ? encabezado.id_servicio : null,
        id_intrahospitalario: encabezado.tipo_servicio === 'intrahospitalario' ? encabezado.id_servicio : null,
        fecha: encabezado.fecha,
        id_personal: encabezado.id_personal,
        ...detalle
      }));

      // Guardar todos los registros
      await Promise.all(registrosParaGuardar.map(registro => 
        axios.post(urlDonadoraDetalle, registro)
      ));

      Swal.fire('Éxito', 'Registros guardados correctamente', 'success');
      this.limpiarFormulario();
      this.modalInsertar();
      
      // Llamar a la función de actualización del padre
      if (this.props.onRegistrosGuardados) {
        this.props.onRegistrosGuardados();
      }
      
    } catch (error) {
      console.error('Error al guardar:', error);
      Swal.fire('Error', 'No se pudieron guardar los registros', 'error');
    }
  }

  handleEncabezadoChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      encabezado: {
        ...prevState.encabezado,
        [name]: value
      }
    }));
  }
  handleDetalleChange = (e) => {
    const { name, type, checked, value } = e.target;
    const val = type === 'checkbox' ? checked : value;
  
    this.setState((prevState) => ({
      detalleTemp: {
        ...prevState.detalleTemp,
        [name]: val,
        // Si el usuario marca constante, desmarca nueva
        ...(name === "constante" && { nueva: !checked }),
        // Si el usuario marca nueva, desmarca constante
        ...(name === "nueva" && { constante: !checked }),
      },
    }));
  };
  
  

  modalInsertar = () => {
    this.setState((prevState) => ({
      modalInsertar: !prevState.modalInsertar,
      searchValue: '', // Limpia el valor de búsqueda
      filteredDonadoras: [], // Limpia sugerencias
      showSuggestions: false // Oculta las sugerencias
    }), () => {
      // Callback para limpiar cuando se cierra
      if (!this.state.modalInsertar) {
        this.limpiarFormulario();
      }
    });
  };
  

  limpiarFormulario = () => {
    this.setState({
      encabezado: {
        id_donadora: '',
        tipo_servicio: '',
        id_servicio: '',
        fecha: '',
        id_personal: '',
      },
      detalles: [],
      detalleTemp: {
        no_frasco: '',
        
        onzas: '',
        litros: '',
        constante: false,
        nueva: false,
        
      }
    });
  }
 
  handleNewDonadoraChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      nuevaDonadora: {
        ...prevState.nuevaDonadora,
        [name]: value,
      },
    }));
  };
 
  handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    this.setState({
      searchValue,
      showSuggestions: searchValue.length > 0, // Mostrar sugerencias solo si hay texto
      filteredDonadoras: searchValue
        ? this.state.donadoras.filter((donadora) =>
            `${donadora.nombre} ${donadora.apellido}`.toLowerCase().includes(searchValue)
          )
        : [],
    });
  };
  
  handleDonadoraSelect = (donadora) => {
    this.setState({
      encabezado: {
        ...this.state.encabezado,
        id_donadora: donadora.id_donadora, // Actualiza el ID de la donadora
      },
      searchValue: `${donadora.nombre} ${donadora.apellido}`, // Muestra el nombre completo en el campo de búsqueda
      showSuggestions: false, // Oculta las sugerencias
      filteredDonadoras: [], // Limpia las sugerencias
    });
  };
  
  modalInsertarDonadora = () => {
    this.setState((prevState) => ({
      modalInsertarDonadora: !prevState.modalInsertarDonadora,
      nuevaDonadora: {
        nombre: '',
        apellido: '',
      },
    }));
  };
  
  addNewDonadora = async () => {
    const { nuevaDonadora } = this.state;
    try {
      const response = await axios.post(urlDonadora, nuevaDonadora);
      const newDonadora = response.data; // Supone que el servidor devuelve la nueva donadora con su ID
  
      this.setState((prevState) => ({
        donadoras: [...prevState.donadoras, newDonadora],
        encabezado: {
          ...prevState.encabezado,
          id_donadora: newDonadora.id_donadora, // Selecciona automáticamente la nueva donadora
        },
        modalInsertarDonadora: false, // Cierra el modal
      }));
  
      Swal.fire('Éxito', 'Donadora creada exitosamente', 'success');
    } catch (error) {
      console.error(error.message);
      Swal.fire('Error', 'Error al crear la donadora', 'error');
    }
  };
  
 

  render() {
    const { encabezado, detalles, detalleTemp,searchValue, filteredDonadoras, donadoras, serviciosEx, serviciosIn, personales, modalInsertarDonadora } = this.state;

    return (
      <div className="container-fluid">
        <button className="btn btn-success" onClick={this.modalInsertar}>
          Agregar Varios Frascos a una donadora <FcAddDatabase />
        </button>

        <Modal isOpen={this.state.modalInsertar} toggle={()=>{this.modalInsertar();this.limpiarFormulario(); }} size="lg">
          <ModalHeader toggle={()=>{this.modalInsertar();this.limpiarFormulario();}}>Registro de Donación <FcSurvey /> </ModalHeader>
          <ModalBody>
            {/* Sección de Encabezado */}
            <div className="border p-3 mb-3">
              <h5>Datos Generales <FcAbout /></h5>
              
              <div className="row g-3">
  {/* Columna Izquierda */}
  <div className="col-md-6">
    <div className="form-group mb-3">
      <label htmlFor="donadora-search">Buscar Donadora: <FaSistrix /></label>
      <input
        type="text"
        id="donadora-search"
        className="form-control"
        placeholder="Nombre de la donadora"
        value={this.state.searchValue}
        onChange={this.handleSearchChange}
      />
      {this.state.showSuggestions && (
        <ul className="list-group">
          {this.state.filteredDonadoras.map((donadora) => (
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

    <div className="form-group mb-3">
      <label>Donadora <FaBaby /></label>
      <div className="input-group">
      <select
        className="form-control"
        name="id_donadora"
        value={encabezado.id_donadora}
        onChange={this.handleEncabezadoChange}
      >
        <option value="">Seleccione una donadora</option>
        {donadoras.map((donadora) => (
          <option
            key={donadora.id_donadora}
            value={donadora.id_donadora}
          >
            {donadora.nombre} {donadora.apellido}
          </option>
        ))}
      </select>
      <button
        className="btn btn-outline-secondary"
        type="button"
        onClick={this.modalInsertarDonadora}
      >+ Donadora
      </button>
    </div>
    </div>
    

    <div className="form-group">
      <label>Fecha <FaCalendarDay /></label>
      <input
        type="date"
        className="form-control"
        name="fecha"
        value={encabezado.fecha}
        onChange={this.handleEncabezadoChange}
      />
    </div>
  </div>

  {/* Columna Derecha */}
  <div className="col-md-6">
    {/* Margen superior para alinear con "Buscar Donadora" */}
    <div className="form-group mb-3">
      <label>Tipo de Servicio <FaClinicMedical /></label>
      <select
        className="form-control"
        name="tipo_servicio"
        value={encabezado.tipo_servicio}
        onChange={this.handleEncabezadoChange}
      >
        <option value="">Seleccione tipo de servicio</option>
        <option value="extrahospitalario">Extrahospitalario</option>
        <option value="intrahospitalario">Intrahospitalario</option>
      </select>
    </div>

    {encabezado.tipo_servicio && (
      <div className="form-group mb-3">
        <label>Servicio</label>
        <select
          className="form-control"
          name="id_servicio"
          value={encabezado.id_servicio}
          onChange={this.handleEncabezadoChange}
        >
          <option value="">Seleccione un servicio</option>
          {encabezado.tipo_servicio === 'extrahospitalario'
            ? serviciosEx.map((servicio) => (
                <option
                  key={servicio.id_extrahospitalario}
                  value={servicio.id_extrahospitalario}
                >
                  {servicio.servicio}
                </option>
              ))
            : serviciosIn.map((servicio) => (
                <option
                  key={servicio.id_intrahospitalario}
                  value={servicio.id_intrahospitalario}
                >
                  {servicio.servicio}
                </option>
              ))}
        </select>
      </div>
    )}

    <div className="form-group mb-3">
      <label>Personal <FaAddressCard /></label>
      <select
        className="form-control"
        name="id_personal"
        value={encabezado.id_personal}
        onChange={this.handleEncabezadoChange}
      >
        <option value="">Seleccione personal</option>
        {personales.map((personal) => (
          <option
            key={personal.id_personal}
            value={personal.id_personal}
          >
            {personal.nombre} {personal.apellido}
          </option>
        ))}
      </select>
    </div>
  </div>
</div>

            </div>

            {/* Sección de Detalle */}
            <div className="border p-3">
  <h5>Detalles de Donación <FcList /></h5>

  <div className="row">
    {/* No. Frasco */}
    <div className="col-12 col-md-6 mb-3">
      <div className="form-group">
        <label>No. Frasco <FaGlassWhiskey /></label>
        <input
          type="text"
          className="form-control"
          name="no_frasco"
          value={detalleTemp.no_frasco}
          onChange={this.handleDetalleChange}
        />
      </div>
    </div>

    {/* Onzas */}
    <div className="col-12 col-md-6 mb-3">
      <div className="form-group">
        <label>Onzas <FaTint/></label>
        <input
          type="number"
          className="form-control"
          name="onzas"
          value={detalleTemp.onzas}
          onChange={this.handleDetalleChange}
        />
      </div>
    </div>
  </div>

  <div className="row">
    {/* Checkbox Constante */}
    <div className="col-12 col-md-6 mb-3">
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id="constante"
          name="constante"
          checked={detalleTemp.constante}
          onChange={this.handleDetalleChange}
        />
        <label className="form-check-label" htmlFor="constante">
          Constante
        </label>
      </div>
    </div>

    {/* Checkbox Nueva */}
    <div className="col-12 col-md-6 mb-3">
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id="nueva"
          name="nueva"
          checked={detalleTemp.nueva}
          onChange={this.handleDetalleChange}
        />
        <label className="form-check-label" htmlFor="nueva">
          Nueva
        </label>
      </div>
    </div>
  </div>
              <button 
                className="btn btn-primary mt-3"
                onClick={this.agregarDetalle}
              >
              Agregar más frascos a la donadora <FaClipboardList />
              </button>
            </div>

            {/* Lista de detalles agregados */}
            {detalles.length > 0 && (
              <div className="mt-4">
                <h5>Detalles Agregados</h5>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>No. Frasco</th>
                        <th>Fecha</th>
                        <th>Onzas</th>
                        <th>Litros</th>
                        <th>Constante</th>
                        <th>Nueva</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map(detalle => (
                        <tr key={detalle.id}>
                          <td>{detalle.no_frasco}</td>
                          <td>{encabezado.fecha}</td>
                          <td>{detalle.onzas}</td>
                          <td>{detalle.litros}</td>
                          <td>{detalle.constante ? "Sí" : "No"}</td>
                          <td>{detalle.nueva ? "Sí" : "No"}</td>
                          
                          <td>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => this.eliminarDetalle(detalle.id)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <button 
              className="btn btn-success"
              onClick={this.guardarRegistroCompleto}
              disabled={detalles.length === 0}
            >
              Guardar Todo <FcAcceptDatabase />
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => {
                this.limpiarFormulario(); // Limpia primero
                this.modalInsertar(); // Luego cierra el modal
              }}
              
            >
              Cancelar
            </button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={modalInsertarDonadora} toggle={this.modalInsertarDonadora}>
  <ModalHeader toggle={this.modalInsertarDonadora}>
    Agregar Nueva Donadora
  </ModalHeader>
  <ModalBody>
    <div className="form-group">
      <label>Nombre</label>
      <input
        type="text"
        className="form-control"
        name="nombre"
        value={this.state.nuevaDonadora.nombre}
        onChange={this.handleNewDonadoraChange}
      />
    </div>
    <div className="form-group">
      <label>Apellido</label>
      <input
        type="text"
        className="form-control"
        name="apellido"
        value={this.state.nuevaDonadora.apellido}
        onChange={this.handleNewDonadoraChange}
      />
    </div>
  </ModalBody>
  <ModalFooter>
    <button className="btn btn-primary" onClick={this.addNewDonadora}>
      Guardar
    </button>
    <button className="btn btn-secondary" onClick={this.modalInsertarDonadora}>
      Cancelar
    </button>
  </ModalFooter>
</Modal>

      </div>
    );
  }
}

export default InsertarDonadoraModal;