// src/api/taiLenApi.js
import { apiPrivate } from "../lib/axios";
import axios from "axios"; // Import axios GỐC

/**
 * (Admin) 1. Xin chữ ký từ backend
 * (Phải dùng apiPrivate vì đây là hành động của Admin)
 * @returns {Promise<object>} Dữ liệu chữ ký { signature, timestamp, api_key, folder }
 */
export const layChuKyTaiLen = async () => {
  // POST /api/upload/signature
  const res = await apiPrivate.post("/upload/signature");
  return res.data;
};

/**
 * (Admin) 2. Upload thẳng file lên Cloudinary
 * (Dùng axios GỐC, không dùng instance vì đây là API của bên thứ 3)
 * @param {File} file - File ảnh
 * @param {object} chuKyData - Dữ liệu chữ ký lấy từ layChuKyTaiLen()
 * @returns {Promise<object>} Dữ liệu ảnh từ Cloudinary { secure_url, public_id, ... }
 */
export const taiLenCloudinary = async (file, chuKyData) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", chuKyData.api_key);
  formData.append("timestamp", chuKyData.timestamp);
  formData.append("signature", chuKyData.signature);
  formData.append("folder", chuKyData.folder);

  // Lấy cloud_name từ biến môi trường
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/image/upload`;

  const res = await axios.post(CLOUDINARY_UPLOAD_URL, formData);

  // Trả về { secure_url, public_id }
  return res.data;
};
