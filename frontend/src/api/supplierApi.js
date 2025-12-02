// src/api/supplierApi.js
// ===========================================================
// API Nhà Cung Cấp — khớp backend Flask /api/nha-cung-cap
// Dựa theo tài liệu "Quản lý Nhà Cung Cấp" :contentReference[oaicite:0]{index=0}
// ===========================================================

import apiClient from "./apiClient";

// Lấy danh sách NCC với bộ lọc + phân trang (skip / limit)
export const getSuppliers = async ({
  page = 1,
  limit = 10,
  filters = {},
} = {}) => {
  const skip = (page - 1) * limit;

  const params = {
    skip,
    limit,
  };

  if (filters.ten_nha_cung_cap)
    params.ten_nha_cung_cap = filters.ten_nha_cung_cap;
  if (filters.so_dien_thoai) params.so_dien_thoai = filters.so_dien_thoai;
  if (filters.email) params.email = filters.email;
  if (filters.ma_nha_cung_cap) params.ma_nha_cung_cap = filters.ma_nha_cung_cap;
  if (filters.nguoi_dai_dien) params.nguoi_dai_dien = filters.nguoi_dai_dien;
  if (filters.trang_thai === "kich_hoat") params.trang_thai = true;
  if (filters.trang_thai === "ngung_hoat_dong") params.trang_thai = false;

  const res = await apiClient.get("/nha-cung-cap", { params });
  const items = res.data?.nha_cung_caps || res.data?.data || [];

  return {
    items,
    page,
    limit,
    hasMore: items.length === limit, // nếu ít hơn limit => hết
  };
};

// Lấy danh sách NCC cơ bản cho dropdown / autocomplete
export const getSuppliersBasic = async () => {
  const res = await apiClient.get("/nha-cung-cap/danh-sach-co-ban");
  const list = res.data?.nha_cung_caps || res.data?.data || res.data || [];
  return list;
};

// Tạo NCC mới (ADMIN)
export const createSupplier = async (payload) => {
  const res = await apiClient.post("/nha-cung-cap", payload);
  return res.data;
};

// Cập nhật NCC (ADMIN)
export const updateSupplier = async (id, payload) => {
  const res = await apiClient.put(`/nha-cung-cap/${id}`, payload);
  return res.data;
};

// Xóa NCC (ADMIN)
export const deleteSupplier = async (id) => {
  const res = await apiClient.delete(`/nha-cung-cap/${id}`);
  return res.data;
};

// Kích hoạt NCC
export const kichHoatSupplier = async (id) => {
  const res = await apiClient.patch(`/nha-cung-cap/${id}/kich-hoat`);
  return res.data;
};

// Ngừng hoạt động NCC
export const ngungHoatDongSupplier = async (id) => {
  const res = await apiClient.patch(`/nha-cung-cap/${id}/ngung-hoat-dong`);
  return res.data;
};
