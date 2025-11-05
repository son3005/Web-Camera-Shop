// src/api/apiClient.js
// ============================================================
// Axios client dùng chung cho toàn bộ frontend
// - Gắn baseURL tới Flask backend
// - Tự chèn Authorization nếu có token
// - Nếu backend trả 401 thì logout và về /dangnhap
// ============================================================

import axios from "axios";

// Lấy base URL từ biến môi trường, không có thì dùng localhost
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Chèn token vào mọi request nếu có
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Nếu gặp 401 thì quay lại trang đăng nhập
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/dangnhap";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
