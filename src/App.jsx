import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';     
import Dashboard from './pages/Dashboard';    
import Bodegas from './pages/Bodegas';
import Categorias from './pages/Categorias';
import Activos from './pages/Activos';
import Movimientos from './pages/Movimientos';
import Reportes from './pages/Reportes';


// PROTECCIÓN DE RUTAS: Si no hay token, manda al Login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Ruta Pública */}
      <Route path="/" element={<Login />} />

      {/* Rutas Privadas (Con Layout) */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Aquí definimos las sub-rutas que se ven en el <Outlet /> */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="activos" element={<Activos />} />
        <Route path="bodegas" element={<Bodegas />} />
        <Route path="movimientos" element={<Movimientos />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="reportes" element={<Reportes />} />

        {/* Redirección por defecto si entra logueado a la raíz */}
        {/* <Route index element={<Navigate to="/dashboard" />} /> */}
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;