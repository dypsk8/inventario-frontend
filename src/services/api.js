import axios from 'axios';

// Creamos una instancia de Axios con la URL base del backend
// Colocamos que use la variable de entorno y sino que use el localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Interceptor: Antes de cada petición, inyectamos el token si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Buscamos el token en el navegador
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;
