import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBoxOpen, FaWarehouse, FaExchangeAlt, FaFilePdf, FaSignOutAlt } from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const location = useLocation(); // Para saber en qué ruta estamos
  const navigate = useNavigate();
  
  // Recuperar nombre del usuario
  const usuario = JSON.parse(localStorage.getItem('usuario')) || { nombre: 'Usuario' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  // Función para asignar clase 'active' al link actual
  const getLinkClass = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <div className="layout-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>DSI Actividad #8</h2>
        
        <nav>
          <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            <FaHome /> Dashboard
          </Link>
          
          <Link to="/activos" className={getLinkClass('/activos')}>
            <FaBoxOpen /> Activos
          </Link>

          <Link to="/bodegas" className={getLinkClass('/bodegas')}>
            <FaWarehouse /> Bodegas
          </Link>
          
          <Link to="/categorias" className={getLinkClass('/categorias')}>
             <FaBoxOpen /> Categorías 
             {/* Reutilicé el icono, puedes buscar otro si quieres */}
          </Link>

          <Link to="/movimientos" className={getLinkClass('/movimientos')}>
            <FaExchangeAlt /> Movimientos
          </Link>

          <Link to="/reportes" className={getLinkClass('/reportes')}>
            <FaFilePdf /> Reportes
          </Link>
        </nav>

        <div style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#bdc3c7' }}>
          Hola, {usuario.nombre}
        </div>

        <button onClick={handleLogout} className="btn-logout">
          <FaSignOutAlt /> Salir
        </button>
      </aside>

      {/* CONTENIDO DINÁMICO */}
      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;