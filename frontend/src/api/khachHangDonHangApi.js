// src/api/khachHangDonHangApi.js
import { apiPrivate } from "../lib/axios";

// Lấy danh sách đơn hàng của khách hàng (theo JWT)
export const layDonHangNguoiDung = async () => {
  const res = await apiPrivate.get("/api/khach-hang/don-hang");
  return res; // res đã là data vì interceptor đã xử lý
};

// Lấy chi tiết 1 đơn hàng của khách hàng
export const layChiTietDonHangNguoiDung = async (id) => {
  const res = await apiPrivate.get(`/api/khach-hang/don-hang/${id}`);
  return res;
};

// Khách hàng hủy đơn hàng
export const huyDonHangNguoiDung = async (id, ly_do) => {
  const res = await apiPrivate.post(`/api/khach-hang/don-hang/${id}/huy`, {
    ly_do,
  });
  return res;
};

// Khách hàng yêu cầu đổi trả
export const yeuCauDoiTra = async (id, ly_do) => {
  const res = await apiPrivate.post(
    `/api/khach-hang/don-hang/${id}/yeu-cau-doi-tra`,
    { ly_do }
  );
  return res;
};
