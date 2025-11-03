// frontend/src/api/publicApi.js
// ===================================================================
// API giao diện khách hàng — đồng bộ cấu trúc với phần Admin (productApi.js)
// ===================================================================

import axios from "axios";

// --- CHẾ ĐỘ DEV / PROD ---
export const USE_MOCK_API = true; // ← bật mock (false = gọi backend thật)

// --- Tạo axios instance chung ---
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000/api",
});

// Tiện ích delay (dùng cho mock)
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ===================================================================
// --- DỮ LIỆU GIẢ LẬP (MOCK MODE) ---
// ===================================================================
const brands = ["Sony", "Canon", "Nikon", "Fujifilm", "Panasonic", "Leica"];

// 🆕 Danh sách cấp độ chuyên nghiệp (giả lập)
const LEVELS = ["beginner", "enthusiast", "professional"];
//  - beginner: Dễ sử dụng / phổ thông
//  - enthusiast: Bán chuyên
//  - professional: Chuyên nghiệp

// Tạo danh sách sản phẩm giả lập
const MOCK_PRODUCTS = Array.from({ length: 20 }, (_, i) => {
  const brand = brands[i % brands.length];
  const id = `P${String(i + 1).padStart(4, "0")}`;
  const basePrice = Math.floor(Math.random() * 15 + 10) * 1_000_000;
  const salePrice = Math.random() > 0.5 ? basePrice * 0.9 : basePrice;
  const totalStock = Math.floor(Math.random() * 100 + 10);

  const level = LEVELS[i % LEVELS.length];

  const variants = ["Đen", "Bạc", "Đỏ"].map((color, idx) => ({
    id: `V${i + 1}-${idx + 1}`,
    color,
    cost_price: basePrice * 0.8,
    selling_price: basePrice + idx * 300_000,
    sale_price: salePrice - idx * 100_000,
    stock: Math.floor(Math.random() * 20 + 5),
    sku: `SKU-${id}-${idx + 1}`,
    image: `https://picsum.photos/seed/${brand}-${i}-${idx}/640/640`,
  }));

  const specs = {
    lighting: { iso: "100–51200", shutter_speed: "1/4000 giây" },
    image: {
      sensor_format: "Full-Frame",
      resolution: `${24 + (i % 4) * 2}.0 MP`,
      lens_mount: `${brand.toUpperCase()} MOUNT`,
    },
    video: { resolution: "4K UHD, Full HD" },
    focus: { points: `${200 + (i % 4) * 50} điểm` },
    connectivity: { wireless: "Wi-Fi, Bluetooth" },
    other: { battery: "NP-FZ100 Lithium-Ion" },
  };

  return {
    id,
    name: `${brand} XM-${100 + i}`,
    brand,
    price_from: salePrice,
    compareAt: basePrice,
    total_stock: totalStock,
    rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
    reviewCount: Math.floor(Math.random() * 500),
    promoText: Math.random() > 0.6 ? "Giảm 10% + tặng kèm thẻ nhớ" : "",
    description:
      "<p>Dòng máy ảnh cao cấp, cảm biến Full-Frame, chống rung 5 trục, quay 4K UHD.</p>",
    variants,
    specs,
    images: variants.map((v) => v.image),
    primaryImage: variants[0].image,
    level,
  };
});

// Banners mock
const MOCK_BANNERS = [
  {
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600",
    title: "Siêu ưu đãi máy ảnh mùa thu",
    href: "/products",
  },
  {
    image:
      "https://images.unsplash.com/photo-1499083097717-a156f48fb0f1?q=80&w=1600",
    title: "Ống kính mới vừa cập bến",
    href: "/products?category=lens",
  },
];

// ===================================================================
// --- CHUẨN HOÁ DỮ LIỆU ---
// ===================================================================
const normalizeProduct = (p) => ({
  id: String(p.id),
  name: p.name ?? p.ten_san_pham ?? "",
  brand: p.brand ?? p.thuong_hieu?.ten_thuong_hieu ?? "",
  price_from: p.price_from ?? p.sale_price ?? p.gia_goc ?? p.selling_price ?? 0,
  compareAt: p.compareAt ?? p.original_price ?? null,
  rating: p.rating ?? p.avg_rating ?? 0,
  reviewCount: p.reviewCount ?? p.review_count ?? 0,
  total_stock: p.total_stock ?? p.tong_ton_kho ?? 0,
  promoText: p.promoText || p.promotion || "",
  description: p.description || "",
  primaryImage:
    p.primaryImage || p.anh_dai_dien || p.image || p.images?.[0] || "",
  images: p.images || p.hinh_anh?.map((x) => x.url) || [],
  variants: p.variants || p.bien_the || [],
  specs: p.specs || p.thong_so || {},
  level: p.level || p.cap_do || p.segment || null,
});

// ===================================================================
// --- API CHÍNH ---
// ===================================================================
export async function getProducts({
  page = 1,
  limit = 12,
  searchTerm = "",
  sort,
  filters = {},
} = {}) {
  const {
    brands = [],
    priceRange = { min: 0, max: 66_000_000 },
    levels = [],
  } = filters;

  if (USE_MOCK_API) {
    await delay(400);
    let data = [...MOCK_PRODUCTS];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (brands?.length) {
      const set = new Set(brands.map((b) => b.toLowerCase()));
      data = data.filter((p) => set.has(p.brand.toLowerCase()));
    }

    const min = Number(priceRange.min) || 0;
    const max = Number(priceRange.max) || Infinity;
    data = data.filter((p) => p.price_from >= min && p.price_from <= max);

    if (levels?.length) {
      const set = new Set(levels.map((x) => x.toLowerCase()));
      data = data.filter((p) => set.has((p.level || "").toLowerCase()));
    }

    const total = data.length;
    const start = (page - 1) * limit;
    const items = data.slice(start, start + limit);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  const res = await api.get("/products", {
    params: {
      page,
      limit,
      search: searchTerm,
      sort,
      brands,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      levels,
    },
  });

  return {
    ...res.data,
    items: (res.data.items || res.data.data || []).map(normalizeProduct),
  };
}

// Chi tiết sản phẩm
export async function getProduct(id) {
  if (USE_MOCK_API) {
    await delay(300);
    const found = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!found) throw new Error("Không tìm thấy sản phẩm");
    return found;
  }
  const res = await api.get(`/products/${id}`);
  return normalizeProduct(res.data);
}

// Banner trang chủ
export async function getBanners() {
  if (USE_MOCK_API) {
    await delay(200);
    return MOCK_BANNERS;
  }
  const res = await api.get("/banners");
  return res.data || [];
}

// ===================================================================
// --- QUICK SEARCH (DÙNG CHO HEADER) ---
// ===================================================================
export async function quickSearch(term, limit = 6) {
  const q = String(term || "")
    .trim()
    .toLowerCase();
  if (!q) return [];

  // Tách model thành từng mảnh: ví dụ "Canon XM-105 Mark II" => ["xm","105","mark","ii"]
  const getModelPieces = (p) => {
    const nameLower = (p.name || "").toLowerCase();
    const brandLower = (p.brand || "").toLowerCase();
    const tail = nameLower.startsWith(brandLower)
      ? nameLower.slice(brandLower.length).trim()
      : nameLower;
    return tail.split(/[\s\-_/]+/).filter(Boolean);
  };

  if (USE_MOCK_API) {
    await delay(160);
    const tokens = q.split(/\s+/).filter(Boolean);
    let list = [];

    if (tokens.length === 1) {
      const t = tokens[0];
      list = MOCK_PRODUCTS.filter((p) => {
        const brandLower = (p.brand || "").toLowerCase();
        const pieces = getModelPieces(p);
        const brandMatch = brandLower.startsWith(t);
        const modelMatch = pieces.some((pc) => pc.startsWith(t));
        return brandMatch || modelMatch;
      });
    } else {
      const brandPrefix = tokens[0];
      const rest = tokens.slice(1);
      list = MOCK_PRODUCTS.filter((p) => {
        const brandLower = (p.brand || "").toLowerCase();
        if (!brandLower.startsWith(brandPrefix)) return false;
        const pieces = getModelPieces(p);
        return rest.every((tk) => pieces.some((pc) => pc.startsWith(tk)));
      });
    }

    return list.slice(0, limit).map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price_from: p.price_from,
      primaryImage: p.primaryImage || p.images?.[0] || "",
    }));
  }

  // ✅ Backend mode — endpoint /products/quick-search
  const { data } = await api.get("/products/quick-search", {
    params: { term: q, limit },
  });

  const items = (data?.items || data || []).map((p) => ({
    id: String(p.id),
    name: p.name ?? p.ten_san_pham ?? "",
    brand: p.brand ?? p.thuong_hieu?.ten_thuong_hieu ?? "",
    price_from:
      p.price_from ?? p.sale_price ?? p.gia_goc ?? p.selling_price ?? 0,
    primaryImage:
      p.primaryImage || p.anh_dai_dien || p.image || p.images?.[0] || "",
  }));

  return items.slice(0, limit);
}
