// src/api/phieuThuApi.js
// ===========================================================
// API Phiếu Thu (Nhập Hàng) — khớp 100% backend Flask
// Base URL: /api/phieu-thu
// ===========================================================

import apiClient from "./apiClient";

// ===========================================================
// ✅ 1. LẤY DANH SÁCH PHIẾU THU
// -----------------------------------------------------------
// Query params hỗ trợ:
// page, per_page, ten_nha_cung_cap, ma_phieu_thu,
// ngay_bat_dau (YYYY-MM-DD), ngay_ket_thuc (YYYY-MM-DD)
// -----------------------------------------------------------
// Response mẫu:
// {
//   "data": [...],
//   "pagination": { "page": 1, "per_page": 5, "total": 15, "pages": 3 }
// }
// ===========================================================
export const getPhieuThus = (params = {}) =>
  apiClient.get("/phieu-thu", { params }).then((res) => res.data);

// ===========================================================
// ✅ 2. LẤY CHI TIẾT 1 PHIẾU THU
// -----------------------------------------------------------
// GET /api/phieu-thu/:id
// Response mẫu:
// {
//   "data": {
//     "id": 1,
//     "ma_phieu_thu": "PT20241106081030",
//     "ten_nha_cung_cap": "Công ty Máy Ảnh ABC",
//     "ngay_thu": "2024-11-06T08:10:30",
//     "cac_chi_tiet_phieu_thu": [...],
//     "tong_so_luong": 8,
//     "tong_gia_tri": 301000000
//   }
// }
// ===========================================================
export const getPhieuThu = async (id) => {
  const res = await apiClient.get(`/phieu-thu/${id}`);
  // backend bọc trong "data"
  return res.data?.data ? res.data.data : res.data;
};

// ===========================================================
// ✅ 3. TẠO MỚI PHIẾU THU
// -----------------------------------------------------------
// POST /api/phieu-thu
// Body:
// {
//   "ten_nha_cung_cap": "Công ty Máy Ảnh ABC",
//   "phieu_thu_chi_tiets": [
//     { "bien_the_san_pham_id": 1, "so_luong": 5, "gia_nhap_tung_vat": 35000000 },
//     { "bien_the_san_pham_id": 2, "so_luong": 3, "gia_nhap_tung_vat": 42000000 }
//   ]
// }
// -----------------------------------------------------------
// Response 201:
// {
//   "message": "Tạo phiếu thu thành công",
//   "data": { ...phiếu thu mới... }
// }
// ===========================================================
export const taoPhieuThu = (payload) =>
  apiClient.post("/phieu-thu", payload).then((res) => res.data);

// ===========================================================
// ✅ 4. CẬP NHẬT PHIẾU THU
// -----------------------------------------------------------
// PUT /api/phieu-thu/:id
// Body tương tự POST, có thể thêm id dòng chi tiết để sửa
// Response: { "message": "Cập nhật phiếu thu thành công", "data": {...} }
// ===========================================================
export const capNhatPhieuThu = (id, payload) =>
  apiClient.put(`/phieu-thu/${id}`, payload).then((res) => res.data);

// ===========================================================
// ✅ 5. THỐNG KÊ NHẬP HÀNG
// -----------------------------------------------------------
// GET /api/phieu-thu/thong-ke?nam=2024&thang=11
// Response:
// {
//   "thong_ke": {
//     "nam": 2024,
//     "thang": 11,
//     "tong_phieu_thu": 8,
//     "tong_so_luong_nhap": 125,
//     "tong_gia_tri_nhap": 4520000000
//   }
// }
// ===========================================================
export const thongKePhieuThu = ({ nam, thang } = {}) => {
  const params = {};
  if (nam) params.nam = nam;
  if (thang) params.thang = thang;
  return apiClient
    .get("/phieu-thu/thong-ke", { params })
    .then((res) => res.data);
};

// ===========================================================
// ⚠️ 6. XÓA PHIẾU THU (tùy backend cho phép)
// -----------------------------------------------------------
// ❗ Nếu backend KHÔNG cho phép xóa thì đừng gọi hàm này.
// Nếu chỉ cập nhật → hãy dùng capNhatPhieuThu().
// ===========================================================
export const xoaPhieuThu = (id) =>
  apiClient.delete(`/phieu-thu/${id}`).then((res) => res.data);
