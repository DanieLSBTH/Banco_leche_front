import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Paginator } from 'primereact/paginator';

const url = "http://localhost:8080/api/personal_estimulacion/";

class ShowEstimulacionPersonas extends Component {
  state = {
    personal_estimulaciones: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_personal_estimulacion: '',
      nombre: '',
      apellido: '',
      tipoModal: ''
    },
    totalRecords: 0,
    currentPage: 1,
    rowsPerPage: 10,
  }

  // Función para obtener los registros con paginación
  peticionGet = async () => {
    const { currentPage, rowsPerPage } = this.state;
    const response = await axios.get(`${url}?page=${currentPage}&limit=${rowsPerPage}`);
    this.setState({ 
      personal_estimulaciones: response.data.personal_estimulaciones,
      totalRecords: response.data.totalRecords 
    });
  } 

  peticionPost = async () => {
    if (!this.validarFormulario()) return;

    delete this.state.form.id_personal_estimulacion;
    await axios.post(url, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Registro creado exitosamente', 'success');
    }).catch(error => {
      console.log(error.message);
      Swal.fire('Error', 'Error al crear el registro', 'error');
    });
  }

  peticionPut = () => {
    if (!this.validarFormulario()) return;

    axios.put(url + this.state.form.id_personal_estimulacion, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Registro actualizado exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al actualizar el registro', 'error');
      console.log(error.message);
    });
  }

  peticionDelete = () => {
    axios.delete(url + this.state.form.id_personal_estimulacion).then(response => {
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Registro eliminado exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al eliminar el registro', 'error');
      console.log(error.message);
    });
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  seleccionarPersona = (persona) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_personal_estimulacion: persona.id_personal_estimulacion,
        nombre: persona.nombre,
        apellido: persona.apellido
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

  validarFormulario = () => {
    const { form } = this.state;
    if (!form) {
      Swal.fire('Error', 'El formulario está vacío.', 'error');
      return false;
    }

    const { nombre, apellido } = form;
    if (!nombre || !apellido) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return false;
    }

    return true;
  }

  onPageChange = (event) => {
    this.setState(
      { currentPage: event.page + 1 },
      () => {
        this.peticionGet();
      }
    );
  }

  componentDidMount() {
    this.peticionGet();
  }

  render() {
    const { form, totalRecords, rowsPerPage, currentPage, personal_estimulaciones } = this.state;
    return (
      <div className="App">
        <button className="btn btn-success" onClick={() => { this.setState({ form: null, tipoModal: 'insertar' }); this.modalInsertar() }}>Agregar Persona</button>
        <br /><br />
        <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {personal_estimulaciones.map((persona, index) => {
              return (
                <tr key={persona.id_personal_estimulacion}>
                  <td>{index + 1 + (currentPage - 1) * rowsPerPage}</td>
                  <td>{persona.nombre}</td>
                  <td>{persona.apellido}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => { this.seleccionarPersona(persona); this.modalInsertar() }}>Editar</button>
                    {"   "}
                    <button className="btn btn-danger" onClick={() => { this.seleccionarPersona(persona); this.setState({ modalEliminar: true }) }}>Eliminar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
        <Paginator
          first={(currentPage - 1) * rowsPerPage}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPageChange={this.onPageChange}
        />

        <Modal isOpen={this.state.modalInsertar} toggle={() => this.modalInsertar()}>
          <ModalHeader toggle={() => this.modalInsertar()}>{this.state.tipoModal === 'insertar' ? 'Insertar Persona' : 'Editar Persona'}</ModalHeader>
          <ModalBody>
            <div className="form-group">
              {this.state.tipoModal === 'actualizar' && (
                <>
                  <label htmlFor="id_personal_estimulacion">ID</label>
                  <input className="form-control" type="text" name="id_personal_estimulacion" id="id_personal_estimulacion" readOnly onChange={this.handleChange} value={form ? form.id_personal_estimulacion : ''} />
                  <br />
                </>
              )}
              <label htmlFor="nombre">Nombre</label>
              <input className="form-control" type="text" name="nombre" id="nombre" onChange={this.handleChange} value={form ? form.nombre : ''} />
              <br />
              <label htmlFor="apellido">Apellido</label>
              <input className="form-control" type="text" name="apellido" id="apellido" onChange={this.handleChange} value={form ? form.apellido : ''} />
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

        <Modal isOpen={this.state.modalEliminar} toggle={() => this.modalInsertar()}>
          <ModalHeader>Eliminar Persona</ModalHeader>
          <ModalBody>
            Estás seguro que deseas eliminar a {form && form.nombre} {form && form.apellido}?
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

export default ShowEstimulacionPersonas;
