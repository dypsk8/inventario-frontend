import React, { useState } from 'react';
import api from '../services/api'; // Importamos nuestra config de Axios
import { useNavigate } from 'react-router-dom'; // Para redirigir al usuario
import Swal from 'sweetalert2'; // Alertas bonitas
import './Login.css'; // Los estilos

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      // Si llegamos aquí, el login fue exitoso
      const { token, usuario } = response.data;

      // 1. Guardamos el token y datos del usuario en el navegador
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // 2. Mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: `Bienvenido, ${usuario.nombre}`,
        showConfirmButton: false,
        timer: 1500
      });

      // 3. Redirigir al Dashboard (lo crearemos en el siguiente paso)
      navigate('/dashboard');

    } catch (error) {
      // Manejo de errores
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error de acceso',
        text: error.response?.data?.error || 'Ocurrió un error inesperado'
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@empresa.com"
              required 
            />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              required 
            />
          </div>
          <button type="submit" className="btn-login">Ingresar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;