// src/api/sanphamApi.js
// Import 2 instance axios đã cấu hình interceptor
import { apiPublic, apiPrivate } from "../lib/axios";

// === CÁC HÀM PUBLIC (Dùng apiPublic) ===

/**
 * (Public) Lấy danh sách sản phẩm có phân trang và bộ lọc
 * @param {object} params - Gồm { page, limit, search, brands, ... }
 * @returns {Promise<object>} Dữ liệu phân trang
 */
export const laySanPhams = async (params) => {
  // GET /api/products
  const res = await apiPublic.get("/products", { params });
  return res.data; // React Query sẽ nhận 'data' này
};

/**
 * (Public) Lấy chi tiết một sản phẩm theo ID
 * (Backend của bạn đang dùng ID, không phải slug)
 * @param {string|number} sanPhamId - ID của sản phẩm
 * @returns {Promise<object>} Dữ liệu chi tiết sản phẩm
 */
export const laySanPhamTheoId = async (sanPhamId) => {
  // GET /api/products/123
  const res = await apiPublic.get(`/products/${sanPhamId}`);
  return res.data;
};

// === CÁC HÀM ADMIN (Dùng apiPrivate - Tự động gắn token) ===

/**
 * (Admin) Tạo một sản phẩm mới
 * @param {object} sanPhamData - Dữ liệu sản phẩm từ form
 * @returns {Promise<object>} Sản phẩm vừa được tạo
 */
export const taoSanPham = async (sanPhamData) => {
  // POST /api/products
  const res = await apiPrivate.post("/products", sanPhamData);
  return res.data;
};

/**
 * (Admin) Cập nhật một sản phẩm
 * @param {object} params - Gồm { sanPhamId, sanPhamData }
 * @returns {Promise<object>} Sản phẩm vừa được cập nhật
 */
export const capNhatSanPham = async ({ sanPhamId, sanPhamData }) => {
  // PUT /api/products/123
  const res = await apiPrivate.put(`/products/${sanPhamId}`, sanPhamData);
  return res.data;
};

/**
 * (Admin) Xóa một sản phẩm
 * @param {string|number} sanPhamId - ID của sản phẩm cần xóa
 * @returns {Promise<object>}
 */
export const xoaSanPham = async (sanPhamId) => {
  // DELETE /api/products/123
  const res = await apiPrivate.delete(`/products/${sanPhamId}`);
  return res.data;
};
