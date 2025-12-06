// src/api/adminDonHangApi.js
import { apiPrivate } from "../lib/axios";

/**
 * Lấy danh sách đơn hàng (có filter, sort)
 * params: {
 *   trang_thai?: string,
 *   tu_ngay?: string (ISO),
 *   den_ngay?: string (ISO),
 *   phuong_thuc_thanh_toan?: string,
 *   sap_xep_theo?: 'ngay_tao' | 'tong_tien',
 *   thu_tu?: 'asc' | 'desc'
 * }
 */
export const layDanhSachDonHangAdmin = async (params = {}) => {
  // apiPrivate đã có interceptor trả response.data rồi
  const data = await apiPrivate.get("/admin/don-hang", { params });
  return data; // mảng đơn hàng
};

/**
 * Lấy chi tiết 1 đơn hàng
 */
export const layChiTietDonHangAdmin = async (id) => {
  const data = await apiPrivate.get(`/admin/don-hang/${id}`);
  return data;
};

/**
 * Cập nhật trạng thái đơn hàng
 * body: { trang_thai, ly_do? }
 */
export const capNhatTrangThaiDonHangAdmin = async ({
  id,
  trang_thai,
  ly_do,
}) => {
  const body = { trang_thai };
  if (ly_do) body.ly_do = ly_do;

  const data = await apiPrivate.put(`/admin/don-hang/${id}/trang-thai`, body);
  return data;
};

/**
 * Cập nhật trạng thái thanh toán (COD)
 * body: { trang_thai_thanh_toan }
 */
export const capNhatTrangThaiThanhToanAdmin = async ({
  id,
  trang_thai_thanh_toan,
}) => {
  const data = await apiPrivate.put(`/admin/don-hang/${id}/thanh-toan`, {
    trang_thai_thanh_toan,
  });
  return data;
};

/**
 * Admin huỷ đơn hàng
 * DELETE /admin/don-hang/<id> + body { ly_do }
 */
export const huyDonHangAdmin = async ({ id, ly_do }) => {
  const data = await apiPrivate.delete(`/admin/don-hang/${id}`, {
    data: { ly_do },
  });
  return data;
};
