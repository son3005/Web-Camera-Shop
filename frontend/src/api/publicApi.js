// frontend/src/api/publicApi.js
// API giao diện khách hàng — đồng bộ cấu trúc với phần Admin (productApi.js)

import axios from "axios";

// --- CHẾ ĐỘ DEV / PROD ---
const USE_MOCK_API = true;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000/api",
});

// === Tiện ích ===
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

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
    lighting: {
      iso: "100–51200",
      shutter_speed: "1/4000 giây",
      metering: "Đa vùng, Trung tâm, Điểm",
      white_balance: "Tự động, Ánh sáng ban ngày, Mây",
      continuous_shooting_speed: "10 fps",
    },
    image: {
      sensor_format: "Full-Frame",
      resolution: "24.2 MP",
      image_size: "6000 x 4000",
      aspect_ratio: "3:2",
      sensor_type: "CMOS",
      image_format: "JPEG, RAW",
      stabilization: "5 trục trong thân máy",
      lens_mount: `${brand.toUpperCase()} Mount`,
    },
    video: {
      encoding: "H.264, H.265",
      resolution: "4K UHD, Full HD",
      microphone: "Stereo tích hợp",
      audio_format: "AAC, Linear PCM",
    },
    focus: {
      type: "Tự động & Thủ công",
      mode: "Liên tục, Đơn lẻ",
      points: "273 điểm",
    },
    viewfinder_monitor: {
      viewfinder_type: "Điện tử OLED",
      monitor_features: "Cảm ứng, Xoay lật",
      monitor_resolution: "1.44 triệu điểm",
      monitor_size: "3.0 inch",
      viewfinder_magnification: "0.78x",
      viewfinder_coverage: "100%",
      viewfinder_size: "0.5 inch",
      viewfinder_resolution: "2.36 triệu điểm",
    },
    flash: {
      built_in_flash: "Không",
      flash_mode: "Tự động, On, Off, Slow Sync",
      sync_speed: "1/200 giây",
      hot_shoe: "Có",
      flash_compensation: "-3 to +3 EV",
      external_flash_sync: "Có",
    },
    connectivity: {
      gps: "Không",
      wireless: "Wi-Fi, Bluetooth",
      jacks: "USB-C, HDMI, 3.5mm Mic",
      card_slots: "2 x SD (UHS-II)",
    },
    other: {
      battery: "NP-FZ100 Lithium-Ion",
    },
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
  name: p.name,
  brand: p.brand || "",
  price_from: p.price_from ?? p.sale_price ?? p.selling_price ?? 0,
  compareAt: p.compareAt ?? p.original_price ?? null,
  rating: p.rating ?? 0,
  reviewCount: p.reviewCount ?? 0,
  total_stock: p.total_stock ?? 0,
  promoText: p.promoText || p.promotion || "",
  description: p.description || "",
  primaryImage: p.primaryImage || p.image || p.images?.[0] || "",
  images: p.images || [],
  variants: p.variants || [],
  specs: p.specs || {},
});

// ========================= PUBLIC API =========================

// Lấy danh sách sản phẩm
export async function getProducts({
  page = 1,
  limit = 12,
  searchTerm = "",
  brands = [],
  minPrice,
  maxPrice,
  sort,
} = {}) {
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

    const min = Number(minPrice) || 0;
    const max = Number(maxPrice) || Infinity;
    data = data.filter((p) => p.price_from >= min && p.price_from <= max);

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

  // === API thật ===
  const res = await api.get("/products", {
    params: {
      page,
      limit,
      search: searchTerm,
      brands,
      minPrice,
      maxPrice,
      sort,
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
