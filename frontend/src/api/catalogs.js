// src/api/catalogs.js
import api from "./config";

// Danh mục
export const lay_danh_muc = async (params = {}) => {
  const { data } = await api.get("/catalogs/danh-muc", { params });
  return data;
};

export const tao_danh_muc = async (payload) => {
  const { data } = await api.post("/catalogs/danh-muc", payload);
  return data;
};

export const cap_nhat_danh_muc = async (id, payload) => {
  const { data } = await api.put(`/catalogs/danh-muc/${id}`, payload);
  return data;
};

export const xoa_danh_muc = async (id) => {
  await api.delete(`/catalogs/danh-muc/${id}`);
};

// Thương hiệu
export const lay_thuong_hieu = async (params = {}) => {
  const { data } = await api.get("/catalogs/thuong-hieu", { params });
  return data;
};

export const tao_thuong_hieu = async (payload) => {
  const { data } = await api.post("/catalogs/thuong-hieu", payload);
  return data;
};

export const cap_nhat_thuong_hieu = async (id, payload) => {
  const { data } = await api.put(`/catalogs/thuong-hieu/${id}`, payload);
  return data;
};

export const xoa_thuong_hieu = async (id) => {
  await api.delete(`/catalogs/thuong-hieu/${id}`);
};
