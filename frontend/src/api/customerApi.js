// src/api/customerApi.js
// ✅ Mock API KHÔNG cần faker, khớp tên hàm với components hiện tại

export const USE_MOCK_CUSTOMER_API = true;

// ---------------- Helpers ----------------
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const toDateStr = (d) => new Date(d).toISOString().slice(0, 10);
const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

const BRANDS = ["Sony", "Canon", "Nikon", "Fujifilm", "Panasonic", "Leica"];
const FIRST_NAMES = [
  "Linh",
  "Hà",
  "Minh",
  "Phúc",
  "Dũng",
  "Oanh",
  "Giang",
  "An",
  "Tú",
  "Ngọc",
];
const LAST_NAMES = [
  "Trần",
  "Nguyễn",
  "Lê",
  "Võ",
  "Phan",
  "Hoàng",
  "Đặng",
  "Đỗ",
  "Huỳnh",
  "Bùi",
];
const CITIES = [
  "Cần Thơ",
  "Hà Nội",
  "Đà Nẵng",
  "TP.HCM",
  "Hải Phòng",
  "Nha Trang",
];

// ---------------- Generate Mock ----------------
// Giảm độ "ảo": số đơn 0..5; mỗi đơn 300k..4m
const CUSTOMERS = Array.from({ length: 150 }, (_, i) => {
  const first = FIRST_NAMES[randInt(0, FIRST_NAMES.length - 1)];
  const last = LAST_NAMES[randInt(0, LAST_NAMES.length - 1)];
  const fullName = `${last} ${first}`;

  const id = `C${String(i + 1).padStart(5, "0")}`;
  const createdAt = new Date(Date.now() - randInt(5, 150) * 86400000);

  const orderCount = randInt(0, 5);
  let totalSpend = 0;
  for (let j = 0; j < orderCount; j++)
    totalSpend += randInt(300_000, 4_000_000);

  const statusPool = ["Active", "Returning", "Blocked"];
  const status =
    orderCount === 0 ? "Active" : statusPool[randInt(0, statusPool.length - 1)];
  const isVip = totalSpend >= 30_000_000;

  // Sản phẩm đã mua (gộp theo sản phẩm)
  const itemsLen = randInt(0, Math.min(3, orderCount));
  const productsBought = Array.from({ length: itemsLen }).map((_, j) => {
    const brand = BRANDS[randInt(0, BRANDS.length - 1)];
    const price = randInt(1_000_000, 6_000_000);
    const qty = randInt(1, 3);
    return {
      id: `${id}-PB${j + 1}`,
      name: `${brand} XM-${100 + randInt(0, 80)}`,
      image: `https://picsum.photos/seed/${brand}-${i}-${j}/140/140`,
      price,
      totalQuantity: qty,
      totalSpend: qty * price,
    };
  });

  const lastPurchase =
    orderCount > 0 ? toDateStr(Date.now() - randInt(1, 60) * 86400000) : null;
  const averageOrderValue =
    orderCount > 0 ? Math.round(totalSpend / orderCount) : 0;

  return {
    id,
    code: `#${id}`,
    name: fullName,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`,
    phone: "0" + randInt(900000000, 999999999),
    createdAt: toDateStr(createdAt),
    avatar: `https://i.pravatar.cc/100?img=${(i % 70) + 1}`,
    address: `${randInt(10, 200)} Đường ${randInt(1, 99)}, ${
      CITIES[randInt(0, CITIES.length - 1)]
    }`,
    note: "Khách hàng thân thiết.",
    status,
    isVip,

    orderCount,
    totalSpend,

    // Cho modal:
    lastPurchase,
    averageOrderValue,
    productsBought,
  };
});

// ---------------- Stats ----------------
function buildStats(list = CUSTOMERS) {
  const total = list.length;
  const active = list.filter((c) => c.status === "Active").length;
  const blocked = list.filter((c) => c.status === "Blocked").length;
  const vip = list.filter((c) => c.isVip).length;
  const totalSpend = list.reduce((s, c) => s + (c.totalSpend || 0), 0);
  return { total, active, blocked, vip, totalSpend };
}

// ---------------- API ----------------
export async function getCustomers({
  page = 1,
  limit = 10,
  q = "",
  statuses = [],
  priceSort = "default",
  dateSort = "default",
  priceRange = { min: "", max: "" },
  dateRange = { start: "", end: "" },
} = {}) {
  if (!USE_MOCK_CUSTOMER_API) throw new Error("Chưa kết nối backend thật");
  await delay(200);

  let data = [...CUSTOMERS];

  // Search
  if (q) {
    const k = q.toLowerCase();
    data = data.filter(
      (c) =>
        c.name.toLowerCase().includes(k) ||
        c.email.toLowerCase().includes(k) ||
        c.phone.includes(k) ||
        c.code.toLowerCase().includes(k)
    );
  }

  // Filter: statuses
  if (Array.isArray(statuses) && statuses.length > 0) {
    const set = new Set(statuses);
    data = data.filter((c) => set.has(c.status));
  }

  // Filter: price range (totalSpend)
  const minP = Number(priceRange?.min || "");
  const maxP = Number(priceRange?.max || "");
  if (!Number.isNaN(minP))
    data = data.filter((c) => c.totalSpend >= (minP || 0));
  if (!Number.isNaN(maxP) && maxP > 0)
    data = data.filter((c) => c.totalSpend <= maxP);

  // Filter: date range (createdAt)
  const start = dateRange?.start ? new Date(dateRange.start) : null;
  const end = dateRange?.end ? new Date(dateRange.end) : null;
  if (start) data = data.filter((c) => new Date(c.createdAt) >= start);
  if (end) data = data.filter((c) => new Date(c.createdAt) <= end);

  // Sorts
  if (dateSort === "asc" || dateSort === "desc") {
    data.sort((a, b) =>
      dateSort === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
  if (priceSort === "asc" || priceSort === "desc") {
    data.sort((a, b) =>
      priceSort === "asc"
        ? a.totalSpend - b.totalSpend
        : b.totalSpend - a.totalSpend
    );
  }

  const totalCount = data.length;
  const startIdx = (page - 1) * limit;
  const items = data.slice(startIdx, startIdx + limit);

  return { data: items, totalCount, stats: buildStats(data) };
}

export async function getCustomerById(id) {
  await delay(150);
  const found = CUSTOMERS.find((c) => c.id === id || c.code === id);
  if (!found) throw new Error("Không tìm thấy khách hàng");
  return found;
}

// API kiểu toggle (giữ lại cho nơi khác có thể dùng)
export async function toggleLockCustomer(id, lock = true) {
  await delay(120);
  const idx = CUSTOMERS.findIndex((c) => c.id === id);
  if (idx >= 0) CUSTOMERS[idx].status = lock ? "Blocked" : "Active";
  return { success: true, status: CUSTOMERS[idx]?.status || "Active" };
}

// API đúng chữ ký mà components đang gọi
export async function updateCustomerStatus({ customerId, status }) {
  await delay(120);
  const c = CUSTOMERS.find((x) => x.id === customerId);
  if (!c) throw new Error("Không tìm thấy khách hàng");
  c.status = status;
  return { success: true, status: c.status };
}

// Aliases để KHÔNG phải đổi code ở component
export { getCustomers as fetchCustomers };
export { getCustomerById as fetchCustomerById };

// Xuất formatter nếu cần dùng ở chỗ khác
export const formatVND = vnd;
