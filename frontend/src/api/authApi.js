// frontend/src/api/authApi.js
import { apiPublic } from "../lib/axios"; // đảm bảo file trên tồn tại

// --- ĐĂNG NHẬP ---
export const login = async (credentials) => {
  // credentials: { email, mat_khau }
  const res = await apiPublic.post("/auth/login", credentials);
  return res.data; // { user, token }
};

// --- ĐĂNG KÝ ---
// Export theo 2 tên để tránh mismatch import
export const register = async (userData) => {
  // userData: { ho_ten, email, mat_khau, xac_nhan_mat_khau? }
  const res = await apiPublic.post("/auth/register", userData);
  return res.data;
};

export const registerUser = register; // alias để tương thích

// --- QUÊN MẬT KHẨU ---
export const forgotPassword = async (emailData) => {
  // emailData: { email }
  const res = await apiPublic.post("/auth/forgot-password", emailData);
  return res.data;
};

// --- ĐẶT LẠI MẬT KHẨU ---
export const resetPassword = async (token, passwordData) => {
  // token: string, passwordData: { mat_khau: "..." }
  const res = await apiPublic.post(
    `/auth/reset-password/${token}`,
    passwordData
  );
  return res.data;
};
