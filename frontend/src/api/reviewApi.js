// src/api/reviewApi.js
// =======================================================
// API ĐÁNH GIÁ SẢN PHẨM
// - Public (không cần JWT): dùng apiClient (baseURL: /api)
// - User & Admin (có JWT): dùng apiPrivate (baseURL: /api)
// =======================================================

import apiClient from "./apiClient"; // baseURL: http://localhost:5000/api
import { apiPrivate } from "../lib/axios"; // baseURL: http://localhost:5000/api, có JWT

/* ===================== PUBLIC API ===================== */
/**
 * Lấy danh sách đánh giá đã duyệt của 1 sản phẩm
 * GET /api/danh-gia/san-pham/{san_pham_id}
 * Query: page, per_page, diem_danh_gia, tu_ngay, den_ngay, co_binh_luan
 */
export const layDanhGiaSanPham = async (sanPhamId, params = {}) => {
  const res = await apiClient.get(`/danh-gia/san-pham/${sanPhamId}`, {
    params,
  });
  // backend trả: { data: [...], pagination: {...} }
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
 * LƯU Ý: apiPrivate có interceptor → res = response.data luôn
 * và response.data đã là { data: [...], pagination: {...} } nếu backend trả vậy.
 */
export const layDanhGiaCuaToi = async (params = {}) => {
  const res = await apiPrivate.get("/danh-gia/cua-toi", { params });
  return res;
};

/**
 * Tạo đánh giá mới
 * POST /api/danh-gia
 * body: { chi_tiet_don_hang_id, diem_danh_gia, binh_luan? }
 * Trả về: DanhGiaResponse
 */
export const taoDanhGia = async (payload) => {
  const res = await apiPrivate.post("/danh-gia", payload);
  return res; // DanhGiaResponse
};

/**
 * Cập nhật đánh giá của chính user
 * PUT /api/danh-gia/{id}
 */
export const capNhatDanhGia = async (id, payload) => {
  const res = await apiPrivate.put(`/danh-gia/${id}`, payload);
  return res; // DanhGiaResponse
};

/**
 * Xóa đánh giá của chính user
 * DELETE /api/danh-gia/{id}
 */
export const xoaDanhGia = async (id) => {
  const res = await apiPrivate.delete(`/danh-gia/${id}`);
  return res; // { message: ... }
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
  const res = await apiPrivate.get("/admin/danh-gia", { params });
  // backend: { data: [...], pagination: {...} }
  return res;
};

/**
 * Admin: Thống kê tổng quan toàn hệ thống
 * GET /api/admin/danh-gia/thong-ke
 */
export const adminThongKeDanhGia = async () => {
  const res = await apiPrivate.get("/admin/danh-gia/thong-ke");
  return res;
};

/**
 * Admin: Mở khóa (duyệt) đánh giá → trạng_thai = da_duyet
 * PUT /api/admin/danh-gia/{id}/mo-khoa
 */
export const adminMoKhoaDanhGia = async (id) => {
  const res = await apiPrivate.put(`/admin/danh-gia/${id}/mo-khoa`);
  return res;
};

/**
 * Admin: Khóa / từ chối đánh giá → trạng_thai = bi_tu_choi
 * PUT /api/admin/danh-gia/{id}/khoa
 */
export const adminKhoaDanhGia = async (id) => {
  const res = await apiPrivate.put(`/admin/danh-gia/${id}/khoa`);
  return res;
};
