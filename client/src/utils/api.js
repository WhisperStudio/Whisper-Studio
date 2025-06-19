// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://104.248.132.57', 
  withCredentials: true     // Sender automatisk cookie (JWT‐token) til backend
});

export default api;
