// D:\Web-Camera-Shop\frontend\src\api\authApi.js
// ---------------------------------------------------
// Tập các hàm gọi API xác thực.
// Dựa trên backend: /api/auth/login, /api/auth/register, ...
// ---------------------------------------------------
import { apiPublic } from "../lib/axios"; // dùng instance public, không cần token

// --- ĐĂNG NHẬP ---
// credentials = { email, mat_khau }
export const login = async (credentials) => {
  // BE phải trả { token, user }
  const res = await apiPublic.post("/auth/login", credentials);
  return res.data;
};

// --- ĐĂNG KÝ ---
export const register = async (userData) => {
  const res = await apiPublic.post("/auth/register", userData);
  return res.data;
};

// alias để code cũ vẫn chạy
export const registerUser = register;

// --- QUÊN MẬT KHẨU ---
export const forgotPassword = async (emailData) => {
  const res = await apiPublic.post("/auth/forgot-password", emailData);
  return res.data;
};

// --- ĐẶT LẠI MẬT KHẨU ---
// FE sẽ gọi /auth/reset-password/:token
export const resetPassword = async (token, passwordData) => {
  const res = await apiPublic.post(
    `/auth/reset-password/${token}`,
    passwordData
  );
  return res.data;
};
