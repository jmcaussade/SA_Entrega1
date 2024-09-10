import axios from 'axios';

const api = axios.create({
  baseURL: 'http://miapp.localhost:5000/api', // Cambia el puerto si es necesario
});

export default api;
