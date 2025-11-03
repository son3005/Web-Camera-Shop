// services/api/productApi.js
import axios from "axios";

// Tạo instance axios với config mặc định
const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
});

// Request interceptor để thêm token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const productApi = {
  // Lấy danh sách sản phẩm với các tham số lọc
  getProducts: (params = {}) =>
    apiClient.get("/san-pham", { params }).then((res) => res.data),

  // Lấy chi tiết sản phẩm
  getProductById: (id) =>
    apiClient.get(`/san-pham/${id}`).then((res) => res.data),

  // Tạo sản phẩm mới
  createProduct: (productData) =>
    apiClient.post("/san-pham", productData).then((res) => res.data),

  // Cập nhật sản phẩm
  updateProduct: (id, productData) =>
    apiClient.put(`/san-pham/${id}`, productData).then((res) => res.data),

  // Xóa sản phẩm
  deleteProduct: (id) =>
    apiClient.delete(`/san-pham/${id}`).then((res) => res.data),

  // Export Excel
  exportExcel: () =>
    apiClient
      .get("/san-pham/export/excel", {
        responseType: "blob",
      })
      .then((res) => res.data),

  // Export PDF
  exportPDF: () =>
    apiClient
      .get("/san-pham/export/pdf", {
        responseType: "blob",
      })
      .then((res) => res.data),
};

export const variantApi = {
  // Tạo biến thể mới
  createVariant: (productId, variantData) =>
    apiClient
      .post(`/san-pham/${productId}/bien-the`, variantData)
      .then((res) => res.data),

  // Cập nhật biến thể
  updateVariant: (productId, variantId, variantData) =>
    apiClient
      .put(`/san-pham/${productId}/bien-the/${variantId}`, variantData)
      .then((res) => res.data),

  // Xóa biến thể
  deleteVariant: (productId, variantId) =>
    apiClient
      .delete(`/san-pham/${productId}/bien-the/${variantId}`)
      .then((res) => res.data),
};

export const imageApi = {
  // Thêm ảnh cho biến thể
  addImage: (productId, variantId, imageData) =>
    apiClient
      .post(`/san-pham/${productId}/bien-the/${variantId}/hinh-anh`, imageData)
      .then((res) => res.data),

  // Cập nhật ảnh
  updateImage: (productId, variantId, imageId, imageData) =>
    apiClient
      .put(
        `/san-pham/${productId}/bien-the/${variantId}/hinh-anh/${imageId}`,
        imageData
      )
      .then((res) => res.data),

  // Xóa ảnh
  deleteImage: (productId, variantId, imageId) =>
    apiClient
      .delete(
        `/san-pham/${productId}/bien-the/${variantId}/hinh-anh/${imageId}`
      )
      .then((res) => res.data),
};

export const catalogApi = {
  // Danh mục
  getCategories: () =>
    apiClient.get("/catalogs/danh-muc").then((res) => res.data),
  getBrands: () =>
    apiClient.get("/catalogs/thuong-hieu").then((res) => res.data),
};

export const uploadApi = {
  // Upload image through server
  uploadImage: (formData) =>
    apiClient
      .post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data),

  // Get signature for direct Cloudinary upload
  getSignature: (folder = "san_pham") =>
    apiClient.post("/upload/signature", { folder }).then((res) => res.data),
};

export default apiClient;
