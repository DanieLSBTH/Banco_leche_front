import React, { Component } from 'react';
import axios from 'axios';
import { Paginator } from 'primereact/paginator';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const url = "https://banco-leche-backend.onrender.com/api/personal/";

class ShowPersonal extends Component {
  state = {
    personal: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_personal: '',
      nombre: '',
      apellido: '',
      puesto: '',
      tipoModal: ''
    },
    errors: {},
    // Estados para la paginación
    totalRecords: 0,
    page: 1,
    rows: 10, // Número de registros por página
  }

  // Método modificado para soportar paginación
  peticionGet = () => {
    const { page, rows } = this.state;
    axios.get(`${url}?page=${page}&limit=${rows}`).then(response => {
      this.setState({ 
        personal: response.data.personal,// Asigna directamente los datos de personal
        totalRecords: response.data.totalRecords // Asegúrate de que estás obteniendo el total de registros
      });
    }).catch(error => {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'No se pudo cargar la lista de personal', 'error');
    });
  }
  

  onPageChange = (event) => {
    this.setState({ page: event.page + 1 }, () => {
      this.peticionGet(); // Actualiza los datos cuando se cambia de página
    });
  }
  

  peticionPost = async () => {
    if (this.validarFormulario()) {
      delete this.state.form.id_personal;
      try {
        await axios.post(url, this.state.form);
        this.modalInsertar();
        this.peticionGet();
        Swal.fire('Éxito', 'Personal creado exitosamente', 'success');
      } catch (error) {
        console.error('Error creating personal:', error);
        Swal.fire('Error', 'Error al crear el personal', 'error');
      }
    }
  }

  peticionPut = async () => {
    if (this.validarFormulario()) {
      try {
        await axios.put(url + this.state.form.id_personal, this.state.form);
        this.modalInsertar();
        this.peticionGet();
        Swal.fire('Éxito', 'Personal actualizado exitosamente', 'success');
      } catch (error) {
        console.error('Error updating personal:', error);
        Swal.fire('Error', 'Error al actualizar el personal', 'error');
      }
    }
  }

  peticionDelete = async () => {
    try {
      await axios.delete(url + this.state.form.id_personal);
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Personal eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting personal:', error);
      Swal.fire('Error', 'Error al eliminar el personal', 'error');
    }
  }

  validarFormulario = () => {
    const { nombre, apellido, puesto } = this.state.form;
    let errors = {};
    let formIsValid = true;

    if (!nombre || nombre.trim() === '') {
      formIsValid = false;
      errors["nombre"] = "El nombre es requerido";
    } else if (nombre.length > 50) {
      formIsValid = false;
      errors["nombre"] = "El nombre no puede exceder 50 caracteres";
    }

    if (!apellido || apellido.trim() === '') {
      formIsValid = false;
      errors["apellido"] = "El apellido es requerido";
    } else if (apellido.length > 50) {
      formIsValid = false;
      errors["apellido"] = "El apellido no puede exceder 50 caracteres";
    }

    if (!puesto || puesto.trim() === '') {
      formIsValid = false;
      errors["puesto"] = "El puesto es requerido";
    } else if (puesto.length > 100) {
      formIsValid = false;
      errors["puesto"] = "El puesto no puede exceder 100 caracteres";
    }

    this.setState({ errors: errors });
    return formIsValid;
  }

  modalInsertar = () => {
    this.setState(prevState => ({
      modalInsertar: !prevState.modalInsertar,
      errors: {}
    }));
  }

  seleccionarPersonal = (personal) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_personal: personal.id_personal,
        nombre: personal.nombre,
        apellido: personal.apellido,
        puesto: personal.puesto
      },
      errors: {}
    })
  }

  handleChange = async (e) => {
    const { name, value } = e.target;
    await this.setState(prevState => ({
      form: {
        ...prevState.form,
        [name]: value
      }
    }));
    this.validarFormulario();
  }

  componentDidMount() {
    this.peticionGet();
  }

  render() {
    const { form, errors, personal, totalRecords, rows, page } = this.state;
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-success" onClick={() => { this.setState({ form: { nombre: '', apellido: '', puesto: '' }, tipoModal: 'insertar', errors: {} }); this.modalInsertar() }}>Agregar Personal</button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Puesto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personal.map(persona => (
                <tr key={persona.id_personal}>
                  <td>{persona.id_personal}</td>
                  <td>{persona.nombre}</td>
                  <td>{persona.apellido}</td>
                  <td>{persona.puesto}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => { this.seleccionarPersonal(persona); this.modalInsertar() }}>Editar</button>
                    {"   "}
                    <button className="btn btn-danger" onClick={() => { this.seleccionarPersonal(persona); this.setState({ modalEliminar: true }) }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Paginator 
  first={(page - 1) * rows} 
  rows={rows} 
  totalRecords={totalRecords} 
  onPageChange={this.onPageChange} 
/>


        <Modal isOpen={this.state.modalInsertar} toggle={this.modalInsertar}>
          <ModalHeader toggle={this.modalInsertar}>{this.state.tipoModal === 'insertar' ? 'Insertar Personal' : 'Editar Personal'}</ModalHeader>
          <ModalBody>
            <div className="Container">
              <label htmlFor="id_personal">ID</label>
              <input className="form-control" type="text" name="id_personal" id="id_personal" readOnly value={form ? form.id_personal : this.state.personal.length + 1} />
              <br />
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="nombre">Nombre</label>
                  <input className="form-control" type="text" name="nombre" id="nombre" onChange={this.handleChange} value={form ? form.nombre : ''} />
                  {errors.nombre && <div className="text-danger">{errors.nombre}</div>}
                </div>
                <br />
                <div className="form-group col-md-6">
                  <label htmlFor="apellido">Apellido</label>
                  <input className="form-control" type="text" name="apellido" id="apellido" onChange={this.handleChange} value={form ? form.apellido : ''} />
                  {errors.apellido && <div className="text-danger">{errors.apellido}</div>}
                </div>
                <br />
                <div className="form-group col-md-6">
                  <label htmlFor="puesto">Puesto</label>
                  <input className="form-control" type="text" name="puesto" id="puesto" onChange={this.handleChange} value={form ? form.puesto : ''} />
                  {errors.puesto && <div className="text-danger">{errors.puesto}</div>}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            {this.state.tipoModal === 'insertar' ?
              <button className="btn btn-success" onClick={this.peticionPost}>Insertar</button> :
              <button className="btn btn-primary" onClick={this.peticionPut}>Actualizar</button>
            }
            <button className="btn btn-danger" onClick={this.modalInsertar}>Cancelar</button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.modalEliminar}>
          <ModalBody>
            ¿Estás seguro de que deseas eliminar el registro de {form && form.nombre} {form && form.apellido}?
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-danger" onClick={this.peticionDelete}>Eliminar</button>
            <button className="btn btn-secondary" onClick={() => this.setState({ modalEliminar: false })}>Cancelar</button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ShowPersonal;
