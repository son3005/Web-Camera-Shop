// src/schemas/catalogsSchemas.js
import * as Yup from "yup";

// =================================================================
// 1. DANH MỤC (CATEGORY)
// =================================================================

/**
 * JSDoc type cho DanhMuc (match DanhMucResponse Pydantic)
 * @typedef {Object} DanhMucResponse
 * @property {number} id
 * @property {string} ma_danh_muc
 * @property {string} ten_danh_muc
 */

/**
 * JSDoc type cho DanhMucListResponse (match Pydantic)
 * @typedef {Object} DanhMucListResponse
 * @property {DanhMucResponse[]} data
 * @property {Object} pagination
 * @property {number} pagination.page
 * @property {number} pagination.per_page
 * @property {number} pagination.total
 * @property {number} pagination.pages
 */

/**
 * JSDoc type cho data tạo DanhMuc (match DanhMucCreate Pydantic)
 * @typedef {Object} DanhMucCreate
 * @property {string} ma_danh_muc
 * @property {string} ten_danh_muc
 */

// Yup schema cho form tạo DanhMuc (match DanhMucCreate)
export const danhMucCreateSchema = Yup.object({
  ma_danh_muc: Yup.string()
    .max(5, "Mã không quá 5 ký tự")
    .required("Mã danh mục là bắt buộc")
    .trim(),
  ten_danh_muc: Yup.string()
    .max(100, "Tên không quá 100 ký tự") // Khớp max_length=100
    .required("Tên danh mục là bắt buộc")
    .trim(),
});

/**
 * JSDoc type cho data cập nhật DanhMuc (match DanhMucUpdate Pydantic)
 * @typedef {Object} DanhMucUpdate
 * @property {string|null} [ma_danh_muc]
 * @property {string|null} [ten_danh_muc]
 */

// Yup schema cho form cập nhật DanhMuc (match DanhMucUpdate)
export const danhMucUpdateSchema = Yup.object({
  ma_danh_muc: Yup.string().max(5, "Mã không quá 5 ký tự").nullable().trim(),
  ten_danh_muc: Yup.string()
    .max(100, "Tên không quá 100 ký tự")
    .nullable()
    .trim(),
});

// =================================================================
// 2. THƯƠNG HIỆU (BRAND)
// =================================================================

/**
 * JSDoc type cho ThuongHieu (match ThuongHieuResponse Pydantic)
 * @typedef {Object} ThuongHieuResponse
 * @property {number} id
 * @property {string} ma_thuong_hieu
 * @property {string} ten_thuong_hieu
 * @property {string|null} [logo_url]
 * @property {string|null} [public_id]
 */

/**
 * JSDoc type cho ThuongHieuListResponse (match Pydantic)
 * @typedef {Object} ThuongHieuListResponse
 * @property {ThuongHieuResponse[]} data
 * @property {Object} pagination
 * @property {number} pagination.page
 * @property {number} pagination.per_page
 * @property {number} pagination.total
 * @property {number} pagination.pages
 */

/**
 * JSDoc type cho data tạo ThuongHieu (match ThuongHieuCreate Pydantic)
 * @typedef {Object} ThuongHieuCreate
 * @property {string} ma_thuong_hieu
 * @property {string} ten_thuong_hieu
 * @property {string|null} [logo_url]
 * @property {string|null} [public_id]
 */

// Yup schema cho form tạo ThuongHieu (match ThuongHieuCreate)
export const thuongHieuCreateSchema = Yup.object({
  ma_thuong_hieu: Yup.string()
    .max(5, "Mã không quá 5 ký tự")
    .required("Mã thương hiệu là bắt buộc")
    .trim(),
  ten_thuong_hieu: Yup.string()
    .max(100, "Tên không quá 100 ký tự")
    .required("Tên thương hiệu là bắt buộc")
    .trim(),
  logo_url: Yup.string()
    .url("URL logo không hợp lệ")
    .max(512, "URL quá dài") // Khớp max_length=512
    .nullable(),
  public_id: Yup.string().nullable(), // Khớp ThuongHieuCreate
});

/**
 * JSDoc type cho data cập nhật ThuongHieu (match ThuongHieuUpdate Pydantic)
 * @typedef {Object} ThuongHieuUpdate
 * @property {string|null} [ma_thuong_hieu]
 * @property {string|null} [ten_thuong_hieu]
 * @property {string|null} [logo_url]
 */

// Yup schema cho form cập nhật ThuongHieu (match ThuongHieuUpdate)
export const thuongHieuUpdateSchema = Yup.object({
  ma_thuong_hieu: Yup.string().max(5, "Mã không quá 5 ký tự").nullable().trim(),
  ten_thuong_hieu: Yup.string()
    .max(100, "Tên không quá 100 ký tự")
    .nullable()
    .trim(),
  logo_url: Yup.string()
    .url("URL logo không hợp lệ")
    .max(512, "URL quá dài") // Khớp max_length=512
    .nullable(),
});
