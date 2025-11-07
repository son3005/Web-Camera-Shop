import { apiPrivate } from "../lib/axios";

// === Lấy danh sách phiếu thu (GET /api/phieu-thu) ===
export const getPhieuThuList = async (params = {}) => {
  console.log("🔍 GET PHIEU THU PARAMS:", params);
  const res = await apiPrivate.get("/phieu-thu", { params });
  return res.data;
};

// === Lấy chi tiết phiếu thu (GET /api/phieu-thu/:id) ===
export const getPhieuThuDetail = async (id) => {
  const res = await apiPrivate.get(`/phieu-thu/${id}`);
  return res.data.data;
};

// === Tạo phiếu thu mới (POST /api/phieu-thu) ===
export const createPhieuThu = async (data) => {
  const res = await apiPrivate.post("/phieu-thu", data);
  return res.data;
};

// === Cập nhật phiếu thu (PUT /api/phieu-thu/:id) ===
export const updatePhieuThu = async (id, data) => {
  const res = await apiPrivate.put(`/phieu-thu/${id}`, data);
  return res.data;
};

// === Thống kê nhập hàng (GET /api/phieu-thu/thong-ke) ===
export const getThongKeNhapHang = async (params = { nam: new Date().getFullYear() }) => {
  const res = await apiPrivate.get("/phieu-thu/thong-ke", { params });
  return res.data.thong_ke;
};
