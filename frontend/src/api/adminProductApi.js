// frontend/src/api/adminProductApi.js
// Gom toàn bộ hàm gọi API sản phẩm để FE xài lại

import apiClient from "./apiClient";

/**
 * Chuyển object sản phẩm thành FormData theo chuẩn backend.
 * - Đẩy toàn bộ json vào field "product"
 * - Duyệt qua các biến thể để append các file ảnh theo dạng images[i][j]
 */
export const buildProductFormData = (productData = {}) => {
  const formData = new FormData();

  // đẩy JSON gốc
  formData.append("product", JSON.stringify(productData));

  // lấy mảng biến thể từ 2 tên khác nhau
  const variants =
    productData.bien_the_san_phams || productData.cac_bien_the || [];

  // duyệt biến thể -> duyệt ảnh -> append file
  if (Array.isArray(variants)) {
    variants.forEach((variant, variantIndex) => {
      if (Array.isArray(variant.hinh_anhs)) {
        variant.hinh_anhs.forEach((image, imageIndex) => {
          if (image && image.file instanceof File) {
            formData.append(
              `images[${variantIndex}][${imageIndex}]`,
              image.file
            );
          }
        });
      }
    });
  }

  return formData;
};

/* =========================================================
   1. LẤY DANH SÁCH SẢN PHẨM
   BE: GET /api/san-pham
   ========================================================= */
export const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams();

  params.set("page", String(filters.page || 1));
  params.set("per_page", String(filters.per_page || 10));

  if (filters.search) params.set("search", filters.search);
  if (filters.min_price) params.set("min_price", filters.min_price);
  if (filters.max_price) params.set("max_price", filters.max_price);

  // đúng với backend: 2 param riêng
  if (filters.sort_by_price) params.set("sort_by_price", filters.sort_by_price);
  if (filters.sort_by_name) params.set("sort_by_name", filters.sort_by_name);

  // mảng thương hiệu
  if (Array.isArray(filters.thuong_hieu_ids)) {
    filters.thuong_hieu_ids.forEach((id) =>
      params.append("thuong_hieu_ids", id)
    );
  }

  // mảng danh mục
  if (Array.isArray(filters.danh_muc_ids)) {
    filters.danh_muc_ids.forEach((id) => params.append("danh_muc_ids", id));
  }

  // mảng cấp độ
  if (Array.isArray(filters.cap_do_ids)) {
    filters.cap_do_ids.forEach((id) => params.append("cap_do_ids", id));
  }

  const { data } = await apiClient.get(`/san-pham?${params.toString()}`);
  return data;
};

/* =========================================================
   2. LẤY CHI TIẾT
   ========================================================= */
export const fetchProductById = async (id) => {
  const { data } = await apiClient.get(`/san-pham/${id}`);
  return data;
};

/* =========================================================
   3. TẠO SẢN PHẨM
   ========================================================= */
export const createProduct = async (productData) => {
  const formData = buildProductFormData(productData);

  const { data } = await apiClient.post("/san-pham", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

/* =========================================================
   4. CẬP NHẬT SẢN PHẨM
   ========================================================= */
export const updateProduct = async (id, productData) => {
  const payload = { ...productData };

  // nếu FE dùng bien_the_san_phams thì chuyển sang cac_bien_the cho BE
  if (Array.isArray(payload.bien_the_san_phams) && !payload.cac_bien_the) {
    payload.cac_bien_the = payload.bien_the_san_phams;
  }

  const formData = buildProductFormData(payload);

  const { data } = await apiClient.put(`/san-pham/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

/* =========================================================
   5. XÓA SẢN PHẨM
   ========================================================= */
export const deleteProduct = async (id) => {
  const { data } = await apiClient.delete(`/san-pham/${id}`);
  return data;
};
