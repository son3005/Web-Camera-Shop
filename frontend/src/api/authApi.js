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
