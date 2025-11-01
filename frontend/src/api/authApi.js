// frontend/src/api/authApi.js
import { apiPublic } from "../lib/axios"; // đảm bảo file trên tồn tại

// --- ĐĂNG NHẬP ---
export const login = async (credentials) => {
  const res = await apiPublic.post("/auth/login", credentials);
  return res.data;
};

// --- ĐĂNG KÝ ---
export const register = async (userData) => {
  const res = await apiPublic.post("/auth/register", userData);
  return res.data;
};

export const registerUser = register;

// --- QUÊN MẬT KHẨU ---
export const forgotPassword = async (emailData) => {
  const res = await apiPublic.post("/auth/forgot-password", emailData);
  return res.data;
};

// --- ĐẶT LẠI MẬT KHẨU ---
export const resetPassword = async (token, passwordData) => {
  const res = await apiPublic.post(
    `/auth/reset-password/${token}`,
    passwordData
  );
  return res.data;
};
