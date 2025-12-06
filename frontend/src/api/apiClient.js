// src/api/apiClient.js
// ----------------------------------------------------
// Instance axios dùng chung cho toàn bộ app.
// Base: http://localhost:5000/api
// Tự gắn token từ localStorage (3 key để tương thích code cũ).
// ----------------------------------------------------

import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: false,
});

// ✅ Gắn token tự động cho mọi request
apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("admin_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default apiClient;
