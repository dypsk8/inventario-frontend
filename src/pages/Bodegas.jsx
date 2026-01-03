import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { FaPlus, FaTrash, FaEdit, FaWarehouse } from 'react-icons/fa';

const Bodegas = () => {
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Función para cargar datos del Backend
  const fetchBodegas = async () => {
    try {
      const response = await api.get('/bodegas');
      setBodegas(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Cargar al iniciar el componente
  useEffect(() => {
    fetchBodegas();
  }, []);

  // 2. Función para CREAR una bodega (Usando SweetAlert como formulario)
  const handleCreate = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Nueva Bodega',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Nombre (ej: Bodega Central)">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Ubicación (ej: Piso 1)">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value
        ]
      }
    });

    if (formValues) {
      const [nombre, ubicacion] = formValues;
      if(!nombre) return Swal.fire('Error', 'El nombre es obligatorio', 'error');

      try {
        await api.post('/bodegas', { nombre, ubicacion });
        Swal.fire('¡Creado!', 'La bodega ha sido registrada.', 'success');
        fetchBodegas(); // Recargar la lista
      } catch (error) {
        Swal.fire('Error', 'No se pudo crear la bodega', 'error');
      }
    }
  };

  // 3. Función para ELIMINAR
  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto (Borrado Lógico)",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/bodegas/${id}`);
          Swal.fire('Eliminado!', 'La bodega ha sido eliminada.', 'success');
          fetchBodegas(); // Recargar lista
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar.', 'error');
        }
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaWarehouse /> Gestión de Bodegas
        </h1>
        <button onClick={handleCreate} style={btnStyle}>
          <FaPlus /> Nueva Bodega
        </button>
      </div>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: '#34495e', color: 'white', textAlign: 'left' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Ubicación</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bodegas.length === 0 ? (
              <tr><td colSpan="4" style={{padding: '10px'}}>No hay bodegas registradas.</td></tr>
            ) : (
              bodegas.map((bodega) => (
                <tr key={bodega.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={tdStyle}>{bodega.id}</td>
                  <td style={tdStyle}><strong>{bodega.nombre}</strong></td>
                  <td style={tdStyle}>{bodega.ubicacion}</td>
                  <td style={tdStyle}>
                    <button 
                      onClick={() => handleDelete(bodega.id)} 
                      style={{...actionBtnStyle, background: '#e74c3c'}}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

// --- Estilos simples en JS (Inline Styles) ---
const btnStyle = {
  background: '#27ae60',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 'bold'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  background: 'white',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
};

const thStyle = { padding: '15px' };
const tdStyle = { padding: '15px' };

const actionBtnStyle = {
  border: 'none',
  color: 'white',
  padding: '8px',
  borderRadius: '4px',
  cursor: 'pointer',
  marginLeft: '5px'
};

export default Bodegas;