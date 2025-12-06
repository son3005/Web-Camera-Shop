// D:\Web-Camera-Shop\frontend\src\lib\axios.js
// ---------------------------------------------------
// File cấu hình axios chung cho dự án.
// Có 2 instance:
//  - apiPublic: gọi API không cần token
//  - apiPrivate: gọi API cần token
// ĐÃ CHỈNH: interceptor sẽ đọc token theo đúng thứ tự như apiClient
// và khi 401 thì xóa luôn cả 3 key token.
// ---------------------------------------------------

import axios from "axios";
import { store } from "../redux/store";
import { dangXuat } from "../redux/slices/authSlice";

// ✅ Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

// ===============================
// 🔹 Instance Public
// ===============================
export const apiPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ===============================
// 🔹 Instance Private
// ===============================
export const apiPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ===============================
// 🔹 Helper log lỗi
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
// 🔹 Request Interceptor (PRIVATE)
// Trước khi gửi request private → gắn token mới nhất
// ===============================
apiPrivate.interceptors.request.use(
  (config) => {
    // lấy từ redux trước
    const state = store.getState();
    const tokenFromStore = state?.auth?.token;

    // rồi fallback về localStorage để tránh TH refresh quá sớm
    const tokenFromStorage =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("admin_token");

    const token = tokenFromStore || tokenFromStorage;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      // nếu không có token nữa thì chắc chắn bỏ header
      delete config.headers["Authorization"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// 🔹 Response Interceptor
//  - Trả về data
//  - Nếu 401 thì tự logout + xóa hết token local
// ===============================
apiPrivate.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "🔒 Token hết hạn hoặc không hợp lệ, tiến hành đăng xuất..."
      );

      // gọi redux để xóa state + các key chính
      store.dispatch(dangXuat());

      // phòng trường hợp còn các key cũ
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("admin_token");

      if (window.location.pathname !== "/dangnhap") {
        window.location.href = "/dangnhap";
      }
    }

    logAxiosError(error);
    return Promise.reject(error);
  }
);
