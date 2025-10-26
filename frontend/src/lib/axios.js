// src/lib/axios.js
import axios from "axios";
import { store } from "../redux/store";

// --- (1) SỬA Ở ĐÂY ---
// Import thẳng action "dangXuat" thay vì "authActions"
import { dangXuat } from "../redux/slices/authSlice";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// --- Instance 1: Dùng cho các API CÔNG KHAI ---
export const apiPublic = axios.create({
  baseURL: API_BASE_URL,
});

// --- Instance 2: Dùng cho các API BẢO MẬT (Admin, User) ---
export const apiPrivate = axios.create({
  baseURL: API_BASE_URL,
});

// --- Tích hợp Interceptor (TRÁI TIM của việc bảo mật) ---
apiPrivate.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Interceptor xử lý khi token HẾT HẠN (lỗi 401) ---
apiPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Lỗi 401: Token hết hạn. Đang đăng xuất...");

      // --- (2) SỬA Ở ĐÂY ---
      // Gọi thẳng hàm dangXuat()
      store.dispatch(dangXuat());

      // (Tùy chọn) Chuyển hướng người dùng về trang đăng nhập
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
