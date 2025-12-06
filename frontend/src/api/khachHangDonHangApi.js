// src/api/khachHangDonHangApi.js
import { apiPrivate } from "../lib/axios";

// Lấy danh sách đơn hàng của khách hàng (theo JWT)
export const layDonHangNguoiDung = async () => {
  // backend: GET /api/khach-hang/don-hang
  const res = await apiPrivate.get("/khach-hang/don-hang");
  // interceptor của apiPrivate đã trả về response.data
  // => res lúc này là mảng DonHangResponse
  return res;
};

// Lấy chi tiết 1 đơn hàng của khách hàng
export const layChiTietDonHangNguoiDung = async (id) => {
  const res = await apiPrivate.get(`/khach-hang/don-hang/${id}`);
  return res;
};

// Khách hàng hủy đơn hàng
export const huyDonHangNguoiDung = async (id, ly_do) => {
  const res = await apiPrivate.post(`/khach-hang/don-hang/${id}/huy`, {
    ly_do,
  });
  return res; // { msg: "..."}
};

// Khách hàng yêu cầu đổi trả
export const yeuCauDoiTra = async (id, ly_do) => {
  const res = await apiPrivate.post(
    `/khach-hang/don-hang/${id}/yeu-cau-doi-tra`,
    { ly_do }
  );
  return res; // { msg: "..."}
};
