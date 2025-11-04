// D:\Web-Camera-Shop\frontend\src\lib\axios.js
// ---------------------------------------------------
// File cấu hình axios chung cho dự án.
// Có 2 instance:
//  - apiPublic: gọi API không cần token (login, register, xem sản phẩm public)
//  - apiPrivate: gọi API cần token (profile, giỏ hàng của tôi, đặt hàng)
// Có sẵn interceptor để tự gắn token + tự logout khi 401.
// ---------------------------------------------------

import axios from "axios";
import { store } from "../redux/store";
import { dangXuat } from "../redux/slices/authSlice";

// ✅ 1. Cấu hình base URL chuẩn
// Ưu tiên VITE_API_URL (bạn đang dùng), nếu không có thì thử VITE_API_BASE_URL,
// cuối cùng fallback về http://localhost:5000/api
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

// ===============================
// 🔹 Instance cho API Public
// ===============================
export const apiPublic = axios.create({
  baseURL: API_BASE_URL, // mọi request sẽ đi tới /api/...
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
    // Server trả về mã lỗi (4xx, 5xx)
    console.error(
      `❌ [${error.response.status}] ${error.config?.url}:`,
      error.response?.data
    );
  } else if (error.request) {
    // Đã gửi request nhưng không nhận được phản hồi
    console.error("⚠️ Không nhận được phản hồi từ server:", error.request);
  } else {
    // Lỗi khi cấu hình request
    console.error("🚨 Lỗi axios:", error.message);
  }
}

// ===============================
// 🔹 Request Interceptor
//  - Trước khi gửi request private, tự gắn Authorization
// ===============================
apiPrivate.interceptors.request.use(
  (config) => {
    // lấy token từ redux
    const token = store.getState().auth.token;
    if (token) {
      // gắn vào header
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// 🔹 Response Interceptor
//  - Trả về luôn response.data để gọi gọn hơn
//  - Nếu 401 thì tự đăng xuất + chuyển về /dangnhap
// ===============================
apiPrivate.interceptors.response.use(
  (response) => {
    // Trả về luôn phần data cho tiện
    return response.data;
  },
  (error) => {
    // Nếu BE trả 401 → token hết hạn / không hợp lệ
    if (error.response?.status === 401) {
      console.warn("🔒 Token hết hạn, đang đăng xuất...");
      // xóa redux + localStorage
      store.dispatch(dangXuat());

      // nếu hiện tại không đứng ở trang đăng nhập thì mới chuyển
      if (window.location.pathname !== "/dangnhap") {
        // điều hướng về trang đăng nhập của bạn
        window.location.href = "/dangnhap";
      }
    }

    // log để debug
    logAxiosError(error);
    return Promise.reject(error);
  }
);
