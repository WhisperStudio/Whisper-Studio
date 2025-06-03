// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', 
  withCredentials: true     // Sender automatisk cookie (JWT‐token) til backend
});

export default api;
