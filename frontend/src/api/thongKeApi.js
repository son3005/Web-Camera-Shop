// src/api/thongKeApi.js
// ----------------------------------------------------
// Service gọi các API thống kê cho dashboard admin
// Map với backend /api/thong-ke/*
// ----------------------------------------------------

import apiClient from "./apiClient";

function unwrap(res) {
  const payload = res.data;
  if (!payload?.success) {
    throw new Error(payload?.message || "Lỗi API thống kê");
  }
  return payload.data ?? null;
}

// Helper: sắp xếp tăng dần theo năm / tháng để các biểu đồ đồng bộ
function sortByNamThang(list) {
  return [...list].sort((a, b) => {
    if (a.nam === b.nam) {
      const ta = a.thang ?? 0;
      const tb = b.thang ?? 0;
      return ta - tb;
    }
    return a.nam - b.nam;
  });
}

// Bảng màu dùng chung cho dashboard
const BRAND_COLORS = [
  "#0ea5e9", // sky
  "#22c55e", // emerald
  "#a855f7", // violet
  "#f97316", // orange
  "#e11d48", // rose
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#facc15", // amber
];

/** Tổng hợp thống kê dashboard (cards trên cùng) */
export async function layTongHopThongKe() {
  const data = unwrap(await apiClient.get("/thong-ke/tong-hop"));
  return data;
}

/** Doanh thu & lợi nhuận theo năm/tháng
 *  Backend đã lọc: chỉ đơn hàng DA_GIAO + thanh toán DA_THANH_TOAN
 */
export async function layDuLieuDoanhThu({ nam, thang } = {}) {
  const params = {};
  if (nam != null) params.nam = nam;
  if (thang != null) params.thang = thang;

  const raw =
    unwrap(await apiClient.get("/thong-ke/doanh-thu", { params })) || [];

  const mapped = raw.map((item) => ({
    nam: Number(item.nam),
    thang: item.thang != null ? Number(item.thang) : null,
    tongDoanhThu: Number(item.tong_doanh_thu || 0),
    loiNhuan: Number(item.loi_nhuan || 0),
  }));

  return sortByNamThang(mapped);
}

/** Tỉ trọng doanh thu theo thương hiệu
 *  Backend: đơn hàng DA_GIAO, tính theo tổng doanh thu
 */
export async function layTiTrongThuongHieu({ nam, thang } = {}) {
  const params = {};
  if (nam != null) params.nam = nam;
  if (thang != null) params.thang = thang;

  const raw =
    unwrap(await apiClient.get("/thong-ke/ti-trong-thuong-hieu", { params })) ||
    [];

  return raw.map((item, index) => ({
    tenThuongHieu: item.thuong_hieu,
    soLuongDon: Number(item.so_luong_don || 0),
    tongDoanhThu: Number(item.tong_doanh_thu || 0),
    tiTrongPhanTram: Number(item.ti_trong_phantram || 0),
    color: BRAND_COLORS[index % BRAND_COLORS.length],
  }));
}

/** Người dùng mới theo năm/tháng (ngay_tao) */
export async function layThongKeNguoiDungMoi({ nam, thang } = {}) {
  const params = {};
  if (nam != null) params.nam = nam;
  if (thang != null) params.thang = thang;

  const raw =
    unwrap(await apiClient.get("/thong-ke/nguoi-dung-moi", { params })) || [];

  const mapped = raw.map((item) => ({
    nam: Number(item.nam),
    thang: item.thang != null ? Number(item.thang) : null,
    soNguoiDungMoi: Number(item.so_nguoi_dung_moi || 0),
    tongSoTaiKhoan: Number(item.tong_so_tai_khoan || 0),
  }));

  return sortByNamThang(mapped);
}

/** Đơn hàng thành công theo năm/tháng (trạng thái DA_GIAO) */
export async function layThongKeDonHangThanhCong({ nam, thang } = {}) {
  const params = {};
  if (nam != null) params.nam = nam;
  if (thang != null) params.thang = thang;

  const raw =
    unwrap(await apiClient.get("/thong-ke/don-hang-thanh-cong", { params })) ||
    [];

  const mapped = raw.map((item) => ({
    nam: Number(item.nam),
    thang: item.thang != null ? Number(item.thang) : null,
    soDonThanhCong: Number(item.so_don_thanh_cong || 0),
  }));

  return sortByNamThang(mapped);
}

/** Người dùng đã đăng nhập theo năm/tháng (lan_cuoi_dang_nhap) */
export async function layThongKeDangNhap({ nam, thang } = {}) {
  const params = {};
  if (nam != null) params.nam = nam;
  if (thang != null) params.thang = thang;

  const raw =
    unwrap(await apiClient.get("/thong-ke/nguoi-dung-dang-nhap", { params })) ||
    [];

  const mapped = raw.map((item) => ({
    nam: Number(item.nam),
    thang: item.thang != null ? Number(item.thang) : null,
    soNguoiDungDangNhap: Number(item.so_nguoi_dung_dang_nhap || 0),
  }));

  return sortByNamThang(mapped);
}

/** Thống kê đánh giá (tích cực/trung bình/tiêu cực) */
export async function layThongKeDanhGia({ nam, thang } = {}) {
  const params = {};
  if (nam != null) params.nam = nam;
  if (thang != null) params.thang = thang;

  const raw =
    unwrap(await apiClient.get("/thong-ke/danh-gia", { params })) || [];

  const mapped = raw.map((item) => ({
    nam: Number(item.nam),
    thang: item.thang != null ? Number(item.thang) : null,
    danhGiaTieuCuc: Number(item.danh_gia_tieu_cuc || 0),
    danhGiaTrungBinh: Number(item.danh_gia_trung_binh || 0),
    danhGiaTichCuc: Number(item.danh_gia_tich_cuc || 0),
    tongSoDanhGia: Number(item.tong_so_danh_gia || 0),
  }));

  return sortByNamThang(mapped);
}
