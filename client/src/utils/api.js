import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vintrastudio.com/api',
  withCredentials: true,
});

export default api;
