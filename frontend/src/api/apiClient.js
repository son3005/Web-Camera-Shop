// frontend/src/api/apiClient.js
// Instance axios dùng chung cho toàn bộ app

import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: false,
});

// Gắn token tự động cho mọi request
apiClient.interceptors.request.use((config) => {
  // đọc lần lượt, cái nào có thì dùng
  const token =
    localStorage.getItem("admin_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
