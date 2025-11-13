// src/api/categoriesApi.js
// =====================================================
// API Danh Mục - Quản lý danh mục sản phẩm (CRUD)
// Base URL: http://localhost:5000/api/danh-muc/
// =====================================================

import apiClient from "./apiClient";

// ✅ Lấy danh sách danh mục (có phân trang)
export const getCategories = async ({ page = 1, per_page = 10 } = {}) => {
  const { data } = await apiClient.get("/danh-muc/", {
    params: { page, per_page },
  });
  return data; // { data: [...], pagination: {...} }
};

// ✅ Lấy chi tiết danh mục theo ID
export const getCategoryById = async (id) => {
  const { data } = await apiClient.get(`/danh-muc/${id}`);
  return data;
};

// ✅ Tạo mới danh mục
export const createCategory = async (payload) => {
  const { data } = await apiClient.post("/danh-muc/", payload);
  return data;
};

// ✅ Cập nhật danh mục
export const updateCategory = async ({ id, ...payload }) => {
  const { data } = await apiClient.put(`/danh-muc/${id}`, payload);
  return data;
};

// ✅ Xóa danh mục
export const deleteCategory = async (id) => {
  const { data } = await apiClient.delete(`/danh-muc/${id}`);
  return data;
};

// ✅ Kiểm tra danh mục có đang được sử dụng hay không
export const checkCategoryUsage = async (id) => {
  const { data } = await apiClient.get(`/danh-muc/${id}/kiem-tra-su-dung`);
  return data; // { dang_su_dung, so_luong, thong_tin: [...] }
};
