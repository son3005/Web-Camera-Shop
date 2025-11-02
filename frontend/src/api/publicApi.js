// frontend/src/api/publicApi.js
// API giao diện khách hàng — đồng bộ cấu trúc với phần Admin (productApi.js)

import axios from "axios";

// --- CHẾ ĐỘ DEV / PROD ---
export const USE_MOCK_API = true; // <- bật/tắt mock

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000/api",
});

// tiện ích delay dùng chung (mock)
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ========================= MOCK DATA (DEV) =========================
const brands = ["Sony", "Canon", "Nikon", "Fujifilm", "Panasonic", "Leica"];

const MOCK_PRODUCTS = Array.from({ length: 20 }, (_, i) => {
  const brand = brands[i % brands.length];
  const id = `P${String(i + 1).padStart(4, "0")}`;
  const basePrice = Math.floor(Math.random() * 15 + 10) * 1_000_000;
  const salePrice = Math.random() > 0.5 ? basePrice * 0.9 : basePrice;
  const totalStock = Math.floor(Math.random() * 100 + 10);

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

// ========================= CHUẨN HOÁ DỮ LIỆU =========================
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
});

// ========================= PUBLIC API =========================
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
    mpRanges = [],
    memoryTypes = [],
    videoRes = [],
    focusRanges = [],
    lensMounts = [],
  } = filters;

  if (USE_MOCK_API) {
    await delay(400);
    let data = [...MOCK_PRODUCTS];

    // search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter((p) => p.name.toLowerCase().includes(q));
    }

    // brand
    if (brands?.length) {
      const set = new Set(brands.map((b) => b.toLowerCase()));
      data = data.filter((p) => set.has(p.brand.toLowerCase()));
    }

    // price
    const min = Number(priceRange.min) || 0;
    const max = Number(priceRange.max) || Infinity;
    data = data.filter((p) => p.price_from >= min && p.price_from <= max);

    // mp
    if (mpRanges?.length) {
      data = data.filter((p) => {
        const mpNum = Number(
          (p.specs?.image?.resolution || "0").replace(/[^\d.]/g, "")
        );
        return mpRanges.some((range) => {
          if (range === ">=40") return mpNum >= 40;
          const [a, b] = range.split("-").map(Number);
          return mpNum >= a && mpNum <= b;
        });
      });
    }

    // memory
    if (memoryTypes?.length) {
      data = data.filter((p) => {
        const slots = (p.specs?.connectivity?.card_slots || "").toUpperCase();
        return memoryTypes.some((m) => slots.includes(m.toUpperCase()));
      });
    }

    // video
    if (videoRes?.length) {
      data = data.filter((p) => {
        const rv = (p.specs?.video?.resolution || "").toUpperCase();
        return videoRes.some((v) => rv.includes(v.toUpperCase()));
      });
    }

    // focus
    if (focusRanges?.length) {
      data = data.filter((p) => {
        const pts = Number(
          (p.specs?.focus?.points || "0").replace(/[^\d]/g, "")
        );
        return focusRanges.some((r) => {
          if (r === "<200") return pts < 200;
          if (r === ">=300") return pts >= 300;
          const [a, b] = r.split("-").map(Number);
          return pts >= a && pts <= b;
        });
      });
    }

    // mount
    if (lensMounts?.length) {
      data = data.filter((p) => {
        const m = (p.specs?.image?.lens_mount || "").toUpperCase();
        return lensMounts.some((x) => m.includes(x.toUpperCase()));
      });
    }

    // sort
    if (sort) {
      const s = sort.toLowerCase();
      data.sort((a, b) => {
        if (s === "price_asc") return a.price_from - b.price_from;
        if (s === "price_desc") return b.price_from - a.price_from;
        if (s === "name_asc") return a.name.localeCompare(b.name);
        if (s === "name_desc") return b.name.localeCompare(a.name);
        if (s === "new")
          return (
            Number(b.id.replace(/\D/g, "")) - Number(a.id.replace(/\D/g, ""))
          );
        return 0;
      });
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
      // khớp backend (tuỳ bạn map lại ở server)
      brands,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      mp: mpRanges,
      mem: memoryTypes,
      vres: videoRes,
      focus: focusRanges,
      mount: lensMounts,
    },
  });

  return {
    ...res.data,
    items: (res.data.items || res.data.data || []).map(normalizeProduct),
  };
}

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

export async function getBanners() {
  if (USE_MOCK_API) {
    await delay(200);
    return MOCK_BANNERS;
  }
  const res = await api.get("/banners");
  return res.data || [];
}
