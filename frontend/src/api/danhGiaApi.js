// src/api/danhGiaApi.js
import { apiPublic, apiPrivate } from "../lib/axios";

/**
 * (Public) Lấy danh sách đánh giá cho 1 sản phẩm
 * @param {object} params - Gồm { sanPhamId, params: { page, per_page } }
 * @returns {Promise<object>} Dữ liệu phân trang
 */
export const layDanhGias = async ({ sanPhamId, params }) => {
  // GET /api/products/123/reviews?page=1&per_page=5
  const res = await apiPublic.get(`/products/${sanPhamId}/reviews`, { params });
  return res.data; // Trả về object { items, total, ... }
};

/**
 * (User) Tạo một đánh giá mới
 * @param {object} danhGiaData - { chi_tiet_don_hang_id, diem_danh_gia, binh_luan }
 * @returns {Promise<object>} Dữ liệu đánh giá mới
 */
export const taoDanhGia = async (danhGiaData) => {
  // POST /api/reviews (Đây là private route, cần user đăng nhập)
  const res = await apiPrivate.post("/reviews", danhGiaData);
  return res.data;
};

/**
 * (Admin) Cập nhật trạng thái một đánh giá (Duyệt/Từ chối)
 * @param {object} params - Gồm { reviewId, statusData: { trang_thai } }
 * @returns {Promise<object>} Dữ liệu đánh giá đã cập nhật
 */
export const capNhatTrangThaiDanhGia = async ({ reviewId, statusData }) => {
  // PATCH /api/admin/reviews/123
  const res = await apiPrivate.patch(`/admin/reviews/${reviewId}`, statusData);
  return res.data;
};
