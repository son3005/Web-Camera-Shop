// src/api/adminProductApi.js
// ============================================================
// API sản phẩm cho ADMIN
// - Dùng chung apiClient (base: http://localhost:5000/api)
// - CRUD sản phẩm (theo backend mới /api/san-pham)
// - Build FormData đúng format backend: "product" + images[...] (nhiều kiểu key)
// ============================================================

import apiClient from "./apiClient";

/**
 * Nhận object sản phẩm đã chuẩn hóa (đã là cac_bien_the)
 * và chuyển sang FormData:
 * - field "product": JSON string (⚠️ KHÔNG chứa File)
 * - ảnh: images[0], images[0][], images[0][0] ... để backend bắt được
 */
export const buildProductFormData = (product = {}) => {
  const formData = new FormData();

  const variants = Array.isArray(product.cac_bien_the)
    ? product.cac_bien_the
    : [];

  // 🔹 Tạo bản JSON sạch (không có field file)
  const productForJson = {
    ...product,
    cac_bien_the: variants.map((v) => ({
      ...v,
      hinh_anhs: (v.hinh_anhs || []).map((img) => {
        if (!img) return {};
        const { file, ...rest } = img; // loại file ra khỏi JSON
        return rest;
      }),
    })),
  };

  // 1. JSON chính
  formData.append("product", JSON.stringify(productForJson));

  // 2. Ảnh cho từng biến thể
  variants.forEach((variant, i) => {
    const idx = i; // index biến thể

    (variant.hinh_anhs || []).forEach((img, j) => {
      if (img && img.file instanceof File) {
        const file = img.file;
        // Gửi dưới 3 kiểu key khác nhau cho chắc chắn
        formData.append(`images[${idx}]`, file); // kiểu 1: images[0]
        formData.append(`images[${idx}][]`, file); // kiểu 2: images[0][]
        formData.append(`images[${idx}][${j}]`, file); // kiểu 3: images[0][0]

        // Nếu muốn debug:
        // console.log("FormData file key:", `images[${idx}]`, file.name);
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
  if (filters.min_price) params.set("min_price", String(filters.min_price));
  if (filters.max_price) params.set("max_price", String(filters.max_price));

  if (filters.sort_by_price) params.set("sort_by_price", filters.sort_by_price);
  if (filters.sort_by_name) params.set("sort_by_name", filters.sort_by_name);

  // thương hiệu
  if (Array.isArray(filters.thuong_hieu_ids)) {
    filters.thuong_hieu_ids.forEach((id) =>
      params.append("thuong_hieu_ids", String(id))
    );
  }

  // danh mục
  if (Array.isArray(filters.danh_muc_ids)) {
    filters.danh_muc_ids.forEach((id) =>
      params.append("danh_muc_ids", String(id))
    );
  }

  // cấp độ
  if (Array.isArray(filters.cap_do_ids)) {
    filters.cap_do_ids.forEach((id) => params.append("cap_do_ids", String(id)));
  }

  if (filters.trang_thai) {
    params.set("trang_thai", filters.trang_thai);
  }

  const { data } = await apiClient.get("/san-pham", { params });
  return data;
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
   POST /api/san-pham/
   ========================================================= */
export const createProduct = async (normalizedProduct) => {
  const formData = buildProductFormData(normalizedProduct);

  const { data } = await apiClient.post("/san-pham/", formData, {
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
   4.1. ĐỔI TRẠNG THÁI NHANH
   ========================================================= */
export const updateProductStatus = async (id, trang_thai) => {
  const formData = new FormData();
  formData.append("product", JSON.stringify({ trang_thai }));

  const { data } = await apiClient.put(`/san-pham/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
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
