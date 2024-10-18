import React, { Component } from 'react';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { get, post, put, del } from '../../services/api'; // Asegúrate de que la ruta a api.js sea correcta

const url = "servicio_ex/";

class ShowServicioEx extends Component {
  state = {
    servicios: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_extrahospitalario: '',
      servicio: '',
      tipoModal: ''
    }
  }

  peticionGet = () => {
    get(url).then(response => {
      this.setState({ servicios: response.data });
    }).catch(error => {
      console.log(error.message);
    });
  }

  peticionPost = async () => {
    // Validación de campos antes de enviar la solicitud
    if (!this.validarFormulario()) return;

    delete this.state.form.id_extrahospitalario;
    await post(url, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Servicio creado exitosamente', 'success');
    }).catch(error => {
      console.log(error.message);
      Swal.fire('Error', 'Error al crear el servicio', 'error');
    });
  }

  peticionPut = () => {
    // Validación de campos antes de enviar la solicitud
    if (!this.validarFormulario()) return;

    put(url + this.state.form.id_extrahospitalario, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Servicio actualizado exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al actualizar el servicio', 'error');
      console.log(error.message);
    });
  }

  peticionDelete = () => {
    del(url + this.state.form.id_extrahospitalario).then(response => {
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Servicio eliminado exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al eliminar el servicio', 'error');
      console.log(error.message);
    });
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  seleccionarServicio = (servicio) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_extrahospitalario: servicio.id_extrahospitalario,
        servicio: servicio.servicio,
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
    const { servicio } = form;
    if (!servicio) {
      Swal.fire('Error', 'El campo "Servicio" es obligatorio.', 'error');
      return false;
    }

    return true;
  }


  componentDidMount() {
    this.peticionGet();
  }

  render() {
    const { form } = this.state;
    return (
      <div className="App">
        <br /><br /><br />
        <button className="btn btn-success" onClick={() => { this.setState({ form: null, tipoModal: 'insertar' }); this.modalInsertar() }}>Agregar Servicio</button>
        <br /><br />
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Servicio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {this.state.servicios.map(servicio => {
              return (
                <tr key={servicio.id_extrahospitalario}>
                  <td>{servicio.id_extrahospitalario}</td>
                  <td>{servicio.servicio}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => { this.seleccionarServicio(servicio); this.modalInsertar() }}>Editar</button>
                    {"   "}
                    <button className="btn btn-danger" onClick={() => { this.seleccionarServicio(servicio); this.setState({ modalEliminar: true }) }}>Eliminar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <Modal isOpen={this.state.modalInsertar} toggle={() => this.modalInsertar()}>
          <ModalHeader toggle={() => this.modalInsertar()}>{this.state.tipoModal === 'insertar' ? 'Insertar Servicio' : 'Editar Servicio'}</ModalHeader>
          <ModalBody>
            <div className="form-group">
              <label htmlFor="id_extrahospitalario">ID</label>
              <input className="form-control" type="text" name="id_extrahospitalario" id="id_extrahospitalario" readOnly onChange={this.handleChange} value={form ? form.id_extrahospitalario : this.state.servicios.length + 1} />
              <br />
              <label htmlFor="servicio">Servicio</label>
              <input className="form-control" type="text" name="servicio" id="servicio" onChange={this.handleChange} value={form ? form.servicio : ''} />
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

        <Modal isOpen={this.state.modalEliminar} toggle={() => this.setState({ modalEliminar: false })}>
          <ModalHeader>Eliminar Servicio</ModalHeader>
          <ModalBody>
            ¿Estás seguro que deseas eliminar el servicio {form && form.servicio}?
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

export default ShowServicioEx;
