// src/api/paymentApi.js
import apiClient from "./apiClient";

// Tạo đơn hàng ảo (PayOS / COD)
export const taoDonHangAo = async (data) => {
  const res = await apiClient.post("/thanh-toan/tao-don-hang-ao", data);
  return res.data;
};

// Kiểm tra trạng thái đơn hàng ảo (PayOS polling)
export const kiemTraDonHangAo = async (donHangAoId) => {
  const res = await apiClient.get(`/thanh-toan/kiem-tra-don-hang-ao/${donHangAoId}`);
  return res.data;
};
