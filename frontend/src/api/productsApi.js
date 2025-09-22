// src/services/productApi.js

import axios from "axios";

// Tạo một instance của axios với cấu hình cơ bản
// Thay 'http://localhost:5000/api' bằng URL thực tế của Flask backend của bạn
const apiClient = axios.create({
  baseURL: "http://localhost:5000/api", // Giả sử backend của bạn chạy trên port 5000 và có prefix /api
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Hàm gọi API để lấy danh sách tất cả sản phẩm
 * @returns {Promise<Array>} Promise chứa danh sách sản phẩm
 */
export const getProducts = async () => {
  // try...catch để xử lý lỗi một cách an toàn
  try {
    // Gửi request GET đến endpoint '/products'
    const response = await apiClient.get("/products");
    // Trả về dữ liệu từ response
    return response.data;
  } catch (error) {
    // Nếu có lỗi, throw lỗi để React Query có thể bắt và xử lý
    console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
    throw new Error(
      error.response?.data?.message || "Không thể kết nối đến máy chủ"
    );
  }
};

// Bạn cũng có thể định nghĩa các hàm khác ở đây sau này
// export const createProduct = async (productData) => { ... };
// export const updateProduct = async (productId, productData) => { ... };
// export const deleteProduct = async (productId) => { ... };
