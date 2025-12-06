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

  // Chỉ có tháng (tất cả năm) -> để backend xử lý chung, không xây range
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
 *
 *  - Không chọn gì / chỉ chọn NĂM:
 *      gọi  /thong-ke/doanh-thu?nam=...
 *      → backend trả theo năm / theo tháng
 *
 *  - Chọn cả NĂM + THÁNG:
 *      gọi  /thong-ke/danh-sach-loi-nhuan-doanh-thu?start_date&end_date
 *      → backend trả nested: [{nam, thang: [{thang, ngay:[{ngay,...}]}]}]
 *      → FE flatten ra từng ngày để vẽ chart (theo ngày trong tháng)
 * =======================================================*/
export async function layDuLieuDoanhThu({ nam, thang } = {}) {
  // Trường hợp chọn cả NĂM + THÁNG -> lấy chi tiết THEO NGÀY
  if (nam && thang) {
    const params = buildDateRangeFromYearMonth(nam, thang);
    const res = await api.get("/thong-ke/danh-sach-loi-nhuan-doanh-thu", {
      params,
    });
    const raw = handleResponse(res) || [];

    // Tìm đúng năm + tháng trong cấu trúc nested
    const yearItem = raw.find((y) => y.nam === nam);
    if (!yearItem || !Array.isArray(yearItem.thang)) return [];

    const monthItem = yearItem.thang.find((m) => m.thang === thang);
    if (!monthItem || !Array.isArray(monthItem.ngay)) return [];

    // Flatten: mỗi ngày là một điểm trên chart
    return monthItem.ngay.map((d) => ({
      nam,
      thang,
      ngay: d.ngay ?? null,
      tongDoanhThu: d.tong_doanh_thu || 0,
      loiNhuan: d.loi_nhuan || 0,
    }));
  }

  // Các trường hợp còn lại: dùng API tổng quan /thong-ke/doanh-thu
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
 *    Backend: /thong-ke/danh-sach-danh-gia
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
