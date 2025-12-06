// src/api/thongKeApi.js
// Map dữ liệu từ backend mới -> dạng camelCase mà các chart đang dùng

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Gắn token admin (nếu có)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleResponse = (res) => {
  const data = res.data;
  if (!data || data.success === false) {
    throw new Error(data?.message || "Lỗi khi lấy thống kê");
  }
  return data.data;
};

// Helper: build start_date / end_date từ nam, thang (dùng cho API danh-sach-*)
const buildDateRangeFromYearMonth = (nam, thang) => {
  if (!nam && !thang) return {};

  // Có năm, có tháng -> cả tháng đó
  if (nam && thang) {
    const start = new Date(nam, thang - 1, 1);
    const end = new Date(nam, thang, 0); // ngày cuối tháng
    const pad = (v) => String(v).padStart(2, "0");
    return {
      start_date: `${nam}-${pad(thang)}-01`,
      end_date: `${nam}-${pad(thang)}-${pad(end.getDate())}`,
    };
  }

  // Chỉ có năm -> cả năm
  if (nam && !thang) {
    return {
      start_date: `${nam}-01-01`,
      end_date: `${nam}-12-31`,
    };
  }

  // Chỉ có tháng (tất cả năm) -> không convert được chuẩn, cứ để backend trả tất cả
  return {};
};

/* =========================================================
 * 1. Tổng hợp dashboard
 * =======================================================*/
export async function layTongHopThongKe() {
  const res = await api.get("/thong-ke/tong-hop");
  return handleResponse(res); // {doanh_thu_thang_nay,...}
}

/* =========================================================
 * 2. Doanh thu & lợi nhuận
 *    Backend: /thong-ke/doanh-thu
 *    Trả về: [{nam, thang?, ngay?, tong_doanh_thu, loi_nhuan}]
 *    FE cần: [{nam, thang?, ngay?, tongDoanhThu, loiNhuan}]
 * =======================================================*/
export async function layDuLieuDoanhThu({ nam, thang } = {}) {
  const res = await api.get("/thong-ke/doanh-thu", {
    params: { nam, thang },
  });
  const raw = handleResponse(res) || [];

  return raw.map((item) => ({
    nam: item.nam,
    thang: item.thang ?? null,
    ngay: item.ngay ?? null,
    tongDoanhThu: item.tong_doanh_thu || 0,
    loiNhuan: item.loi_nhuan || 0,
  }));
}

/* =========================================================
 * 3. Người dùng mới
 *    Backend: /thong-ke/nguoi-dung-moi
 *    Trả về: {so_nguoi_dung_moi, tong_so_tai_khoan}
 * =======================================================*/
export async function layThongKeNguoiDungMoi({ nam, thang } = {}) {
  const res = await api.get("/thong-ke/nguoi-dung-moi", {
    params: { nam, thang },
  });
  const raw = handleResponse(res) || [];

  return raw.map((item) => ({
    nam: item.nam,
    thang: item.thang ?? null,
    soNguoiDungMoi: item.so_nguoi_dung_moi || 0,
    tongSoTaiKhoan: item.tong_so_tai_khoan ?? null,
  }));
}

/* =========================================================
 * 4. Đơn hàng thành công
 *    Backend: /thong-ke/don-hang-thanh-cong
 * =======================================================*/
export async function layThongKeDonHangThanhCong({ nam, thang } = {}) {
  const res = await api.get("/thong-ke/don-hang-thanh-cong", {
    params: { nam, thang },
  });
  const raw = handleResponse(res) || [];

  return raw.map((item) => ({
    nam: item.nam,
    thang: item.thang ?? null,
    soDonThanhCong: item.so_don_thanh_cong || 0,
  }));
}

/* =========================================================
 * 5. Tỉ trọng thương hiệu
 *    Backend: /thong-ke/ti-trong-thuong-hieu
 *    Trả về: {thuong_hieu, so_luong_don, tong_doanh_thu, ti_trong_phantram}
 * =======================================================*/
const BRAND_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#eab308",
  "#ec4899",
  "#a855f7",
];

export async function layTiTrongThuongHieu({ nam, thang } = {}) {
  const res = await api.get("/thong-ke/ti-trong-thuong-hieu", {
    params: { nam, thang },
  });
  const raw = handleResponse(res) || [];

  return raw.map((item, index) => ({
    tenThuongHieu: item.thuong_hieu,
    soLuongDon: item.so_luong_don || 0,
    tongDoanhThu: item.tong_doanh_thu || 0,
    tiTrongPhanTram: item.ti_trong_phantram || 0,
    color: BRAND_COLORS[index % BRAND_COLORS.length],
  }));
}

/* =========================================================
 * 6. Người dùng hoạt động (đăng nhập)
 *    Backend: /thong-ke/nguoi-dung-dang-nhap
 * =======================================================*/
export async function layThongKeDangNhap({ nam, thang } = {}) {
  const res = await api.get("/thong-ke/nguoi-dung-dang-nhap", {
    params: { nam, thang },
  });
  const raw = handleResponse(res) || [];

  return raw.map((item) => ({
    nam: item.nam,
    thang: item.thang ?? null,
    soNguoiDungDangNhap: item.so_nguoi_dung_dang_nhap || 0,
  }));
}

/* =========================================================
 * 7. Chất lượng đánh giá
 *    Backend mới: /thong-ke/danh-sach-danh-gia?start_date&end_date
 *    Trả về dạng phân cấp: [{nam, danh_gia_*, thang: [{thang, ...}]}]
 *
 *    Ta map về dạng cũ:
 *      - không filter -> mỗi năm 1 item
 *      - filter nam    -> 1 item cho năm đó
 *      - filter nam+thang -> 1 item cho tháng đó
 *      - filter thang (không nam) -> gộp cùng tháng của tất cả năm
 * =======================================================*/
export async function layThongKeDanhGia({ nam, thang } = {}) {
  const params = buildDateRangeFromYearMonth(nam, thang);

  const res = await api.get("/thong-ke/danh-sach-danh-gia", { params });
  const raw = handleResponse(res) || [];

  // Không filter -> mỗi năm là 1 dòng
  if (!nam && !thang) {
    return raw.map((item) => ({
      nam: item.nam,
      danhGiaTieuCuc: item.danh_gia_tieu_cuc || 0,
      danhGiaTrungBinh: item.danh_gia_trung_binh || 0,
      danhGiaTichCuc: item.danh_gia_tich_cuc || 0,
    }));
  }

  // Có năm, không tháng -> 1 dòng cho cả năm đó
  if (nam && !thang) {
    const yearItem = raw.find((x) => x.nam === nam);
    if (!yearItem) return [];
    return [
      {
        nam,
        danhGiaTieuCuc: yearItem.danh_gia_tieu_cuc || 0,
        danhGiaTrungBinh: yearItem.danh_gia_trung_binh || 0,
        danhGiaTichCuc: yearItem.danh_gia_tich_cuc || 0,
      },
    ];
  }

  // Có tháng, không năm -> gộp tất cả năm cho tháng đó
  if (!nam && thang) {
    let agg = {
      danh_gia_tieu_cuc: 0,
      danh_gia_trung_binh: 0,
      danh_gia_tich_cuc: 0,
    };

    raw.forEach((yearItem) => {
      const m =
        Array.isArray(yearItem.thang) &&
        yearItem.thang.find((t) => t.thang === thang);
      if (!m) return;
      agg.danh_gia_tieu_cuc += m.danh_gia_tieu_cuc || 0;
      agg.danh_gia_trung_binh += m.danh_gia_trung_binh || 0;
      agg.danh_gia_tich_cuc += m.danh_gia_tich_cuc || 0;
    });

    return [
      {
        nam: null,
        thang,
        danhGiaTieuCuc: agg.danh_gia_tieu_cuc,
        danhGiaTrungBinh: agg.danh_gia_trung_binh,
        danhGiaTichCuc: agg.danh_gia_tich_cuc,
      },
    ];
  }

  // Có cả năm + tháng -> lấy đúng tháng trong năm đó
  if (nam && thang) {
    const yearItem = raw.find((x) => x.nam === nam);
    if (!yearItem || !Array.isArray(yearItem.thang)) return [];

    const monthItem = yearItem.thang.find((t) => t.thang === thang);
    if (!monthItem) return [];

    return [
      {
        nam,
        thang,
        danhGiaTieuCuc: monthItem.danh_gia_tieu_cuc || 0,
        danhGiaTrungBinh: monthItem.danh_gia_trung_binh || 0,
        danhGiaTichCuc: monthItem.danh_gia_tich_cuc || 0,
      },
    ];
  }

  return [];
}
