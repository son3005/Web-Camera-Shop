// src/api/uploadApi.js
import { apiPrivate } from "../lib/axios"; // Dùng file của bạn
import axios from "axios"; // Dùng axios GỐC để upload lên Cloudinary
import { toast } from "react-hot-toast";

/**
 * API lấy chữ ký upload từ backend
 * Tương ứng: POST /api/upload/signature
 */
export const uploadApi = {
  getUploadSignature: () => {
    // Backend 'upload_routes.py' của bạn chờ 1 body { folder: '...' }
    return apiPrivate.post("/upload/signature", { folder: "san_pham" });
  },
};

/**
 * Hàm tiện ích upload file lên Cloudinary
 * Hàm này KHÔNG THAY ĐỔI, vì nó đã gọi 'uploadApi.getUploadSignature'
 * (đã được cập nhật để dùng 'apiPrivate' ở trên)
 */
export const uploadToCloudinary = async (file) => {
  try {
    // 1. Lấy chữ ký từ backend (đã dùng apiPrivate)
    const signatureData = await uploadApi.getUploadSignature();
    // Chú ý: File axios.js của bạn trả về `response.data`
    // nên 'signatureData' chính là object bạn cần
    const { signature, timestamp, api_key, folder } = signatureData;

    // 2. Chuẩn bị FormData để gửi lên Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp);
    formData.append("api_key", api_key);
    formData.append("folder", folder);

    // 3. Gửi request POST trực tiếp lên Cloudinary (dùng axios GỐC)
    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    }/image/upload`;

    const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData);

    // 4. Trả về thông tin ảnh đã upload
    return {
      url: response.data.secure_url,
      public_id: response.data.public_id,
    };
  } catch (error) {
    // Vì 'apiPrivate' đã log lỗi, ở đây ta chỉ cần báo cho user
    console.error("Lỗi upload ảnh lên Cloudinary:", error);
    toast.error("Upload ảnh thất bại!");
    throw error;
  }
};
