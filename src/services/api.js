import axios from 'axios';

// Creamos una instancia de Axios con la URL base del backend
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Asegúrate de que este puerto coincida con backend
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