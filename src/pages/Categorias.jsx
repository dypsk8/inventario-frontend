import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { FaPlus, FaTrash, FaTags } from 'react-icons/fa'; // Icono de etiqueta para categorías

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar Categorías
  const fetchCategorias = async () => {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // 2. Crear Categoría
  const handleCreate = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Nueva Categoría',
      html:
        '<input id="swal-nombre" class="swal2-input" placeholder="Nombre (ej: Computadores)">' +
        '<input id="swal-prefijo" class="swal2-input" placeholder="Prefijo (ej: CMP)" maxlength="3" style="text-transform:uppercase">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        return [
          document.getElementById('swal-nombre').value,
          document.getElementById('swal-prefijo').value
        ]
      }
    });

    if (formValues) {
      const [nombre, prefijo] = formValues;
      if(!nombre || !prefijo) return Swal.fire('Error', 'Todos los campos son obligatorios', 'error');

      try {
        await api.post('/categorias', { nombre, prefijo });
        Swal.fire('¡Creado!', 'Categoría registrada exitosamente.', 'success');
        fetchCategorias();
      } catch (error) {
        Swal.fire('Error', 'No se pudo crear (quizás el nombre ya existe)', 'error');
      }
    }
  };

  // 3. Eliminar Categoría
  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: "Si tiene activos asociados, no podrás eliminarla.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/categorias/${id}`);
          Swal.fire('Eliminado!', 'La categoría ha sido eliminada.', 'success');
          fetchCategorias();
        } catch (error) {
          // El backend devuelve 400 si tiene activos (Violación de FK)
          Swal.fire('Error', 'No se puede eliminar: Probablemente tiene activos asociados.', 'error');
        }
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaTags /> Gestión de Categorías
        </h1>
        <button onClick={handleCreate} style={btnStyle}>
          <FaPlus /> Nueva Categoría
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: '#34495e', color: 'white', textAlign: 'left' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Prefijo</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 ? (
              <tr><td colSpan="4" style={{padding: '10px'}}>No hay datos.</td></tr>
            ) : (
              categorias.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={tdStyle}>{cat.id}</td>
                  <td style={tdStyle}><strong>{cat.nombre}</strong></td>
                  <td style={tdStyle}>
                    <span style={badgeStyle}>{cat.prefijo}</span>
                  </td>
                  <td style={tdStyle}>
                    <button 
                      onClick={() => handleDelete(cat.id)} 
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

// --- Estilos ---
const btnStyle = { background: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' };
const thStyle = { padding: '15px' };
const tdStyle = { padding: '15px' };
const actionBtnStyle = { border: 'none', color: 'white', padding: '8px', borderRadius: '4px', cursor: 'pointer' };
const badgeStyle = { background: '#f1c40f', color: '#333', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' };

export default Categorias;