// src/api/productApi.js
// ============================================================
// API sản phẩm cho frontend, ĐÃ SỬA để khớp với Flask backend
// của bạn đang xài endpoint:  GET /san-pham  và  GET /san-pham/:id
// (không phải /api/san-pham nữa)
// ============================================================

import axios from "axios";

// Tạo axios instance riêng cho sản phẩm
// Ưu tiên lấy từ .env (VITE_API_BASE_URL), không có thì localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: false,
});

// ============================================================
// HELPER
// ============================================================

// Chọn ảnh đại diện từ các biến thể
function pickPrimaryImage(variants = []) {
  for (const v of variants) {
    if (v.hinh_anhs && v.hinh_anhs.length) {
      const main =
        v.hinh_anhs.find((img) => img.la_anh_dai_dien) || v.hinh_anhs[0];
      if (main?.url) return main.url;
    }
  }
  return "";
}

// Lấy giá nhỏ nhất trong các biến thể
function getMinPrice(variants = []) {
  if (!variants.length) return 0;
  const prices = variants
    .map((v) => Number(v.gia_ban || 0))
    .filter((n) => !Number.isNaN(n));
  if (!prices.length) return 0;
  return Math.min(...prices);
}

// Chuẩn hoá sản phẩm từ backend về format FE đang dùng
export function normalizeProduct(sp) {
  if (!sp) return null;

  // backend bạn đang dùng field "cac_bien_the"
  const variants = sp.cac_bien_the || [];
  const price_from = getMinPrice(variants);

  return {
    id: sp.id,
    code: sp.ma_san_pham,
    name: sp.ten_san_pham,
    description: sp.mo_ta,
    specs: sp.thong_so_ky_thuat || {},

    // quan hệ
    brand: sp.thuong_hieu?.ten_thuong_hieu || "",
    brand_id: sp.thuong_hieu?.id,
    category: sp.danh_muc?.ten_danh_muc || "",
    level: sp.cap_do?.ten_cap_do || "",

    // biến thể giữ nguyên để FE khác xài
    variants,

    // giá và ảnh
    price_from,
    primaryImage: pickPrimaryImage(variants),
    images: variants
      .flatMap((v) => (v.hinh_anhs || []).map((img) => img.url))
      .filter(Boolean),

    // rating (nếu backend có)
    rating: sp.trung_binh_danh_gia || 0,
    reviewCount: sp.so_luong_danh_gia || 0,
  };
}

// ============================================================
// API: LẤY DANH SÁCH SẢN PHẨM
// khớp route Flask: GET /san-pham
// ============================================================
export async function getProducts({
  page = 1,
  limit = 12,
  search = "",
  sort = "",
  filters = {},
} = {}) {
  const params = {
    page,
    per_page: limit,
  };

  // search toàn văn
  if (search) {
    params.search = search;
  }

  // giá
  if (filters.price?.min != null) {
    params.min_price = filters.price.min;
  }
  if (filters.price?.max != null) {
    params.max_price = filters.price.max;
  }

  // lọc theo thương hiệu / danh mục / cấp độ
  if (
    Array.isArray(filters.thuong_hieu_ids) &&
    filters.thuong_hieu_ids.length
  ) {
    params.thuong_hieu_ids = filters.thuong_hieu_ids;
  }
  if (Array.isArray(filters.danh_muc_ids) && filters.danh_muc_ids.length) {
    params.danh_muc_ids = filters.danh_muc_ids;
  }
  if (Array.isArray(filters.cap_do_ids) && filters.cap_do_ids.length) {
    params.cap_do_ids = filters.cap_do_ids;
  }

  // sort: backend bạn đang dùng 1 tham số sort_by
  if (sort) {
    // vd: "price_asc" | "price_desc" | "name_asc" | "name_desc"
    params.sort_by = sort;
  }

  // ⚠️ ĐIỂM QUAN TRỌNG: gọi đúng /san-pham (KHÔNG phải /api/san-pham)
  const res = await api.get("/san-pham", { params });

  // backend của bạn đã trả kiểu {data: [...], pagination: {...}}
  const raw = res.data;
  const arr = raw.data || raw.items || [];
  const pagination = raw.pagination || {};

  const total = pagination.total ?? arr.length;
  const pages = pagination.pages ?? 1;

  return {
    items: arr.map((p) => normalizeProduct(p)),
    total,
    page: pagination.page ?? page,
    totalPages: pages,
  };
}

// ============================================================
// API: LẤY CHI TIẾT SẢN PHẨM
// khớp route Flask: GET /san-pham/:id
// ============================================================
export async function getProduct(id) {
  // ⚠️ Cũng sửa chỗ này thành /san-pham
  const res = await api.get(`/san-pham/${id}`);
  return normalizeProduct(res.data);
}

// ============================================================
// API: QUICK SEARCH CHO HEADER
// Tận dụng luôn /san-pham?search=...&per_page=6
// ============================================================
export async function quickSearch(term, limit = 6) {
  const q = String(term || "").trim();
  if (!q) return [];

  // ⚠️ gọi /san-pham
  const res = await api.get("/san-pham", {
    params: {
      search: q,
      per_page: limit,
      page: 1,
    },
  });

  const arr = res.data.data || [];
  return arr.slice(0, limit).map((p) => {
    const norm = normalizeProduct(p);
    return {
      id: norm.id,
      name: norm.name,
      brand: norm.brand,
      price_from: norm.price_from,
      primaryImage: norm.primaryImage,
    };
  });
}
