import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Paginator } from 'primereact/paginator';

const url = "https://banco-leche-backend.onrender.com/api/donadora/";

class ShowDonadora extends Component {
  state = {
    donadoras: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_donadora: '',
      nombre: '',
      apellido: '',
      tipoModal: ''
    },
    totalRecords: 0,
    currentPage: 1,
    rowsPerPage: 10, // Cantidad de registros por página
  }

  // Función para obtener los registros con paginación
  peticionGet = async () => {
    const { currentPage, rowsPerPage } = this.state;
    const response = await axios.get(`${url}?page=${currentPage}&limit=${rowsPerPage}`);
    this.setState({ 
      donadoras: response.data.donadoras, // Cambia 'personal' a 'donadoras' si lo necesitas
      totalRecords: response.data.totalRecords // Total de registros
    });
  } 

  peticionPost = async () => {
    // Validación de campos antes de enviar la solicitud
    if (!this.validarFormulario()) return;

    delete this.state.form.id_donadora;
    await axios.post(url, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Donadora creada exitosamente', 'success');
    }).catch(error => {
      console.log(error.message);
      Swal.fire('Error', 'Error al crear la donadora', 'error');
    })
  }

  peticionPut = () => {
    // Validación de campos antes de enviar la solicitud
    if (!this.validarFormulario()) return;

    axios.put(url + this.state.form.id_donadora, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Donadora actualizada exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al actualizar la donadora', 'error');
      console.log(error.message);
    })
  }

  peticionDelete = () => {
    axios.delete(url + this.state.form.id_donadora).then(response => {
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Donadora eliminada exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al eliminar la donadora', 'error');
      console.log(error.message);
    })
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  seleccionarDonadora = (donadora) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_donadora: donadora.id_donadora,
        nombre: donadora.nombre,
        apellido: donadora.apellido
      }
    })
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

  // Nueva función para validar el formulario
  validarFormulario = () => {
    const { form } = this.state;

    // Verificamos si 'form' existe
    if (!form) {
      Swal.fire('Error', 'El formulario está vacío.', 'error');
      return false;
    }

    // Verificamos si los campos están llenos
    const { nombre, apellido } = form;
    if (!nombre || !apellido) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return false;
    }

    // Puedes agregar más validaciones aquí, por ejemplo, longitud mínima de los campos
    return true;
  }

  onPageChange = (event) => {
    this.setState(
      { currentPage: event.page + 1 }, // PrimeReact utiliza 0 como base para las páginas
      () => {
        this.peticionGet(); // Llamar a la función de obtener registros
      }
    );
  }

  componentDidMount() {
    this.peticionGet();
  }

  render() {
    const { form, totalRecords, rowsPerPage, currentPage, donadoras  } = this.state;
    return (
      <div className="App">
        <br /><br /><br />
        <button className="btn btn-success" onClick={() => { this.setState({ form: null, tipoModal: 'insertar' }); this.modalInsertar() }}>Agregar Donadora</button>
        <br /><br />
        <table className="table">
          <thead>
            <tr>
              <th>No.</th> {/* Nueva columna para numerar los registros */}
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {this.state.donadoras.map((donadora, index) => {
              return (
                <tr key={donadora.id_donadora}>
                  <td>{index + 1 + (currentPage - 1) * rowsPerPage}</td> {/* Muestra el número de registro */}
                  <td>{donadora.nombre}</td>
                  <td>{donadora.apellido}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => { this.seleccionarDonadora(donadora); this.modalInsertar() }}>Editar</button>
                    {"   "}
                    <button className="btn btn-danger" onClick={() => { this.seleccionarDonadora(donadora); this.setState({ modalEliminar: true }) }}>Eliminar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <Paginator
          first={(currentPage - 1) * rowsPerPage}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPageChange={this.onPageChange}
        />

        <Modal isOpen={this.state.modalInsertar} toggle={() => this.modalInsertar()}>
          <ModalHeader toggle={() => this.modalInsertar()}>{this.state.tipoModal === 'insertar' ? 'Insertar Donadora' : 'Editar Donadora'}</ModalHeader>
          <ModalBody>
            <div className="form-group">
              {this.state.tipoModal === 'actualizar' && ( /* Solo muestra el ID en modo actualización */
                <>
                  <label htmlFor="id_donadora">ID</label>
                  <input className="form-control" type="text" name="id_donadora" id="id_donadora" readOnly onChange={this.handleChange} value={form ? form.id_donadora : ''} />
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
          <ModalHeader>Eliminar Donadora</ModalHeader>
          <ModalBody>
            Estás seguro que deseas eliminar a la donadora {form && form.nombre}
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

export default ShowDonadora;
