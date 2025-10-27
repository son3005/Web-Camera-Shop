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

// --- (SỬA) Endpoint lấy chi tiết (dùng chung cho User/Admin) ---
// Route backend đã được cập nhật để dùng /admin/:id cho admin
// export const layChiTietDonHang = async (donHangId) => {
//   const res = await apiPrivate.get(`/orders/${donHangId}`); // User endpoint
//   return res.data;
// };
// Hàm mới sẽ được thêm vào hook

// === NGHIỆP VỤ ADMIN ===

/**
 * (Admin) Lấy TẤT CẢ đơn hàng với bộ lọc và sắp xếp nâng cao.
 * Tương ứng: DonHangService.get_all_orders_admin
 * @param {object} params - { page, per_page, trang_thai (string), search_term, start_date, end_date, sort_by, sort_order }
 */
export const layTatCaDonHang = async (params) => {
  // GET /api/orders/admin
  // --- (SỬA) Truyền đầy đủ params ---
  const res = await apiPrivate.get("/orders/admin", { params });
  return res.data; // Trả về PaginatedResponse
};

/**
 * (Admin) Cập nhật trạng thái đơn hàng (Giữ nguyên)
 * @param {object} params - { donHangId, data: { trang_thai } }
 */
export const capNhatTrangThaiDonHang = async ({ donHangId, data }) => {
  // PATCH /api/orders/:id/status
  const res = await apiPrivate.patch(`/orders/${donHangId}/status`, data);
  return res.data;
};

/**
 * (Admin) Lấy chi tiết đơn hàng BẤT KỲ.
 * Tương ứng: DonHangService.get_order_details (với is_admin=True)
 * @param {string|number} donHangId
 */
export const layChiTietDonHangAdmin = async (donHangId) => {
  // GET /api/orders/admin/:id (Route mới đã thêm)
  const res = await apiPrivate.get(`/orders/admin/${donHangId}`);
  return res.data;
};
