// src/api/phieuNhapApi.js
// ===========================================================
// API Phiếu Nhập — khớp backend Flask (tài liệu "Quản lý Phiếu Nhập")
// Base URL: /api/phieu-nhap
// ===========================================================

import apiClient from "./apiClient";

// ===========================================================
// 1. LẤY DANH SÁCH PHIẾU NHẬP
// GET /api/phieu-nhap
// Query:
//   page, per_page,
//   ma_phieu_nhap, ten_nha_cung_cap,
//   ngay_bat_dau (YYYY-MM-DD), ngay_ket_thuc (YYYY-MM-DD)
// Response:
// {
//   "data": [...],
//   "pagination": { "page": 1, "per_page": 5, "total": 15, "pages": 3 }
// }
// ===========================================================
export const getPhieuNhaps = (params = {}) =>
  apiClient.get("/phieu-nhap", { params }).then((res) => res.data);

// ===========================================================
// 2. LẤY CHI TIẾT 1 PHIẾU NHẬP
// GET /api/phieu-nhap/:id
// Response (chuẩn backend):
// data: {
//   id, ma_phieu_nhap, nha_cung_cap_id, ten_nha_cung_cap,
//   nguoi_nhap_id, ngay_nhap, ngay_cap_nhat,
//   cac_chi_tiet_phieu_nhap: [...],
//   tong_so_luong, tong_gia_tri
// }
// ===========================================================
export const getPhieuNhap = async (id) => {
  const res = await apiClient.get(`/phieu-nhap/${id}`);
  const raw = res.data?.data ?? res.data ?? {};

  const chiTiet =
    raw.cac_chi_tiet_phieu_nhap ??
    raw.phieu_nhap_chi_tiets ??
    raw.chi_tiet_phieu_nhap ??
    raw.chi_tiet ??
    [];

  return {
    ...raw,
    chi_tiet: chiTiet,
  };
};

// ===========================================================
// 3. TẠO MỚI PHIẾU NHẬP
// POST /api/phieu-nhap
// Body:
// {
//   "nha_cung_cap_id": 1,
//   "phieu_nhap_chi_tiets": [
//     { "bien_the_san_pham_id": 1, "so_luong": 5, "gia_nhap_tung_vat": 35000000 },
//     { "bien_the_san_pham_id": 2, "so_luong": 3, "gia_nhap_tung_vat": 42000000 }
//   ]
// }
// Response 201:
// { "message": "Tạo phiếu nhập thành công", "data": { ... } }
// ===========================================================
export const taoPhieuNhap = (payload) =>
  apiClient.post("/phieu-nhap", payload).then((res) => res.data);

// ===========================================================
// 4. CẬP NHẬT PHIẾU NHẬP
// PUT /api/phieu-nhap/:id
// Body tương tự POST nhưng có thể chứa id dòng chi tiết để update.
// ===========================================================
export const capNhatPhieuNhap = (id, payload) =>
  apiClient.put(`/phieu-nhap/${id}`, payload).then((res) => res.data);

// ===========================================================
// 5. THỐNG KÊ NHẬP HÀNG
// GET /api/phieu-nhap/thong-ke?nam=2024&thang=11
// Response:
// {
//   "thong_ke": {
//     "nam": 2024,
//     "thang": 11,
//     "tong_phieu_nhap": 8,
//     "tong_so_luong_nhap": 125,
//     "tong_gia_tri_nhap": 4520000000
//   }
// }
// ===========================================================
export const thongKePhieuNhap = ({ nam, thang } = {}) => {
  const params = {};
  if (nam) params.nam = nam;
  if (thang) params.thang = thang;
  return apiClient
    .get("/phieu-nhap/thong-ke", { params })
    .then((res) => res.data);
};

// ===========================================================
// 6. XÓA PHIẾU NHẬP (nếu backend cho phép)
// ===========================================================
export const xoaPhieuNhap = (id) =>
  apiClient.delete(`/phieu-nhap/${id}`).then((res) => res.data);
