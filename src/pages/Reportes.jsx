import React from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { FaFilePdf, FaDownload } from 'react-icons/fa';

const Reportes = () => {

  const handleDownload = async () => {
    try {
      // 1. Mostrar alerta de carga
      Swal.fire({
        title: 'Generando PDF...',
        text: 'Por favor espera un momento',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // 2. Petición al Backend (pidiendo BLOB/Archivo)
      const response = await api.get('/reportes/inventario', {
        responseType: 'blob' 
      });

      // 3. Crear un enlace invisible para forzar la descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Nombre del archivo que se descargará
      link.setAttribute('download', `Inventario_General_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click(); // ¡Clic automático!
      
      // 4. Limpieza
      link.parentNode.removeChild(link);
      Swal.close();
      Swal.fire('¡Listo!', 'El reporte se ha descargado.', 'success');

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo generar el reporte', 'error');
    }
  };

  return (
    <div>
      <h1 style={{ color: '#2c3e50', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px' }}>
        <FaFilePdf /> Reportes y Exportaciones
      </h1>

      <div style={cardContainerStyle}>
        
        {/* Tarjeta del Reporte General */}
        <div style={cardStyle}>
          <div style={iconContainerStyle}>
            <FaFilePdf size={40} color="#e74c3c" />
          </div>
          <h3>Inventario General</h3>
          <p style={{ color: '#7f8c8d', margin: '10px 0' }}>
            Descarga un listado completo de todos los activos, organizados por bodega y con su estado actual.
          </p>
          <button onClick={handleDownload} style={btnStyle}>
            <FaDownload /> Descargar PDF
          </button>
        </div>

        {/* Aquí podrías agregar más reportes en el futuro (ej: Reporte de Bajas, etc.) */}
      
      </div>
    </div>
  );
};

// --- Estilos ---
const cardContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px'
};

const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  textAlign: 'center',
  transition: 'transform 0.2s'
};

const iconContainerStyle = {
  background: '#fadbd8',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto 15px auto'
};

const btnStyle = {
  background: '#2c3e50',
  color: 'white',
  border: 'none',
  padding: '12px 25px',
  borderRadius: '5px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  fontWeight: 'bold',
  fontSize: '1rem',
  marginTop: '10px'
};

export default Reportes;