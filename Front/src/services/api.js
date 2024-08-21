import axios from 'axios';

const api = axios.create({
  baseURL: 'http://backend:5000/api', // Cambia el puerto si es necesario
});

export default api;
