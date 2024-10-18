import React, { Component } from 'react';
import axios from 'axios';
import { Paginator } from 'primereact/paginator';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const url = "https://banco-leche-backend.onrender.com/api/usuarios/";

class ShowUsuario extends Component {
  state = {
    usuarios: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_usuario: '',
      nombre: '',
      correo: '',
      contrasena: '',
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
        usuarios: response.data.usuarios,
        totalRecords: response.data.totalRecords 
      });
    }).catch(error => {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'No se pudo cargar la lista de usuarios', 'error');
    });
  }

  onPageChange = (event) => {
    this.setState({ page: event.page + 1 }, () => {
      this.peticionGet(); // Actualiza los datos cuando se cambia de página
    });
  }

  peticionPost = async () => {
    if (this.validarFormulario()) {
      delete this.state.form.id_usuario; // No se debe enviar el ID en la inserción
      try {
        console.log('Datos a enviar:', this.state.form); // Añadir esta línea para verificar los datos
    
        await axios.post(url, this.state.form);
        this.modalInsertar();
        this.peticionGet();
        Swal.fire('Éxito', 'Usuario creado exitosamente', 'success');
      } catch (error) {
        console.error('Error creating usuario:', error);
        Swal.fire('Error', 'Error al crear el usuario', 'error');
      }
    }
  }

  peticionPut = async () => {
    if (this.validarFormulario()) {
      try {
        await axios.put(url + this.state.form.id_usuario, this.state.form);
        this.modalInsertar();
        this.peticionGet();
        Swal.fire('Éxito', 'Usuario actualizado exitosamente', 'success');
      } catch (error) {
        console.error('Error updating usuario:', error);
        Swal.fire('Error', 'Error al actualizar el usuario', 'error');
      }
    }
  }

  peticionDelete = async () => {
    try {
      await axios.delete(url + this.state.form.id_usuario);
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Usuario eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting usuario:', error);
      Swal.fire('Error', 'Error al eliminar el usuario', 'error');
    }
  }

  validarFormulario = () => {
    const { nombre, correo, contrasena } = this.state.form;
    let errors = {};
    let formIsValid = true;

    if (!nombre || nombre.trim() === '') {
      formIsValid = false;
      errors["nombre"] = "El nombre es requerido";
    } else if (nombre.length > 50) {
      formIsValid = false;
      errors["nombre"] = "El nombre no puede exceder 50 caracteres";
    }

    if (!correo || correo.trim() === '') {
      formIsValid = false;
      errors["correo"] = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      formIsValid = false;
      errors["correo"] = "Correo inválido";
    }

    if (!contrasena || contrasena.trim() === '') {
      formIsValid = false;
      errors["contrasena"] = "La contraseña es requerida";
    } else if (contrasena.length < 6) {
      formIsValid = false;
      errors["contrasena"] = "La contraseña debe tener al menos 6 caracteres";
    }

    this.setState({ errors: errors });
    return formIsValid;
  }

  modalInsertar = () => {
    this.setState(prevState => ({
      modalInsertar: !prevState.modalInsertar,
      errors: {},
      form: { id_usuario: '', nombre: '', correo: '', contrasena: '' } // Reiniciar el formulario
    }));
  }

  seleccionarUsuario = (usuario) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        contrasena: usuario.contrasena // Asegúrate de que la contraseña está disponible
      },
      errors: {}
    });
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
    const { form, errors, usuarios, totalRecords, rows, page } = this.state;
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-success" onClick={() => { this.setState({ form: { nombre: '', correo: '', contrasena: '' }, tipoModal: 'insertar', errors: {} }); this.modalInsertar() }}>Agregar Usuario</button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usuario => (
                <tr key={usuario.id_usuario}>
                  <td>{usuario.id_usuario}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.correo}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => { this.seleccionarUsuario(usuario); this.modalInsertar() }}>Editar</button>
                    {"   "}
                    <button className="btn btn-danger" onClick={() => { this.seleccionarUsuario(usuario); this.setState({ modalEliminar: true }) }}>Eliminar</button>
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
          <ModalHeader toggle={this.modalInsertar}>{this.state.tipoModal === 'insertar' ? 'Insertar Usuario' : 'Editar Usuario'}</ModalHeader>
          <ModalBody>
            <div className="Container">
              <label htmlFor="id_usuario">ID</label>
              <input className="form-control" type="text" name="id_usuario" id="id_usuario" readOnly value={form ? form.id_usuario : this.state.usuarios.length + 1} />
              <br />
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="nombre">Nombre</label>
                  <input className="form-control" type="text" name="nombre" id="nombre" onChange={this.handleChange} value={form ? form.nombre : ''} />
                  {errors.nombre && <div className="text-danger">{errors.nombre}</div>}
                </div>
                <br />
                <div className="form-group col-md-6">
                  <label htmlFor="correo">Correo</label>
                  <input className="form-control" type="text" name="correo" id="correo" onChange={this.handleChange} value={form ? form.correo : ''} />
                  {errors.correo && <div className="text-danger">{errors.correo}</div>}
                </div>
                <br />
                <div className="form-group col-md-6">
                  <label htmlFor="contrasena">Contraseña</label>
                  <input className="form-control" type="password" name="contrasena" id="contrasena" onChange={this.handleChange} value={form ? form.contrasena : ''} />
                  {errors.contrasena && <div className="text-danger">{errors.contrasena}</div>}
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
            ¿Estás seguro de que deseas eliminar el registro de {form && form.nombre}?
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

export default ShowUsuario;
