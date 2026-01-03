import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { FaPlus, FaBox, FaTrash, FaBarcode } from 'react-icons/fa';

const Activos = () => {
  const [activos, setActivos] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar TODO al inicio (Activos, y las listas para los Selects)
  const fetchData = async () => {
    try {
      // Hacemos las 3 peticiones en paralelo para ahorrar tiempo
      const [activosRes, bodegasRes, categoriasRes] = await Promise.all([
        api.get('/activos'),
        api.get('/bodegas'),
        api.get('/categorias')
      ]);

      setActivos(activosRes.data);
      setBodegas(bodegasRes.data);
      setCategorias(categoriasRes.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      Swal.fire('Error', 'Error cargando datos del servidor', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Crear Activo (Formulario complejo en SweetAlert)
  const handleCreate = async () => {
    // Generamos las opciones HTML para los Selects
    const bodegasOptions = bodegas.map(b => `<option value="${b.id}">${b.nombre}</option>`).join('');
    const categoriasOptions = categorias.map(c => `<option value="${c.id}">${c.nombre} (${c.prefijo})</option>`).join('');

    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Activo',
      width: '600px', // Hacemos la alerta más ancha
      html: `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align:left">
          
          <div>
            <label>Código</label>
            <input id="swal-codigo" class="swal2-input" placeholder="Ej: LPT-001" style="width: 90%; margin: 5px 0;">
          </div>
          
          <div>
            <label>Nombre</label>
            <input id="swal-nombre" class="swal2-input" placeholder="Ej: Laptop Dell" style="width: 90%; margin: 5px 0;">
          </div>

          <div style="grid-column: span 2">
            <label>Descripción</label>
            <input id="swal-desc" class="swal2-input" placeholder="Detalles..." style="width: 95%; margin: 5px 0;">
          </div>

          <div>
            <label>Categoría</label>
            <select id="swal-cat" class="swal2-input" style="width: 95%; margin: 5px 0;">
              ${categoriasOptions}
            </select>
          </div>

          <div>
            <label>Bodega Inicial</label>
            <select id="swal-bod" class="swal2-input" style="width: 95%; margin: 5px 0;">
              ${bodegasOptions}
            </select>
          </div>

          <div>
            <label>Valor Compra ($)</label>
            <input id="swal-valor" type="number" class="swal2-input" placeholder="0.00" style="width: 90%; margin: 5px 0;">
          </div>

          <div>
            <label>Fecha Adquisición</label>
            <input id="swal-fecha" type="date" class="swal2-input" style="width: 90%; margin: 5px 0;">
          </div>

        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar Activo',
      preConfirm: () => {
        return {
          codigo: document.getElementById('swal-codigo').value,
          nombre: document.getElementById('swal-nombre').value,
          descripcion: document.getElementById('swal-desc').value,
          categoria_id: document.getElementById('swal-cat').value,
          bodega_id: document.getElementById('swal-bod').value,
          valor_compra: document.getElementById('swal-valor').value,
          fecha_adquisicion: document.getElementById('swal-fecha').value || new Date().toISOString()
        }
      }
    });

    if (formValues) {
      // Validaciones básicas
      if (!formValues.codigo || !formValues.nombre) {
        return Swal.fire('Error', 'Código y Nombre son obligatorios', 'warning');
      }

      try {
        await api.post('/activos', formValues);
        Swal.fire('¡Éxito!', 'Activo registrado correctamente', 'success');
        fetchData(); // Recargar tabla
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'No se pudo crear', 'error');
      }
    }
  };

  // 3. Dar de Baja (Eliminar lógico)
  const handleBaja = (id) => {
    Swal.fire({
      title: '¿Dar de baja este activo?',
      text: "El activo pasará a estado 'BAJA' y no podrá asignarse.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, dar de baja'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/activos/${id}`);
          Swal.fire('Procesado', 'El activo ha sido dado de baja.', 'success');
          fetchData();
        } catch (error) {
          Swal.fire('Error', 'No se pudo procesar la baja.', 'error');
        }
      }
    });
  };

  // Helper para pintar el estado de colores
  const getEstadoBadge = (estado) => {
    const colores = {
      'DISPONIBLE': '#27ae60', // Verde
      'ASIGNADO': '#2980b9',   // Azul
      'BAJA': '#c0392b',       // Rojo
      'REPARACION': '#e67e22'  // Naranja
    };
    return {
      background: colores[estado] || '#95a5a6',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '15px',
      fontSize: '0.8rem',
      fontWeight: 'bold'
    };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaBox /> Inventario de Activos
        </h1>
        <button onClick={handleCreate} style={btnStyle}>
          <FaPlus /> Nuevo Activo
        </button>
      </div>

      {loading ? (
        <p>Cargando inventario...</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: '#34495e', color: 'white', textAlign: 'left' }}>
              <th style={thStyle}>Código</th>
              <th style={thStyle}>Activo</th>
              <th style={thStyle}>Categoría</th>
              <th style={thStyle}>Ubicación Actual</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activos.length === 0 ? (
              <tr><td colSpan="6" style={{padding: '20px', textAlign: 'center'}}>No hay activos registrados.</td></tr>
            ) : (
              activos.map((activo) => (
                <tr key={activo.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={tdStyle}>
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                        <FaBarcode color="#7f8c8d"/> {activo.codigo}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <strong>{activo.nombre}</strong><br/>
                    <small style={{color:'#7f8c8d'}}>{activo.descripcion}</small>
                  </td>
                  <td style={tdStyle}>{activo.categoria?.nombre || '-'}</td>
                  <td style={tdStyle}>{activo.bodega?.nombre || 'Sin ubicación'}</td>
                  <td style={tdStyle}>
                    <span style={getEstadoBadge(activo.estado)}>{activo.estado}</span>
                  </td>
                  <td style={tdStyle}>
                    {activo.estado !== 'BAJA' && (
                        <button 
                        onClick={() => handleBaja(activo.id)} 
                        title="Dar de Baja"
                        style={{...actionBtnStyle, background: '#c0392b'}}
                        >
                        <FaTrash />
                        </button>
                    )}
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
const thStyle = { padding: '15px', fontSize: '0.9rem' };
const tdStyle = { padding: '15px', fontSize: '0.9rem' };
const actionBtnStyle = { border: 'none', color: 'white', padding: '8px', borderRadius: '4px', cursor: 'pointer' };

export default Activos;