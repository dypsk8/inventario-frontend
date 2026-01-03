import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { FaExchangeAlt, FaHistory, FaArrowRight } from 'react-icons/fa';

const Movimientos = () => {
  const [activos, setActivos] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [historial, setHistorial] = useState([]);
  
  // Estados para el formulario de traslado
  const [selectedActivo, setSelectedActivo] = useState('');
  const [selectedBodega, setSelectedBodega] = useState('');
  const [observacion, setObservacion] = useState('');

  // Cargar datos iniciales
  const fetchData = async () => {
    try {
      const [actRes, bodRes, histRes] = await Promise.all([
        api.get('/activos'),
        api.get('/bodegas'),
        api.get('/movimientos')
      ]);

      // Filtramos solo activos que NO estén de baja para moverlos
      const activosDisponibles = actRes.data.filter(a => a.estado !== 'BAJA');
      
      setActivos(activosDisponibles);
      setBodegas(bodRes.data);
      setHistorial(histRes.data);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manejar el traslado
  const handleTraslado = async (e) => {
    e.preventDefault();

    if (!selectedActivo || !selectedBodega) {
      return Swal.fire('Atención', 'Selecciona un activo y una bodega destino', 'warning');
    }

    try {
      await api.post('/movimientos/traslado', {
        activo_id: selectedActivo,
        bodega_destino_id: selectedBodega,
        observacion: observacion || 'Traslado registrado desde Web'
      });

      Swal.fire('Éxito', 'Traslado realizado correctamente', 'success');
      
      // Limpiar formulario y recargar datos
      setSelectedActivo('');
      setSelectedBodega('');
      setObservacion('');
      fetchData(); // Para actualizar el historial y la ubicación del activo en memoria

    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Error al realizar traslado', 'error');
    }
  };

  // Helper para formatear fecha
  const formatearFecha = (fechaISO) => {
    return new Date(fechaISO).toLocaleString();
  };

  return (
    <div>
      <h1 style={{ color: '#2c3e50', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px' }}>
        <FaExchangeAlt /> Gestión de Movimientos
      </h1>

      {/* --- SECCIÓN 1: FORMULARIO DE TRASLADO --- */}
      <div style={cardStyle}>
        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom:'15px' }}>Nuevo Traslado</h3>
        
        <form onSubmit={handleTraslado} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
          
          <div>
            <label style={labelStyle}>Seleccionar Activo:</label>
            <select 
              value={selectedActivo} 
              onChange={(e) => setSelectedActivo(e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Elegir Activo --</option>
              {activos.map(act => (
                <option key={act.id} value={act.id}>
                  {act.codigo} - {act.nombre} (En: {act.bodega?.nombre})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Bodega Destino:</label>
            <select 
              value={selectedBodega} 
              onChange={(e) => setSelectedBodega(e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Elegir Destino --</option>
              {bodegas.map(bod => (
                <option key={bod.id} value={bod.id}>{bod.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Observación:</label>
            <input 
              type="text" 
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Razón del cambio..."
              style={inputStyle} 
            />
          </div>

          <button type="submit" style={btnStyle}>
            Confirmar Traslado
          </button>
        </form>
      </div>

      {/* --- SECCIÓN 2: HISTORIAL --- */}
      <h3 style={{ marginTop: '40px', display:'flex', alignItems:'center', gap:'10px' }}>
        <FaHistory /> Historial de Movimientos
      </h3>
      
      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#34495e', color: 'white', textAlign: 'left' }}>
            <th style={thStyle}>Fecha</th>
            <th style={thStyle}>Activo</th>
            <th style={thStyle}>Origen <FaArrowRight style={{fontSize:'0.8rem'}}/> Destino</th>
            <th style={thStyle}>Responsable</th>
            <th style={thStyle}>Observación</th>
          </tr>
        </thead>
        <tbody>
          {historial.length === 0 ? (
            <tr><td colSpan="5" style={{padding:'20px'}}>No hay movimientos registrados.</td></tr>
          ) : (
            historial.map(mov => (
              // Como un movimiento puede tener varios detalles, mapeamos los detalles
              // (Aunque en tu backend actual haces 1 movimiento = 1 detalle, el array existe)
              mov.detalles_movimiento.map(detalle => (
                <tr key={detalle.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={tdStyle}>{formatearFecha(mov.fecha)}</td>
                  <td style={tdStyle}>
                    <strong>{detalle.activos?.nombre}</strong><br/>
                    <small>{detalle.activos?.codigo}</small>
                  </td>
                  <td style={tdStyle}>
                    {detalle.bodegas_detalles_movimiento_bodega_origen_idTobodegas?.nombre} 
                    {' '} <FaArrowRight color="#e67e22"/> {' '}
                    <strong>{detalle.bodegas_detalles_movimiento_bodega_destino_idTobodegas?.nombre}</strong>
                  </td>
                  <td style={tdStyle}>{mov.usuarios?.nombre_completo || 'Sistema'}</td>
                  <td style={tdStyle}><em>{mov.observacion}</em></td>
                </tr>
              ))
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// --- Estilos ---
const cardStyle = { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' };
const btnStyle = { background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: '100%' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', background: 'white', marginTop: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' };
const thStyle = { padding: '12px' };
const tdStyle = { padding: '12px', fontSize: '0.9rem' };

export default Movimientos;