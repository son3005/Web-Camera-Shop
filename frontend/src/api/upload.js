// src/api/upload.js
import api from "./config";

// Lấy chữ ký upload (client-side)
export const lay_signature_upload = async (folder = "san_pham") => {
  const { data } = await api.post("/upload/signature", { folder });
  return data; // { signature, timestamp, api_key, folder }
};

// Upload ảnh trực tiếp qua server (fallback)
export const upload_anh_server = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/upload/image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { url, public_id }
};
