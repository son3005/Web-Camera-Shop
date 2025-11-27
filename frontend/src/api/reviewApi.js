// src/api/reviewApi.js
// API đánh giá sản phẩm: Public + User + Admin

import apiClient from "./apiClient"; // baseURL: /api (không cần JWT)
import { apiPrivate } from "../lib/axios"; // có JWT, baseURL: root server

/* ===================== PUBLIC API ===================== */
/**
 * Lấy danh sách đánh giá đã duyệt của 1 sản phẩm
 * GET /api/danh-gia/san-pham/{san_pham_id}
 */
export const layDanhGiaSanPham = async (sanPhamId, params = {}) => {
  const res = await apiClient.get(`/danh-gia/san-pham/${sanPhamId}`, {
    params,
  });
  // backend: { data: [...], pagination: {...} }
  return res.data;
};

/**
 * Thống kê đánh giá của 1 sản phẩm
 * GET /api/danh-gia/san-pham/{san_pham_id}/thong-ke
 */
export const layThongKeDanhGiaSanPham = async (sanPhamId) => {
  const res = await apiClient.get(`/danh-gia/san-pham/${sanPhamId}/thong-ke`);
  // { thong_ke_theo_sao, tong_danh_gia, trung_binh, phan_tram_theo_sao }
  return res.data;
};

/* ===================== USER API ===================== */
/**
 * Lấy danh sách đánh giá "của tôi"
 * GET /api/danh-gia/cua-toi
 *
 * LƯU Ý: apiPrivate có interceptor → res = data luôn
 */
export const layDanhGiaCuaToi = async (params = {}) => {
  const res = await apiPrivate.get("/api/danh-gia/cua-toi", { params });
  return res; // giữ nguyên (trong này đã là { data, pagination } nếu backend trả vậy
};

/**
 * Tạo đánh giá mới
 * POST /api/danh-gia
 * body: { chi_tiet_don_hang_id, diem_danh_gia, binh_luan? }
 */
export const taoDanhGia = async (data) => {
  const res = await apiPrivate.post("/api/danh-gia", data);
  return res;
};

/**
 * Cập nhật đánh giá của chính user
 * PUT /api/danh-gia/{id}
 */
export const capNhatDanhGia = async ({ id, data }) => {
  const res = await apiPrivate.put(`/api/danh-gia/${id}`, data);
  return res;
};

/**
 * Xóa đánh giá của chính user
 * DELETE /api/danh-gia/{id}
 */
export const xoaDanhGia = async (id) => {
  const res = await apiPrivate.delete(`/api/danh-gia/${id}`);
  return res;
};

/* ===================== ADMIN API ===================== */
/**
 * Admin: Lấy tất cả đánh giá với bộ lọc
 * GET /api/admin/danh-gia
 *
 * params:
 *  - page, per_page
 *  - diem_danh_gia, trang_thai, san_pham_id, nguoi_dung_id
 *  - tu_ngay, den_ngay (YYYY-MM-DD)
 *  - co_binh_luan: true / false
 */
export const adminLayDanhGia = async (params = {}) => {
  const res = await apiPrivate.get("/api/admin/danh-gia", { params });
  // backend: { data: [...], pagination: {...} }
  return res;
};

/**
 * Admin: Thống kê tổng quan toàn hệ thống
 * GET /api/admin/danh-gia/thong-ke
 */
export const adminThongKeDanhGia = async () => {
  const res = await apiPrivate.get("/api/admin/danh-gia/thong-ke");
  return res;
};

/**
 * Admin: Mở khóa (duyệt) đánh giá → trạng_thai = da_duyet
 * PUT /api/admin/danh-gia/{id}/mo-khoa
 */
export const adminMoKhoaDanhGia = async (id) => {
  const res = await apiPrivate.put(`/api/admin/danh-gia/${id}/mo-khoa`);
  return res;
};

/**
 * Admin: Khóa / từ chối đánh giá → trạng_thai = bi_tu_choi
 * PUT /api/admin/danh-gia/{id}/khoa
 */
export const adminKhoaDanhGia = async (id) => {
  const res = await apiPrivate.put(`/api/admin/danh-gia/${id}/khoa`);
  return res;
};
