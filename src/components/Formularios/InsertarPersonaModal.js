// InsertarPersonaModal.js
import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const InsertarPersonaModal = ({ isOpen, toggle, onPersonaInsertada }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');

  const peticionPost = async () => {
    if (!nombre || !apellido) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/personal_estimulacion/', {
        nombre,
        apellido,
      });
      Swal.fire('Éxito', 'Persona agregada exitosamente', 'success');
      onPersonaInsertada(response.data); // Notificar al componente padre con la nueva persona
      toggle(); // Cerrar el modal
    } catch (error) {
      Swal.fire('Error', 'Error al agregar la persona', 'error');
      console.log(error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Insertar Persona</ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            className="form-control"
            type="text"
            name="nombre"
            id="nombre"
            onChange={(e) => setNombre(e.target.value)}
            value={nombre}
          />
          <br />
          <label htmlFor="apellido">Apellido</label>
          <input
            className="form-control"
            type="text"
            name="apellido"
            id="apellido"
            onChange={(e) => setApellido(e.target.value)}
            value={apellido}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <button className="btn btn-success" onClick={peticionPost}>Insertar</button>
        <button className="btn btn-danger" onClick={toggle}>Cancelar</button>
      </ModalFooter>
    </Modal>
  );
};

export default InsertarPersonaModal;
