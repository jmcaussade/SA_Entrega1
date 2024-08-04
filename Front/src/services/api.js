import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // URL del servidor Express.js
});

export default api;
