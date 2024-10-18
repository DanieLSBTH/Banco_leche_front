import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Paginator } from 'primereact/paginator'; // Importar el componente de paginación

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
      fecha_almacenamiento: '',
      volumen_ml_onza: '',
      tipo_de_leche: '',
      fecha_entrega: '',
      responsable: '',
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

  validateForm = () => {
    const { form } = this.state;
    let errors = {};
    let formIsValid = true;

    // Validaciones
    if (!form.id_pasteurizacion) {
      formIsValid = false;
      errors["id_pasteurizacion"] = "Debe seleccionar un número de frasco.";
    }
    if (!form.fecha_almacenamiento) {
      formIsValid = false;
      errors["fecha_almacenamiento"] = "La fecha de almacenamiento es requerida.";
    }
    if (!form.volumen_ml_onza || form.volumen_ml_onza <= 0) {
      formIsValid = false;
      errors["volumen_ml_onza"] = "El volumen debe ser mayor a 0.";
    }
    if (!form.tipo_de_leche) {
      formIsValid = false;
      errors["tipo_de_leche"] = "El tipo de leche es requerido.";
    }
    if (!form.fecha_entrega) {
      formIsValid = false;
      errors["fecha_entrega"] = "La fecha de entrega es requerida.";
    }
    if (!form.responsable) {
      formIsValid = false;
      errors["responsable"] = "El responsable es requerido.";
    }

    this.setState({ errors });
    return formIsValid;
  };

  peticionPost = async () => {
    if (this.validateForm()) {
      const { form, currentPage, pageSize } = this.state;
      const dataToSend = { ...form };
      delete dataToSend.id_control_leche;

      await axios.post(urlControlLeche, dataToSend)
        .then(response => {
          this.modalInsertar();
          this.fetchControlLeches(currentPage, pageSize);
          Swal.fire('Éxito', 'Registro creado exitosamente', 'success');
        })
        .catch(error => {
          console.log('Error al crear el registro:', error.message);
          Swal.fire('Error', 'Error al crear el registro', 'error');
        });
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

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      form: { ...prevState.form, [name]: value }
    }));

    if (this.state.errors[name]) {
      this.setState(prevState => ({
        errors: { ...prevState.errors, [name]: undefined }
      }));
    }
  };

  render() {
    const { form, controlLeches, pasteurizaciones, modalInsertar, errors, totalRecords, currentPage, pageSize } = this.state;

    return (
      <div className="App container-fluid">
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
                    <td>{control.trabajo_de_pasteurizaciones ? control.trabajo_de_pasteurizaciones.no_frasco : ''}</td>
                    <td>{control.fecha_almacenamiento}</td>
                    <td>{control.volumen_ml_onza}</td>
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
              <select 
                className={`form-control ${errors.id_pasteurizacion ? 'is-invalid' : ''}`} 
                onChange={(e) => this.handlePasteurizacionChange(e.target.value)} 
                value={form ? form.id_pasteurizacion : ''}>
                <option value="">Seleccione el número de frasco</option>
                {Array.isArray(pasteurizaciones) && pasteurizaciones.length > 0 ? (
                  pasteurizaciones.map(pasteurizacion => (
                    <option key={pasteurizacion.id_pasteurizacion} value={pasteurizacion.id_pasteurizacion}>
                      {pasteurizacion.no_frasco}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay frascos disponibles</option>
                )}
              </select>
              <div className="invalid-feedback">{errors.id_pasteurizacion}</div>
            </div>
            <div className="form-group">
              <label>Fecha de Almacenamiento</label>
              <input 
                type="date" 
                className={`form-control ${errors.fecha_almacenamiento ? 'is-invalid' : ''}`} 
                name="fecha_almacenamiento" 
                onChange={this.handleChange} 
                value={form ? form.fecha_almacenamiento : ''} 
              />
              <div className="invalid-feedback">{errors.fecha_almacenamiento}</div>
            </div>
            <div className="form-group">
              <label>Volumen (ml/onza)</label>
              <input 
                type="number" 
                className={`form-control ${errors.volumen_ml_onza ? 'is-invalid' : ''}`} 
                name="volumen_ml_onza" 
                onChange={this.handleChange} 
                value={form ? form.volumen_ml_onza : ''} 
              />
              <div className="invalid-feedback">{errors.volumen_ml_onza}</div>
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
                className={`form-control ${errors.fecha_entrega ? 'is-invalid' : ''}`} 
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

export default ShowControlLeche;
