// src/api/sanPhamApi.js
// Import 2 instance axios đã cấu hình interceptor
import { apiPublic, apiPrivate } from "../lib/axios";

// === CÁC HÀM PUBLIC (Dùng apiPublic - Không cần auth) ===

/**
 * (Public) Lấy danh sách sản phẩm có phân trang và bộ lọc
 * @param {Object} params - Các query params
 * @param {number} [params.page=1] - Trang hiện tại
 * @param {number} [params.per_page=10] - Số sản phẩm mỗi trang
 * @param {string} [params.search] - Từ khóa tìm kiếm
 * @param {number} [params.min_price] - Giá tối thiểu
 * @param {number} [params.max_price] - Giá tối đa
 * @param {"price_asc"|"price_desc"|"name_asc"|"name_desc"} [params.sort_by] - Sắp xếp
 * @param {number[]} [params.thuong_hieu_ids] - Array ID thương hiệu
 * @param {number[]} [params.danh_muc_ids] - Array ID danh mục
 * @returns {Promise<{data: Array, pagination: {page: number, per_page: number, total: number, pages: number}}>} Dữ liệu phân trang
 */
export const laySanPhams = async (params = {}) => {
  // GET /api/san-pham với query params (match backend request.args)
  const res = await apiPublic.get("/san-pham", { params });
  return res.data; // { data: [...], pagination: {...} } cho React Query
};

/**
 * (Public) Lấy chi tiết một sản phẩm theo ID
 * @param {number} sanPhamId - ID của sản phẩm
 * @returns {Promise<Object>} Dữ liệu chi tiết sản phẩm
 */
export const laySanPhamTheoId = async (sanPhamId) => {
  // GET /api/san-pham/123
  const res = await apiPublic.get(`/san-pham/${sanPhamId}`);
  return res.data;
};

// === CÁC HÀM ADMIN (Dùng apiPrivate - Tự động gắn token JWT) ===

/**
 * (Admin) Tạo một sản phẩm mới
 * @param {Object} sanPhamData - Dữ liệu sản phẩm từ form (match SanPhamCreate)
 * @returns {Promise<Object>} Sản phẩm vừa được tạo
 */
export const taoSanPham = async (sanPhamData) => {
  // POST /api/san-pham
  const res = await apiPrivate.post("/san-pham", sanPhamData);
  return res.data;
};

/**
 * (Admin) Cập nhật một sản phẩm
 * @param {Object} params
 * @param {number} params.sanPhamId - ID của sản phẩm
 * @param {Object} params.sanPhamData - Dữ liệu cập nhật (match SanPhamUpdate)
 * @returns {Promise<Object>} Sản phẩm vừa được cập nhật
 */
export const capNhatSanPham = async ({ sanPhamId, sanPhamData }) => {
  // PUT /api/san-pham/123
  const res = await apiPrivate.put(`/san-pham/${sanPhamId}`, sanPhamData);
  return res.data;
};

/**
 * (Admin) Xóa một sản phẩm
 * @param {number} sanPhamId - ID của sản phẩm cần xóa
 * @returns {Promise<{message: string}>} Thông báo thành công
 */
export const xoaSanPham = async (sanPhamId) => {
  // DELETE /api/san-pham/123
  const res = await apiPrivate.delete(`/san-pham/${sanPhamId}`);
  return res.data;
};

/**
 * (Admin) Tạo biến thể cho sản phẩm
 * @param {Object} params
 * @param {number} params.sanPhamId - ID của sản phẩm
 * @param {Object} params.bienTheData - Dữ liệu biến thể (match BienTheSanPhamCreate)
 * @returns {Promise<Object>} Biến thể vừa tạo
 */
export const taoBienThe = async ({ sanPhamId, bienTheData }) => {
  // POST /api/san-pham/123/bien-the
  const res = await apiPrivate.post(
    `/san-pham/${sanPhamId}/bien-the`,
    bienTheData
  );
  return res.data;
};

/**
 * (Admin) Cập nhật biến thể
 * @param {Object} params
 * @param {number} params.sanPhamId - ID của sản phẩm
 * @param {number} params.bienTheId - ID của biến thể
 * @param {Object} params.bienTheData - Dữ liệu cập nhật (match BienTheSanPhamUpdate)
 * @returns {Promise<Object>} Biến thể vừa cập nhật
 */
export const capNhatBienThe = async ({ sanPhamId, bienTheId, bienTheData }) => {
  // PUT /api/san-pham/123/bien-the/456
  const res = await apiPrivate.put(
    `/san-pham/${sanPhamId}/bien-the/${bienTheId}`,
    bienTheData
  );
  return res.data;
};

/**
 * (Admin) Xóa biến thể
 * @param {Object} params
 * @param {number} params.sanPhamId - ID của sản phẩm
 * @param {number} params.bienTheId - ID của biến thể
 * @returns {Promise<{message: string}>} Thông báo thành công
 */
export const xoaBienThe = async ({ sanPhamId, bienTheId }) => {
  // DELETE /api/san-pham/123/bien-the/456
  const res = await apiPrivate.delete(
    `/san-pham/${sanPhamId}/bien-the/${bienTheId}`
  );
  return res.data;
};
