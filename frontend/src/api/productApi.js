// src/api/productApi.js
// ============================================================
// API sản phẩm cho frontend (client)
// - Dùng apiClient (base: http://localhost:5000/api)
// - Endpoint thực tế: /api/san-pham  và  /api/san-pham/:id
// - Có normalizeProduct để FE xài đồng nhất
// - Thêm các API: sản phẩm nổi bật, mới nhất, liên quan, tìm biến thể
// ============================================================

import apiClient from "./apiClient";

// ----------------------------------------------
// HELPER: chọn ảnh đại diện từ biến thể
// ----------------------------------------------
function pickPrimaryImage(variants = []) {
  for (const v of variants) {
    if (Array.isArray(v.hinh_anhs) && v.hinh_anhs.length > 0) {
      const main =
        v.hinh_anhs.find((img) => img.la_anh_dai_dien) || v.hinh_anhs[0];
      if (main?.url) return main.url;
    }
  }
  return "";
}

// HELPER: lấy giá nhỏ nhất
function getMinPrice(variants = []) {
  if (!variants.length) return 0;
  const prices = variants
    .map((v) => Number(v.gia_ban || 0))
    .filter((n) => !Number.isNaN(n));
  if (!prices.length) return 0;
  return Math.min(...prices);
}

// ----------------------------------------------
// Chuẩn hoá sản phẩm từ backend về format FE đang dùng
// ----------------------------------------------
export function normalizeProduct(sp) {
  if (!sp) return null;

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
    category_id: sp.danh_muc?.id,
    level: sp.cap_do?.ten_cap_do || "",
    level_id: sp.cap_do?.id,

    // dữ liệu gốc để chỗ khác xài
    variants,

    // giá & ảnh
    price_from,
    primaryImage: pickPrimaryImage(variants),
    images: variants
      .flatMap((v) => (v.hinh_anhs || []).map((img) => img.url))
      .filter(Boolean),

    // rating (nếu backend có)
    rating: sp.trung_binh_danh_gia || 0,
    reviewCount: sp.so_luong_danh_gia || 0,

    created_at: sp.ngay_tao,
    updated_at: sp.ngay_cap_nhat,
  };
}

// ----------------------------------------------
// LẤY DANH SÁCH SẢN PHẨM (client)
// GET /api/san-pham
// ----------------------------------------------
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

  if (search) params.search = search;

  // giá
  if (filters.price?.min != null) params.min_price = filters.price.min;
  if (filters.price?.max != null) params.max_price = filters.price.max;

  // lọc theo các bảng phụ
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

  // sort: backend dùng sort_by_price, sort_by_name
  if (sort?.startsWith("price_")) {
    params.sort_by_price = sort; // "price_asc" | "price_desc"
  } else if (sort?.startsWith("name_")) {
    params.sort_by_name = sort; // "name_asc" | "name_desc"
  }

  // Gửi array dạng ?thuong_hieu_ids=1&thuong_hieu_ids=2
  const res = await apiClient.get("/san-pham", {
    params,
    paramsSerializer: (paramsObj) => {
      const sp = new URLSearchParams();
      Object.entries(paramsObj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v !== undefined && v !== null) {
              sp.append(key, String(v));
            }
          });
        } else if (value !== undefined && value !== null) {
          sp.append(key, String(value));
        }
      });
      return sp.toString();
    },
  });

  const raw = res.data;
  const arr = raw.data || [];
  const pagination = raw.pagination || {};

  return {
    items: arr.map((p) => normalizeProduct(p)),
    total: pagination.total ?? arr.length,
    page: pagination.page ?? page,
    totalPages: pagination.pages ?? 1,
  };
}

// ----------------------------------------------
// LẤY CHI TIẾT SẢN PHẨM
// GET /api/san-pham/:id
// ----------------------------------------------
export async function getProduct(id) {
  const res = await apiClient.get(`/san-pham/${id}`);
  return normalizeProduct(res.data);
}

// ----------------------------------------------
// QUICK SEARCH ở header
// GET /api/san-pham?search=...&per_page=6
// ----------------------------------------------
export async function quickSearch(term, limit = 6) {
  const q = String(term || "").trim();
  if (!q) return [];

  const res = await apiClient.get("/san-pham", {
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

// ----------------------------------------------
// LẤY DANH SÁCH SẢN PHẨM CƠ BẢN (cho Phiếu Thu)
// GET /api/san-pham/danh-sach-co-ban
// ----------------------------------------------
export async function getProductsBasic() {
  const res = await apiClient.get("/san-pham/danh-sach-co-ban");
  return res.data; // { data: [ { id, ten_san_pham } ] }
}

// ----------------------------------------------
// LẤY SẢN PHẨM NỔI BẬT
// GET /api/san-pham/danh-sach-noi-bat?limit=...
// ----------------------------------------------
export async function getFeaturedProducts(limit = 8) {
  const res = await apiClient.get("/san-pham/danh-sach-noi-bat", {
    params: { limit },
  });

  const raw = res.data;
  const arr = raw.data || [];
  return arr.map((p) => normalizeProduct(p));
}

// ----------------------------------------------
// LẤY SẢN PHẨM MỚI NHẤT
// GET /api/san-pham/danh-sach-moi-nhat/?limit=...
// ----------------------------------------------
export async function getNewestProducts(limit = 8) {
  const res = await apiClient.get("/san-pham/danh-sach-moi-nhat/", {
    params: { limit },
  });

  const raw = res.data;
  const arr = raw.data || [];
  return arr.map((p) => normalizeProduct(p));
}

// ----------------------------------------------
// LẤY SẢN PHẨM LIÊN QUAN
// GET /api/san-pham/:id/lien-quan?limit=...
// ----------------------------------------------
export async function getRelatedProducts(productId, limit = 8) {
  const res = await apiClient.get(`/san-pham/${productId}/lien-quan`, {
    params: { limit },
  });

  const raw = res.data;
  const arr = raw.data || [];
  return arr.map((p) => normalizeProduct(p));
}

// ----------------------------------------------
// TÌM KIẾM BIẾN THỂ (autocomplete)
// GET /api/san-pham/tim-kiem-bien-the?query=...&limit=...
// ----------------------------------------------
export async function searchVariantsByProductName(query, limit = 20) {
  const q = String(query || "").trim();
  if (!q) return [];

  const res = await apiClient.get("/san-pham/tim-kiem-bien-the", {
    params: { query: q, limit },
  });

  const raw = res.data;
  return raw.data || [];
}
