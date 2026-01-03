import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaBoxOpen, FaWarehouse, FaDollarSign, FaChartPie } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalActivos: 0,
    totalBodegas: 0,
    valorTotal: 0,
    porEstado: {
      DISPONIBLE: 0,
      ASIGNADO: 0,
      BAJA: 0,
      REPARACION: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Hacemos las peticiones en paralelo
        const [activosRes, bodegasRes] = await Promise.all([
          api.get('/activos'),
          api.get('/bodegas')
        ]);

        const activos = activosRes.data;
        const bodegas = bodegasRes.data;

        // 1. Calcular Valor Total (Suma de valor_compra)
        // Usamos reduce: Recorre el array y va sumando el precio
        const totalDinero = activos.reduce((acumulador, actual) => {
          // Aseguramos que sea número, si es null ponemos 0
          return acumulador + Number(actual.valor_compra || 0);
        }, 0);

        // 2. Calcular conteo por estados
        const conteoEstados = {
            DISPONIBLE: 0,
            ASIGNADO: 0,
            BAJA: 0,
            REPARACION: 0
        };

        activos.forEach(a => {
            if (conteoEstados[a.estado] !== undefined) {
                conteoEstados[a.estado]++;
            }
        });

        // 3. Guardar todo en el estado
        setStats({
          totalActivos: activos.length,
          totalBodegas: bodegas.length,
          valorTotal: totalDinero,
          porEstado: conteoEstados
        });

        setLoading(false);

      } catch (error) {
        console.error("Error cargando dashboard:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Función para formatear dinero (ej: $ 1,200.00)
  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  return (
    <div>
      <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Panel de Control</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>Resumen general del inventario en tiempo real.</p>

      {/* --- GRID DE TARJETAS PRINCIPALES --- */}
      <div style={gridStyle}>
        
        {/* Tarjeta 1: Total Activos */}
        <div style={cardStyle}>
          <div style={{ ...iconBox, background: '#e8f8f5', color: '#1abc9c' }}>
            <FaBoxOpen size={24} />
          </div>
          <div>
            <h3 style={titleStyle}>Total Activos</h3>
            <p style={numberStyle}>{loading ? '...' : stats.totalActivos}</p>
          </div>
        </div>

        {/* Tarjeta 2: Total Bodegas */}
        <div style={cardStyle}>
          <div style={{ ...iconBox, background: '#fef9e7', color: '#f1c40f' }}>
            <FaWarehouse size={24} />
          </div>
          <div>
            <h3 style={titleStyle}>Bodegas</h3>
            <p style={numberStyle}>{loading ? '...' : stats.totalBodegas}</p>
          </div>
        </div>

        {/* Tarjeta 3: Valor Total */}
        <div style={cardStyle}>
          <div style={{ ...iconBox, background: '#eaf2f8', color: '#3498db' }}>
            <FaDollarSign size={24} />
          </div>
          <div>
            <h3 style={titleStyle}>Valor Inventario</h3>
            <p style={{ ...numberStyle, color: '#2c3e50' }}>
              {loading ? '...' : formatoMoneda(stats.valorTotal)}
            </p>
          </div>
        </div>

      </div>

      {/* --- SECCIÓN DE ESTADOS (Resumen rápido) --- */}
      <h3 style={{ marginTop: '40px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaChartPie /> Estado de los Activos
      </h3>
      
      <div style={statusGridStyle}>
        <div style={{...statusCard, borderLeft: '5px solid #27ae60'}}>
            <span>Disponibles</span>
            <strong>{stats.porEstado.DISPONIBLE}</strong>
        </div>
        <div style={{...statusCard, borderLeft: '5px solid #2980b9'}}>
            <span>Asignados</span>
            <strong>{stats.porEstado.ASIGNADO}</strong>
        </div>
        <div style={{...statusCard, borderLeft: '5px solid #e67e22'}}>
            <span>En Reparación</span>
            <strong>{stats.porEstado.REPARACION}</strong>
        </div>
        <div style={{...statusCard, borderLeft: '5px solid #c0392b'}}>
            <span>De Baja</span>
            <strong>{stats.porEstado.BAJA}</strong>
        </div>
      </div>

    </div>
  );
};

// --- Estilos CSS en JS ---
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px'
};

const cardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  display: 'flex',
  alignItems: 'center',
  gap: '20px'
};

const iconBox = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const titleStyle = { margin: 0, fontSize: '0.9rem', color: '#7f8c8d' };
const numberStyle = { margin: '5px 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#2c3e50' };

const statusGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginTop: '15px'
};

const statusCard = {
    background: 'white',
    padding: '15px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
};

export default Dashboard;