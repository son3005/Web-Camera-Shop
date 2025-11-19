import { apiPrivate } from "../lib/axios";

// Lấy danh sách địa chỉ
export const layDanhSachDiaChi = async () => {
  const res = await apiPrivate.get("/dia-chi");
  return res;   // res = { data: [...], pagination: {...} }
};

// Thêm địa chỉ mới
export const taoDiaChi = async (data) => {
  const res = await apiPrivate.post("/dia-chi", data);
  return res;
};

// Cập nhật địa chỉ
export const capNhatDiaChi = async (id, data) => {
  const res = await apiPrivate.put(`/dia-chi/${id}`, data);
  return res;
};

// Xóa địa chỉ
export const xoaDiaChi = async (id) => {
  const res = await apiPrivate.delete(`/dia-chi/${id}`);
  return res;
};

// Đặt mặc định
export const datMacDinh = async (id) => {
  const res = await apiPrivate.patch(`/dia-chi/${id}/mac-dinh`);
  return res;
};
