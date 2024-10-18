import React, { Component } from 'react';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { get, post, put, del } from '../../services/api'; // Asegúrate de que la ruta a api.js sea correcta

const url = "servicio_in/";

class ShowServicioIn extends Component {
  state = {
    servicios: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_intrahospitalario: '',
      servicio: '',
      tipoModal: ''
    },
    errors: {}
  }

  peticionGet = () => {
    get(url).then(response => {
      this.setState({ servicios: response.data });
    }).catch(error => {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'No se pudieron cargar los servicios', 'error');
    })
  }

  peticionPost = async () => {
    if (this.validarFormulario()) {
      delete this.state.form.id_intrahospitalario;
      try {
        await post(url, this.state.form);
        this.modalInsertar();
        this.peticionGet();
        Swal.fire('Éxito', 'Servicio creado exitosamente', 'success');
      } catch (error) {
        console.error('Error creating service:', error);
        Swal.fire('Error', 'Error al crear el servicio', 'error');
      }
    }
  }

  peticionPut = async () => {
    if (this.validarFormulario()) {
      try {
         put(url + this.state.form.id_intrahospitalario, this.state.form);
        this.modalInsertar();
        this.peticionGet();
        Swal.fire('Éxito', 'Servicio actualizado exitosamente', 'success');
      } catch (error) {
        console.error('Error updating service:', error);
        Swal.fire('Error', 'Error al actualizar el servicio', 'error');
      }
    }
  }

  peticionDelete = async () => {
    try {
      del(url + this.state.form.id_intrahospitalario);
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Servicio eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting service:', error);
      Swal.fire('Error', 'Error al eliminar el servicio', 'error');
    }
  }

  validarFormulario = () => {
    const { servicio } = this.state.form;
    let errors = {};
    let formIsValid = true;

    if (!servicio || servicio.trim() === '') {
      formIsValid = false;
      errors["servicio"] = "El nombre del servicio es requerido";
    } else if (servicio.length > 50) {
      formIsValid = false;
      errors["servicio"] = "El nombre del servicio no puede exceder 50 caracteres";
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

  seleccionarServicio = (servicio) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_intrahospitalario: servicio.id_intrahospitalario,
        servicio: servicio.servicio,
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
    const { form, errors } = this.state;
    return (
      <div className="App">
        <br /><br /><br />
        <button className="btn btn-success" onClick={() => { this.setState({ form: { servicio: '' }, tipoModal: 'insertar', errors: {} }); this.modalInsertar() }}>Agregar Servicio</button>
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
            {this.state.servicios.map(servicio => (
              <tr key={servicio.id_intrahospitalario}>
                <td>{servicio.id_intrahospitalario}</td>
                <td>{servicio.servicio}</td>
                <td>
                  <button className="btn btn-primary" onClick={() => { this.seleccionarServicio(servicio); this.modalInsertar() }}>Editar</button>
                  {"   "}
                  <button className="btn btn-danger" onClick={() => { this.seleccionarServicio(servicio); this.setState({ modalEliminar: true }) }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal isOpen={this.state.modalInsertar} toggle={this.modalInsertar}>
          <ModalHeader toggle={this.modalInsertar}>{this.state.tipoModal === 'insertar' ? 'Insertar Servicio' : 'Editar Servicio'}</ModalHeader>
          <ModalBody>
            <div className="form-group">
              <label htmlFor="id_intrahospitalario">ID</label>
              <input className="form-control" type="text" name="id_intrahospitalario" id="id_intrahospitalario" readOnly value={form ? form.id_intrahospitalario : this.state.servicios.length + 1} />
              <br />
              <label htmlFor="servicio">Servicio</label>
              <input className="form-control" type="text" name="servicio" id="servicio" onChange={this.handleChange} value={form ? form.servicio : ''} />
              {errors.servicio && <div className="text-danger">{errors.servicio}</div>}
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

        <Modal isOpen={this.state.modalEliminar} toggle={() => this.setState({ modalEliminar: false })}>
          <ModalHeader>Eliminar Servicio</ModalHeader>
          <ModalBody>
            ¿Estás seguro que deseas eliminar el servicio {form && form.servicio}?
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

export default ShowServicioIn;