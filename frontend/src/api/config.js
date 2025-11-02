import axios from "axios";
// import { getToken } from './auth'; // Gia su ban co ham lay token

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de them JWT token vao moi request
api.interceptors.request.use(async (config) => {
  // const token = getToken();
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

export default api;
