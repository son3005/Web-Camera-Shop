// src/api/adminProductApi.js
// ============================================================
// API sản phẩm cho ADMIN
// - Dùng chung apiClient (base: http://localhost:5000/api)
// - CRUD sản phẩm
// - Tự build FormData đúng format backend: product + images[i][j]
// ============================================================

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
      // FE của bạn đang gắn File vào img.file
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
   dùng cho trang admin list
   ========================================================= */
export const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams();

  params.set("page", String(filters.page || 1));
  params.set("per_page", String(filters.per_page || 10));

  if (filters.search) params.search = filters.search;
  if (filters.min_price) params.min_price = filters.min_price;
  if (filters.max_price) params.max_price = filters.max_price;

  if (filters.sort_by_price) params.sort_by_price = filters.sort_by_price;
  if (filters.sort_by_name) params.sort_by_name = filters.sort_by_name;

  // thương hiệu
  if (Array.isArray(filters.thuong_hieu_ids)) {
    filters.thuong_hieu_ids.forEach((id) =>
      params.append("thuong_hieu_ids", id)
    );
  }
  // danh mục
  if (Array.isArray(filters.danh_muc_ids)) {
    filters.danh_muc_ids.forEach((id) => params.append("danh_muc_ids", id));
  }
  // cấp độ
  if (Array.isArray(filters.cap_do_ids)) {
    filters.cap_do_ids.forEach((id) => params.append("cap_do_ids", id));
  }

  // ✅ TRẠNG THÁI KINH DOANH
  // backend của bạn trong tài liệu phần sản phẩm thường dùng field "trang_thai"
  // nên mình gửi đúng key này
  if (filters.trang_thai) {
    // "dang_ban" | "ngung_ban"
    params.set("trang_thai", filters.trang_thai);
  }

  const { data } = await apiClient.get("/san-pham", { params });
  return data; // {data: [...], pagination: {...}}
};

/* =========================================================
   2. CHI TIẾT
   GET /api/san-pham/:id
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
    ĐỔI TRẠNG THÁI NHANH
   (nhiều backend sẽ có /san-pham/{id} và nhận JSON bình thường)
   mình gửi tối giản { trang_thai: "..."} để bật/tắt
   ========================================================= */
export const updateProductStatus = async (id, trang_thai) => {
  // nếu backend bạn CHỈ nhận PUT multipart thì phải đổi, còn nếu nhận JSON thì ok
  const { data } = await apiClient.put(`/san-pham/${id}`, {
    trang_thai,
  });
  return data;
};

/* =========================================================
   5. XÓA
   DELETE /api/san-pham/{id}
   ========================================================= */
export const deleteProduct = async (id) => {
  const { data } = await apiClient.delete(`/san-pham/${id}`);
  return data;
};
