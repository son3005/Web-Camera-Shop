// src/api/catalogsApi.js
// Import 2 instance axios đã cấu hình interceptor
import { apiPublic, apiPrivate } from "../lib/axios";

// Base URL chung cho API này
const BASE_URL = "/catalogs";

// =================================================================
// 1. DANH MỤC (CATEGORY) API
// =================================================================

/**
 * (Public) Lấy danh sách danh mục có phân trang
 * @param {Object} params - Các query params (page, per_page)
 * @param {number} [params.page=1]
 * @param {number} [params.per_page=10]
 * @returns {Promise<import("../schemas/catalogsSchemas").DanhMucListResponse>}
 */
export const layDanhMucs = async (params = {}) => {
  // GET /api/catalogs/danh-muc
  const res = await apiPublic.get(`${BASE_URL}/danh-muc`, { params });
  return res.data; // { data: [...], pagination: {...} }
};

/**
 * (Public) Lấy chi tiết 1 danh mục
 * @param {number} id - ID của danh mục
 * @returns {Promise<import("../schemas/catalogsSchemas").DanhMucResponse>}
 */
export const layDanhMucChiTiet = async (id) => {
  // GET /api/catalogs/danh-muc/123
  const res = await apiPublic.get(`${BASE_URL}/danh-muc/${id}`);
  return res.data;
};

/**
 * (Admin) Tạo danh mục mới
 * @param {import("../schemas/catalogsSchemas").DanhMucCreate} danhMucData
 * @returns {Promise<import("../schemas/catalogsSchemas").DanhMucResponse>}
 */
export const taoDanhMuc = async (danhMucData) => {
  // POST /api/catalogs/danh-muc
  const res = await apiPrivate.post(`${BASE_URL}/danh-muc`, danhMucData);
  return res.data;
};

/**
 * (Admin) Cập nhật danh mục
 * @param {Object} params
 * @param {number} params.id - ID danh mục
 * @param {import("../schemas/catalogsSchemas").DanhMucUpdate} params.danhMucData
 * @returns {Promise<import("../schemas/catalogsSchemas").DanhMucResponse>}
 */
export const capNhatDanhMuc = async ({ id, danhMucData }) => {
  // PUT /api/catalogs/danh-muc/123
  const res = await apiPrivate.put(`${BASE_URL}/danh-muc/${id}`, danhMucData);
  return res.data;
};

/**
 * (Admin) Xóa danh mục
 * @param {number} id - ID danh mục
 * @returns {Promise<{message: string}>}
 */
export const xoaDanhMuc = async (id) => {
  // DELETE /api/catalogs/danh-muc/123
  const res = await apiPrivate.delete(`${BASE_URL}/danh-muc/${id}`);
  return res.data; // { message: "..." }
};

// =================================================================
// 2. THƯƠNG HIỆU (BRAND) API
// =================================================================

/**
 * (Public) Lấy danh sách thương hiệu có phân trang
 * @param {Object} params - Các query params (page, per_page)
 * @param {number} [params.page=1]
 * @param {number} [params.per_page=10]
 * @returns {Promise<import("../schemas/catalogsSchemas").ThuongHieuListResponse>}
 */
export const layThuongHieus = async (params = {}) => {
  // GET /api/catalogs/thuong-hieu
  const res = await apiPublic.get(`${BASE_URL}/thuong-hieu`, { params });
  return res.data; // { data: [...], pagination: {...} }
};

/**
 * (Public) Lấy chi tiết 1 thương hiệu
 * @param {number} id - ID của thương hiệu
 * @returns {Promise<import("../schemas/catalogsSchemas").ThuongHieuResponse>}
 */
export const layThuongHieuChiTiet = async (id) => {
  // GET /api/catalogs/thuong-hieu/123
  const res = await apiPublic.get(`${BASE_URL}/thuong-hieu/${id}`);
  return res.data;
};

/**
 * (Admin) Tạo thương hiệu mới
 * @param {import("../schemas/catalogsSchemas").ThuongHieuCreate} thuongHieuData
 * @returns {Promise<import("../schemas/catalogsSchemas").ThuongHieuResponse>}
 */
export const taoThuongHieu = async (thuongHieuData) => {
  // POST /api/catalogs/thuong-hieu
  const res = await apiPrivate.post(`${BASE_URL}/thuong-hieu`, thuongHieuData);
  return res.data;
};

/**
 * (Admin) Cập nhật thương hiệu
 * @param {Object} params
 * @param {number} params.id - ID thương hiệu
 * @param {import("../schemas/catalogsSchemas").ThuongHieuUpdate} params.thuongHieuData
 * @returns {Promise<import("../schemas/catalogsSchemas").ThuongHieuResponse>}
 */
export const capNhatThuongHieu = async ({ id, thuongHieuData }) => {
  // PUT /api/catalogs/thuong-hieu/123
  const res = await apiPrivate.put(
    `${BASE_URL}/thuong-hieu/${id}`,
    thuongHieuData
  );
  return res.data;
};

/**
 * (Admin) Xóa thương hiệu
 * @param {number} id - ID thương hiệu
 * @returns {Promise<{message: string}>}
 */
export const xoaThuongHieu = async (id) => {
  // DELETE /api/catalogs/thuong-hieu/123
  const res = await apiPrivate.delete(`${BASE_URL}/thuong-hieu/${id}`);
  return res.data; // { message: "..." }
};
