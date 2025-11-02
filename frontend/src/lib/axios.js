// src/lib/axios.js
import axios from "axios";
import { store } from "../redux/store";
import { dangXuat } from "../redux/slices/authSlice";

// ✅ 1. Cấu hình base URL chuẩn
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ===============================
// 🔹 Instance cho API Public
// ===============================
export const apiPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ===============================
// 🔹 Instance cho API Private (có token)
// ===============================
export const apiPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ===============================
// 🔹 Helper log lỗi (debug dễ hơn)
// ===============================
function logAxiosError(error) {
  if (error.response) {
    console.error(
      `❌ [${error.response.status}] ${error.config?.url}:`,
      error.response?.data
    );
  } else if (error.request) {
    console.error("⚠️ Không nhận được phản hồi từ server:", error.request);
  } else {
    console.error("🚨 Lỗi axios:", error.message);
  }
}

// ===============================
// 🔹 Request Interceptor
// ===============================
apiPrivate.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// 🔹 Response Interceptor
// ===============================
apiPrivate.interceptors.response.use(
  (response) => {
    // ⚙️ Trả về luôn `response.data` cho gọn
    return response.data;
  },
  (error) => {
    // ⚠️ Nếu lỗi 401 (token hết hạn)
    if (error.response?.status === 401) {
      console.warn("🔒 Token hết hạn, đang đăng xuất...");
      store.dispatch(dangXuat());

      // (Tuỳ chọn) Tránh redirect khi đã ở /login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    logAxiosError(error);
    return Promise.reject(error);
  }
);
