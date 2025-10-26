
// src/api/authApi.js
import { apiPublic } from "../lib/axios";

export const login = async (credentials) => {
  // Đăng nhập là hành động public (chưa có token)
  const res = await apiPublic.post("/auth/dangnhap", credentials);
  // res.data sẽ chứa { user, token }
  return res.data;
};

export const register = async (userData) => {
  const res = await apiPublic.post("/auth/dangky", userData);
  return res.data;
};

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000/api/auth",
});

// Đăng ký
export async function registerUser({ email, ho_ten, mat_khau }) {
  const res = await api.post("/register", { email, ho_ten, mat_khau });
  return res.data;
}

// Đăng nhập
export async function loginUser({ email, mat_khau }) {
  const res = await api.post("/login", { email, mat_khau });
  localStorage.setItem("access_token", res.data.access_token);
  return res.data;
}

// Quên mật khẩu
export async function forgotPassword({ email }) {
  const res = await api.post("/forgot-password", { email });
  return res.data;
}

