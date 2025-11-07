// src/api/adminProductApi.js
// Gom toàn bộ hàm gọi API sản phẩm để FE xài lại

import apiClient from "./apiClient";

/**
 * Nhận object sản phẩm đã chuẩn hóa (đã là cac_bien_the)
 * và chuyển sang FormData theo đúng tài liệu backend:
 * - field "product": JSON string
 * - ảnh: images[i][j]
 */
export const buildProductFormData = (product = {}) => {
  const formData = new FormData();

  // 1. json chính
  formData.append("product", JSON.stringify(product));

  // 2. ảnh cho từng biến thể
  const variants = Array.isArray(product.cac_bien_the)
    ? product.cac_bien_the
    : [];

  variants.forEach((variant, i) => {
    (variant.hinh_anhs || []).forEach((img, j) => {
      if (img && img.file instanceof File) {
        formData.append(`images[${i}][${j}]`, img.file);
      }
    });
  });

  return formData;
};

/* =========================================================
   1. LẤY DANH SÁCH
   GET /api/san-pham
   ========================================================= */
export const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams();

  params.set("page", String(filters.page || 1));
  params.set("per_page", String(filters.per_page || 10));

  if (filters.search) params.set("search", filters.search);
  if (filters.min_price) params.set("min_price", filters.min_price);
  if (filters.max_price) params.set("max_price", filters.max_price);

  // tài liệu BE: sort_by_price: price_asc / price_desc
  if (filters.sort_by_price) params.set("sort_by_price", filters.sort_by_price);
  if (filters.sort_by_name) params.set("sort_by_name", filters.sort_by_name);

  if (Array.isArray(filters.thuong_hieu_ids)) {
    filters.thuong_hieu_ids.forEach((id) =>
      params.append("thuong_hieu_ids", id)
    );
  }
  if (Array.isArray(filters.danh_muc_ids)) {
    filters.danh_muc_ids.forEach((id) => params.append("danh_muc_ids", id));
  }
  if (Array.isArray(filters.cap_do_ids)) {
    filters.cap_do_ids.forEach((id) => params.append("cap_do_ids", id));
  }

  const { data } = await apiClient.get(`/san-pham?${params.toString()}`);
  return data;
};

/* =========================================================
   2. CHI TIẾT
   ========================================================= */
export const fetchProductById = async (id) => {
  const { data } = await apiClient.get(`/san-pham/${id}`);
  return data;
};

/* =========================================================
   3. TẠO MỚI
   POST /api/san-pham
   ========================================================= */
export const createProduct = async (normalizedProduct) => {
  const formData = buildProductFormData(normalizedProduct);

  const { data } = await apiClient.post("/san-pham", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

/* =========================================================
   4. CẬP NHẬT
   PUT /api/san-pham/{id}
   ========================================================= */
export const updateProduct = async (id, normalizedProduct) => {
  const formData = buildProductFormData(normalizedProduct);

  const { data } = await apiClient.put(`/san-pham/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

/* =========================================================
   5. XÓA
   ========================================================= */
export const deleteProduct = async (id) => {
  const { data } = await apiClient.delete(`/san-pham/${id}`);
  return data;
};
