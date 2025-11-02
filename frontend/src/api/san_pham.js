// src/api/san_pham.js
import api from "./config";

// -------------------- Danh sách sản phẩm --------------------
export const lay_danh_sach_san_pham = async (params = {}) => {
  const { data } = await api.get("/san-pham", { params });
  return data; // { data: [...], pagination: {...} }
};

// -------------------- Chi tiết sản phẩm --------------------
export const lay_chi_tiet_san_pham = async (id) => {
  const { data } = await api.get(`/san-pham/${id}`);
  return data;
};

// -------------------- Tạo sản phẩm --------------------
export const tao_san_pham = async (payload) => {
  const { data } = await api.post("/san-pham", payload);
  return data;
};

// -------------------- Cập nhật sản phẩm --------------------
export const cap_nhat_san_pham = async (id, payload) => {
  const { data } = await api.put(`/san-pham/${id}`, payload);
  return data;
};

// -------------------- Xóa sản phẩm --------------------
export const xoa_san_pham = async (id) => {
  await api.delete(`/san-pham/${id}`);
};

// -------------------- Biến thể --------------------
export const them_bien_the = async (san_pham_id, payload) => {
  const { data } = await api.post(`/san-pham/${san_pham_id}/bien-the`, payload);
  return data;
};

export const cap_nhat_bien_the = async (san_pham_id, bien_the_id, payload) => {
  const { data } = await api.put(
    `/san-pham/${san_pham_id}/bien-the/${bien_the_id}`,
    payload
  );
  return data;
};

export const xoa_bien_the = async (san_pham_id, bien_the_id) => {
  await api.delete(`/san-pham/${san_pham_id}/bien-the/${bien_the_id}`);
};

// -------------------- Ảnh --------------------
export const them_hinh_anh = async (san_pham_id, bien_the_id, payload) => {
  const { data } = await api.post(
    `/san-pham/${san_pham_id}/bien-the/${bien_the_id}/hinh-anh`,
    payload
  );
  return data;
};

export const cap_nhat_hinh_anh = async (
  san_pham_id,
  bien_the_id,
  hinh_anh_id,
  payload
) => {
  const { data } = await api.put(
    `/san-pham/${san_pham_id}/bien-the/${bien_the_id}/hinh-anh/${hinh_anh_id}`,
    payload
  );
  return data;
};

export const xoa_hinh_anh = async (san_pham_id, bien_the_id, hinh_anh_id) => {
  await api.delete(
    `/san-pham/${san_pham_id}/bien-the/${bien_the_id}/hinh-anh/${hinh_anh_id}`
  );
};
