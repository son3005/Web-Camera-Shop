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

  // ✅ SỬA ĐỔI: Nếu bạn dùng interceptor trả về response.data
  // thì file axios.js của bạn đã làm điều đó (trả về res.data)
  // nên ở đây chỉ cần `return res;` (vì res đã là data rồi)
  // Nếu axios.js không trả về res.data, thì dùng `return res.data;`
  // Dựa trên file axios.js, bạn chỉ cần:
  return res;
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
  // ✅ SỬA ĐỔI: Sửa lại template literal bị hỏng
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/image/upload`;

  // Gửi bằng axios gốc
  const res = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
  return res.data; // Trả về data từ Cloudinary
};
