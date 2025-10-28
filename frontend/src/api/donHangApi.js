// src/api/donHangApi.js
import { apiPrivate } from "../lib/axios";

// === NGHIỆP VỤ USER (Giữ nguyên) ===

export const taoDonHang = async (data) => {
  const res = await apiPrivate.post("/orders", data);
  return res.data;
};

export const layLichSuDonHang = async (params) => {
  const res = await apiPrivate.get("/orders", { params });
  return res.data;
};

// Hàm lấy chi tiết cho user (nếu cần endpoint riêng)
// export const layChiTietDonHangUser = async (donHangId) => {
//   const res = await apiPrivate.get(`/orders/${donHangId}`);
//   return res.data;
// };

// === NGHIỆP VỤ ADMIN ===

export const layTatCaDonHang = async (params) => {
  const res = await apiPrivate.get("/orders/admin", { params });
  return res.data;
};

export const capNhatTrangThaiDonHang = async ({ donHangId, data }) => {
  const res = await apiPrivate.patch(`/orders/${donHangId}/status`, data);
  return res.data;
};

export const layChiTietDonHangAdmin = async (donHangId) => {
  const res = await apiPrivate.get(`/orders/admin/${donHangId}`);
  return res.data;
};

// --- (HÀM MỚI CHO STATUS GRID) ---
/**
 * (Admin) Lấy thống kê số lượng đơn hàng theo trạng thái
 * Tương ứng: DonHangService.get_order_summary_by_status
 */
export const layThongKeTrangThai = async () => {
  // GET /api/orders/admin/summary
  const res = await apiPrivate.get("/orders/admin/summary");
  // API trả về { summary: { cho_xac_nhan: 10, ... } }
  // Chỉ trả về object bên trong 'summary'
  return res.data.summary;
};
// --- (HẾT HÀM MỚI) ---
