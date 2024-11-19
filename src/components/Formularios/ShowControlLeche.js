import React, { Component } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Paginator } from 'primereact/paginator'; // Importar el componente de paginación
import { useNavigate } from 'react-router-dom';
import { FaChartBar } from 'react-icons/fa';
import { Button } from 'reactstrap';

const urlControlLeche = "https://banco-leche-backend.onrender.com/api/control_de_leches/";
const urlTrabajoPasteurizaciones = "https://banco-leche-backend.onrender.com/api/trabajo_de_pasteurizaciones/";



class ShowControlLeche extends Component {
  state = {
    controlLeches: [],
    pasteurizaciones: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_control_leche: '',
      id_pasteurizacion: '',
      no_frascoregistro: '',
      frasco: false,
      tipo_frasco: '', // Nuevo campo
      unidosis: false, // Nuevo campo
      tipo_unidosis: '', // Nuevo campo
      fecha_almacenamiento: '',
      volumen_ml_onza: '',
      tipo_de_leche: '',
      fecha_entrega: '',
      responsable: '',
      letra_adicional:'',
      kcal_l: '',
      porcentaje_grasa: '',
      acidez: '',
    },
    errors: {},
    totalRecords: 0,
    currentPage: 1,
    pageSize: 10,
  };

  componentDidMount() {
    this.fetchControlLeches(this.state.currentPage, this.state.pageSize);
    this.fetchPasteurizaciones();
  }

  fetchControlLeches = (page, pageSize) => {
    axios.get(urlControlLeche, {
      params: {
        page: page,
        pageSize: pageSize,
      }
    })
      .then(response => {
        this.setState({
          controlLeches: response.data.controlDeLeches,
          totalRecords: response.data.totalRecords,
          currentPage: response.data.currentPage,
          // totalPages: response.data.totalPages, // Opcional, no es necesario si usas totalRecords y pageSize
        });
      })
      .catch(error => {
        console.log('Error al obtener controlLeches:', error.message);
      });
  };

  fetchPasteurizaciones = () => {
    axios.get(urlTrabajoPasteurizaciones)
      .then(response => {
        console.log('Respuesta de trabajo_de_pasteurizaciones:', response.data);
        if (Array.isArray(response.data)) {
          this.setState({ pasteurizaciones: response.data });
        } else if (response.data.pasteurizaciones && Array.isArray(response.data.pasteurizaciones)) {
          this.setState({ pasteurizaciones: response.data.pasteurizaciones });
        } else {
          console.warn('Formato inesperado de la respuesta de trabajo_de_pasteurizaciones.');
          this.setState({ pasteurizaciones: [] });
        }
      })
      .catch(error => {
        console.log('Error al obtener trabajo_de_pasteurizaciones:', error.message);
        this.setState({ pasteurizaciones: [] });
      });
  };

  handlePageChange = (event) => {
    const newPage = event.page + 1; // PrimeReact Paginator pages are zero-based
    const newPageSize = event.rows;
    this.setState({ currentPage: newPage, pageSize: newPageSize }, () => {
      this.fetchControlLeches(newPage, newPageSize);
    });
  };

  handlePasteurizacionChange = (id) => {
    const parsedId = parseInt(id, 10);
    const pasteurizacion = this.state.pasteurizaciones.find(p => p.id_pasteurizacion === parsedId);
    if (pasteurizacion) {
      this.setState(prevState => ({
        form: {
          ...prevState.form,
          id_pasteurizacion: id,
          kcal_l: pasteurizacion.kcal_l,
          porcentaje_grasa: pasteurizacion.porcentaje_grasa,
          acidez: pasteurizacion.acidez
        },
        errors: { ...prevState.errors, id_pasteurizacion: undefined }
      }));
    } else {
      this.setState(prevState => ({
        form: { ...prevState.form, id_pasteurizacion: id },
        errors: { ...prevState.errors, id_pasteurizacion: "Debe seleccionar un número de frasco." }
      }));
    }
  };
  handleNavigate = () => {
    // Usa la función navigate pasada como prop
    this.props.navigate('/resumencontrollechefrascos');
  };
  validateForm = () => {
    const { form } = this.state;
    let errors = {};
    let formIsValid = true;
  
    // Validaciones existentes
    if (!form.id_pasteurizacion) {
      formIsValid = false;
      errors["id_pasteurizacion"] = "Debe seleccionar un número de frasco.";
    }
    
    if (!form.tipo_de_leche) {
      formIsValid = false;
      errors["tipo_de_leche"] = "El tipo de leche es requerido.";
    }
  
    // Nuevas validaciones para frasco y unidosis
    if (form.frasco === true) {
      if (!form.tipo_frasco) {
        formIsValid = false;
        errors["tipo_frasco"] = "Debe especificar el tipo de frasco.";
      }
    }
  
    if (form.unidosis === true) {
      if (!form.tipo_unidosis) {
        formIsValid = false;
        errors["tipo_unidosis"] = "Debe especificar el tipo de unidosis.";
      }
    }
    if (!form.fecha_almacenamiento) {
      if (!form.fecha_almacenamiento) {
        formIsValid = false;
        errors["fecha_almacenamiento"] = "Debe especificar la fecha de almacenamiento.";
      }
    }
    if (!form.responsable) {
      if (!form.responsable) {
        formIsValid = false;
        errors["responsable"] = "Debe especificar un responsable.";
      }
    }
  
    this.setState({ errors });
    return formIsValid;
  };

  peticionPost = async () => {
    if (this.validateForm()) {
      const { form, currentPage, pageSize } = this.state;
      const dataToSend = { ...form };
      delete dataToSend.id_control_leche;
  
      // Asegurarse de que los campos relacionados estén correctamente configurados
      if (dataToSend.frasco === true) {
        dataToSend.unidosis = false;
        dataToSend.tipo_unidosis = null;
      }
  
      if (dataToSend.unidosis === true) {
        dataToSend.frasco = false;
        dataToSend.tipo_frasco = null;
      }
  
      try {
        const response = await axios.post(urlControlLeche, dataToSend);
        this.modalInsertar();
        this.fetchControlLeches(currentPage, pageSize);
        Swal.fire('Éxito', 'Registro creado exitosamente', 'success');
      } catch (error) {
        console.log('Error al crear el registro:', error.message);
        Swal.fire('Error', 'Error al crear el registro', 'error');
      }
    }
  };

  peticionPut = () => {
    if (this.validateForm()) {
      const { form, currentPage, pageSize } = this.state;
      axios.put(`${urlControlLeche}${form.id_control_leche}`, form)
        .then(response => {
          this.modalInsertar();
          this.fetchControlLeches(currentPage, pageSize);
          Swal.fire('Éxito', 'Registro actualizado exitosamente', 'success');
        })
        .catch(error => {
          console.log('Error al actualizar el registro:', error.message);
          Swal.fire('Error', 'Error al actualizar el registro', 'error');
        });
    }
  };

  peticionDelete = () => {
    const { form, currentPage, pageSize } = this.state;
    axios.delete(`${urlControlLeche}${form.id_control_leche}`)
      .then(response => {
        this.setState({ modalEliminar: false });
        this.fetchControlLeches(currentPage, pageSize);
        Swal.fire('Éxito', 'Registro eliminado exitosamente', 'success');
      })
      .catch(error => {
        console.log('Error al eliminar el registro:', error.message);
        Swal.fire('Error', 'Error al eliminar el registro', 'error');
      });
  };

  modalInsertar = () => {
    this.setState(prevState => ({ 
      modalInsertar: !prevState.modalInsertar, 
      errors: {},
      form: prevState.modalInsertar ? {} : prevState.form 
    }));
  };

  seleccionarControlLeche = (controlLeche) => {
    this.setState({
      tipoModal: 'actualizar',
      form: { ...controlLeche }
    });
  };

// Elimina los dos handleChange actuales y reemplázalos por este:
handleChange = (e) => {
  const { name, type, checked, value } = e.target;
  
  this.setState(prevState => {
    const newForm = { ...prevState.form };

    if (type === 'checkbox') {
      newForm[name] = checked;
      
      // Si se desmarca un checkbox, limpia su campo relacionado
      if (!checked) {
        if (name === 'frasco') {
          newForm.tipo_frasco = '';
        } else if (name === 'unidosis') {
          newForm.tipo_unidosis = '';
        }
      }
      
      // Si se marca un checkbox, desmarca y limpia el otro
      if (checked) {
        if (name === 'frasco') {
          newForm.unidosis = false;
          newForm.tipo_unidosis = '';
        } else if (name === 'unidosis') {
          newForm.frasco = false;
          newForm.tipo_frasco = '';
        }
      }
    } else {
      newForm[name] = value;
    }

    // Limpiar errores si existen
    const newErrors = { ...prevState.errors };
    if (newErrors[name]) {
      delete newErrors[name];
    }

    return { 
      form: newForm,
      errors: newErrors
    };
  });
};
// En tu componente, agrega este método para formatear las opciones
formatPasteurizacionesOptions = () => {
  return Array.isArray(this.state.pasteurizaciones) ? 
    this.state.pasteurizaciones.map(pasteurizacion => ({
      value: pasteurizacion.id_pasteurizacion,
      label: `${pasteurizacion.no_frasco}`
    })) : [];
};

// Modifica el handlePasteurizacionChange
handlePasteurizacionChange = (selectedOption) => {
  if (selectedOption) {
    const parsedId = parseInt(selectedOption.value, 10);
    const pasteurizacion = this.state.pasteurizaciones.find(p => p.id_pasteurizacion === parsedId);
    
    if (pasteurizacion) {
      this.setState(prevState => ({
        form: {
          ...prevState.form,
          id_pasteurizacion: selectedOption.value,
          kcal_l: pasteurizacion.kcal_l,
          porcentaje_grasa: pasteurizacion.porcentaje_grasa,
          acidez: pasteurizacion.acidez
        },
        errors: { ...prevState.errors, id_pasteurizacion: undefined }
      }));
    }
  } else {
    this.setState(prevState => ({
      form: { 
        ...prevState.form, 
        id_pasteurizacion: '',
        kcal_l: '',
        porcentaje_grasa: '',
        acidez: ''
      },
      errors: { ...prevState.errors, id_pasteurizacion: "Debe seleccionar un número de frasco." }
    }));
  }
};
  render() {
    const { form, controlLeches, pasteurizaciones, modalInsertar, errors, totalRecords, currentPage, pageSize } = this.state;
    const navigate = this.props.navigate; // Obtenemos la función navigate desde props

    return (
      <div className="App container-fluid">
        <Button color="info" onClick={this.handleNavigate} className="d-flex align-items-center">
          <FaChartBar className="me-2" /> {/* Ícono a la izquierda */}
          Mostrar Resumen de frascos
          </Button>
          <br />
        <button 
          className="btn btn-success mb-3" 
          onClick={() => { 
            this.setState({ form: { id_pasteurizacion: '' }, tipoModal: 'insertar' }); 
            this.modalInsertar(); 
          }}
        >
          Agregar Registro
        </button>
        <br />
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>No. Frasco</th>
                <th>Fecha Almacenamiento</th>
                <th>Volumen (ml/onza)</th>
                <th>kcal_l</th>
                <th>Grasa %</th>
                <th>Acidez</th>
                <th>Tipo de Leche</th>
                <th>Fecha Entrega</th>
                <th>Responsable</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {controlLeches.length > 0 ? (
                controlLeches.map(control => (
                  <tr key={control.id_control_leche}>
                    <td>{control.id_control_leche}</td>
                    <td>{control.no_frascoregistro}</td>
                    <td>{control.fecha_almacenamiento}</td>
                    <td>{control.volumen_ml_onza +'ml'}</td>
                    <td>{control.trabajo_de_pasteurizaciones ? control.trabajo_de_pasteurizaciones.kcal_l : ''}</td>
                    <td>{control.trabajo_de_pasteurizaciones ? control.trabajo_de_pasteurizaciones.porcentaje_grasa : ''}</td>
                    <td>{control.trabajo_de_pasteurizaciones ? control.trabajo_de_pasteurizaciones.acidez : ''}</td>
                    <td>{control.tipo_de_leche}</td>
                    <td>{control.fecha_entrega}</td>
                    <td>{control.responsable}</td>
                    <td>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => { 
                          this.seleccionarControlLeche(control); 
                          this.modalInsertar(); 
                        }}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => { 
                          this.seleccionarControlLeche(control); 
                          this.setState({ modalEliminar: true }) 
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center">No hay registros disponibles.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginator */}
        <div className="d-flex justify-content-center mt-3">
          <Paginator 
            first={(currentPage - 1) * pageSize} 
            rows={pageSize} 
            totalRecords={totalRecords} 
            rowsPerPageOptions={[5, 10, 20, 50]} 
            onPageChange={this.handlePageChange} 
          />
        </div>

        {/* Modal Insertar/Actualizar */}
        <Modal isOpen={modalInsertar}>
          <ModalHeader>{form && form.id_control_leche ? 'Actualizar Registro' : 'Agregar Registro'}</ModalHeader>
          <ModalBody>
<div className="form-group">
  <label>No. Frasco</label>
  <Select
    className={errors.id_pasteurizacion ? 'is-invalid' : ''}
    options={this.formatPasteurizacionesOptions()}
    value={this.formatPasteurizacionesOptions().find(
      option => option.value === (form.id_pasteurizacion || '')
    )}
    onChange={this.handlePasteurizacionChange}
    isClearable
    isSearchable
    placeholder="Buscar número de frasco..."
    noOptionsMessage={() => "No hay frascos disponibles"}
    styles={{
      control: (baseStyles, state) => ({
        ...baseStyles,
        borderColor: errors.id_pasteurizacion ? '#dc3545' : state.isFocused ? '#80bdff' : '#ced4da',
        boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
        '&:hover': {
          borderColor: errors.id_pasteurizacion ? '#dc3545' : '#80bdff'
        }
      }),
      placeholder: (baseStyles) => ({
        ...baseStyles,
        color: '#6c757d'
      }),
      input: (baseStyles) => ({
        ...baseStyles,
        color: '#495057'
      }),
      option: (baseStyles, { isFocused, isSelected }) => ({
        ...baseStyles,
        backgroundColor: isSelected 
          ? '#007bff' 
          : isFocused 
            ? '#f8f9fa'
            : null,
        color: isSelected ? 'white' : '#495057',
        ':active': {
          backgroundColor: '#007bff',
          color: 'white'
        }
      })
    }}
  />
  {errors.id_pasteurizacion && (
    <div className="invalid-feedback" style={{ display: 'block' }}>
      {errors.id_pasteurizacion}
    </div>
  )}
</div>
             {/* Nuevo campo: Unidosis */}
             <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                name="frasco"
                id="frasco"
                onChange={this.handleChange}
                checked={form ? form.frasco : false}
              />
              <label className="form-check-label" htmlFor="frasco">frasco</label>
              </div>
              
               {/* Nuevo campo: Tipo de Frasco */}
               <div className="form-group">
  <label>Tipo de Frasco</label>
  <select
    className="form-control"
    name="tipo_frasco"
    onChange={this.handleChange}
    value={form.tipo_frasco || ''}
    disabled={!form.frasco} // Se deshabilita si frasco es false
     
  >
    <option value="">Seleccione un tipo de frasco</option>
    <option value="150ml">150ml</option>
    <option value="180ml">180ml</option>
  </select>
</div>


  <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                name="unidosis"
                id="unidosis"
                onChange={this.handleChange}
                checked={form ? form.unidosis : false}
              />
              <label className="form-check-label" htmlFor="unidosis">unidosis</label>
              </div>

  {/* Nuevo campo: Tipo Unidosis */}
  <div className="form-group">
  <label>Tipo de Unidosis</label>
  <select
    className="form-control"
    name="tipo_unidosis"
    onChange={this.handleChange}
    value={form.tipo_unidosis || ''}
    disabled={!form.unidosis} // Se deshabilita si unidosis es false
      
  >
    <option value="">Seleccione un tipo de unidosis</option>
    <option value="10ml">10ml</option>
    <option value="20ml">20ml</option>
    <option value="30ml">30ml</option>
  </select>
</div>
<div className="form-group">
<label>Identificador frasco adicional(opcional)</label>
              <input 
                type="text" 
                className={`form-control `} 
                name="letra_adicional" 
                id="letra_adicional"
                onChange={this.handleChange} 
                value={form ? form.letra_adicional : ''} 
              />
  </div>
            <div className="form-group">
              <label>Fecha de Almacenamiento</label>
              <input 
                type="date" 
                className={`form-control ${errors.fecha_almacenamiento ? 'is-invalid' : ''} `} 
                name="fecha_almacenamiento" 
                onChange={this.handleChange} 
                value={form ? form.fecha_almacenamiento : ''} 
              />
              <div className="invalid-feedback">{errors.fecha_almacenamiento}</div>
            
              <div className="form-group">
  <label>Tipo de Leche</label>
  <select 
    className={`form-control ${errors.tipo_de_leche ? 'is-invalid' : ''}`} 
    name="tipo_de_leche" 
    onChange={this.handleChange} 
    value={form ? form.tipo_de_leche : ''} 
  >
    <option value="">Selecciona un tipo de leche</option>
    <option value="Madura">Madura</option>
    <option value="Calostro">Calostro</option>
  </select>
  <div className="invalid-feedback">{errors.tipo_de_leche}</div>
</div>

            </div>
            <div className="form-group">
              <label>Fecha de Entrega</label>
              <input 
                type="date" 
                className={`form-control`} 
                name="fecha_entrega" 
                onChange={this.handleChange} 
                value={form ? form.fecha_entrega : ''} 
              />
              <div className="invalid-feedback">{errors.fecha_entrega}</div>
            </div>
            <div className="form-group">
              <label>Responsable</label>
              <input 
                type="text" 
                className={`form-control ${errors.responsable ? 'is-invalid' : ''}`} 
                name="responsable" 
                onChange={this.handleChange} 
                value={form ? form.responsable : ''} 
              />
              <div className="invalid-feedback">{errors.responsable}</div>
            </div>
          </ModalBody>
          <ModalFooter>
            {form.id_control_leche ? (
              <button className="btn btn-primary" onClick={this.peticionPut}>
                Actualizar
              </button>
            ) : (
              <button className="btn btn-success" onClick={this.peticionPost}>
                Insertar
              </button>
            )}
            <button className="btn btn-danger" onClick={this.modalInsertar}>
              Cancelar
            </button>
          </ModalFooter>
        </Modal>

        {/* Modal Eliminar */}
        <Modal isOpen={this.state.modalEliminar}>
          <ModalBody>
            ¿Estás seguro que deseas eliminar el registro?
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-danger" onClick={this.peticionDelete}>Sí</button>
            <button className="btn btn-secondary" onClick={() => this.setState({ modalEliminar: false })}>No</button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
function ResumenControlLecheFrascosWrapper(){
  const navigate = useNavigate();
  return <ShowControlLeche navigate={navigate} />;

}
export default ResumenControlLecheFrascosWrapper;
