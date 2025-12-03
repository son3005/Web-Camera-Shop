// src/api/dashboardApi.js
// =======================================================
// API Dashboard — map với backend Thống Kê
// - Stats:     GET /api/thong-ke/tong-hop
// - Doanh thu: GET /api/thong-ke/doanh-thu?nam=YYYY
// - Thương hiệu: GET /api/thong-ke/phan-bo-thuong-hieu
// - Recent orders / Top products / Activity feed: mock
// =======================================================

import apiClient from "./apiClient";

// ================== MOCK CHO PHẦN CHƯA CÓ API ==================

// Dữ liệu cho Top Products (mock)
const topProductsData = [
  {
    name: "Sony A7 IV Camera",
    sale: 320,
    revenue: "$799,000",
    trend: "up",
    change: "+12.5%",
  },
  {
    name: "Canon EOS R6",
    sale: 280,
    revenue: "$530,000",
    trend: "down",
    change: "-5.2%",
  },
  {
    name: "Fujifilm X-T5",
    sale: 210,
    revenue: "$356,000",
    trend: "up",
    change: "+8.1%",
  },
  {
    name: "DJI Mini 3 Pro Drone",
    sale: 150,
    revenue: "$224,500",
    trend: "up",
    change: "+15.3%",
  },
  {
    name: "GoPro Hero 12",
    sale: 190,
    revenue: "$142,000",
    trend: "down",
    change: "-3.7%",
  },
];

// Dữ liệu gốc cho tất cả đơn hàng (Recent Orders) — mock
const allOrdersData = [
  {
    id: "#1001",
    customer: "Nguyen Van A",
    product: "Sony A7 IV Camera",
    amount: "$2,499",
    status: "completed",
    date: "2025-09-01",
  },
  {
    id: "#1002",
    customer: "Tran Thi B",
    product: "Canon EOS R6",
    amount: "$1,899",
    status: "pending",
    date: "2025-09-02",
  },
  {
    id: "#1003",
    customer: "Le Van C",
    product: "Fujifilm X-T5",
    amount: "$1,699",
    status: "processing",
    date: "2025-09-03",
  },
  {
    id: "#1004",
    customer: "Pham Thi D",
    product: "Sony ZV-E10",
    amount: "$799",
    status: "cancelled",
    date: "2025-09-03",
  },
  {
    id: "#1005",
    customer: "Hoang Van E",
    product: "Nikon Z6 II",
    amount: "$1,599",
    status: "completed",
    date: "2025-09-04",
  },
  {
    id: "#1006",
    customer: "Do Thi F",
    product: "Canon M50 Mark II",
    amount: "$699",
    status: "pending",
    date: "2025-09-04",
  },
  {
    id: "#1007",
    customer: "Vu Van G",
    product: "GoPro Hero 12",
    amount: "$499",
    status: "completed",
    date: "2025-09-05",
  },
  {
    id: "#1008",
    customer: "Nguyen Thi H",
    product: "DJI Mini 3 Pro Drone",
    amount: "$999",
    status: "processing",
    date: "2025-09-06",
  },
  {
    id: "#1009",
    customer: "Pham Van I",
    product: "Sony FE 24-70mm Lens",
    amount: "$1,199",
    status: "completed",
    date: "2025-09-06",
  },
  {
    id: "#1010",
    customer: "Tran Thi J",
    product: "Canon RF 50mm Lens",
    amount: "$399",
    status: "cancelled",
    date: "2025-09-07",
  },
  {
    id: "#1011",
    customer: "Test User",
    product: "Extra Product",
    amount: "$250",
    status: "pending",
    date: "2025-09-07",
  },
  {
    id: "#1012",
    customer: "Another User",
    product: "Extra Product 2",
    amount: "$350",
    status: "completed",
    date: "2025-09-07",
  },
];

// Dữ liệu gốc cho tất cả hoạt động (Activity Feed) — mock
const allActivitiesData = [
  {
    id: 1,
    type: "order",
    icon: "ShoppingCart",
    title: "New Order",
    description: "Nguyen Van A placed a new order (#1001).",
    time: "2 minutes ago",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/40",
  },
  {
    id: 2,
    type: "user",
    icon: "UserPlus",
    title: "New Customer",
    description: "Tran Thi B just signed up.",
    time: "5 minutes ago",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    id: 3,
    type: "shipping",
    icon: "Truck",
    title: "Order Shipped",
    description: "Order #1002 has been shipped.",
    time: "10 minutes ago",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/40",
  },
  {
    id: 4,
    type: "payment",
    icon: "CreditCard",
    title: "Payment Received",
    description: "You received $250 from Le Van C.",
    time: "20 minutes ago",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    id: 5,
    type: "cancel",
    icon: "XCircle",
    title: "Order Cancelled",
    description: "Pham Thi D cancelled order #1003.",
    time: "30 minutes ago",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/40",
  },
  {
    id: 6,
    type: "review",
    icon: "Star",
    title: "New Review",
    description: "Hoang Van E rated a product 5 stars.",
    time: "1 hour ago",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
  },
  {
    id: 7,
    type: "message",
    icon: "MessageSquare",
    title: "New Message",
    description: "You have a new support request from Do Thi F.",
    time: "2 hours ago",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/40",
  },
  {
    id: 8,
    type: "update",
    icon: "Settings",
    title: "System Update",
    description: "Your system was updated successfully.",
    time: "3 hours ago",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800/40",
  },
  {
    id: 9,
    type: "package",
    icon: "Package",
    title: "Package Delivered",
    description: "Order #1004 has been delivered.",
    time: "5 hours ago",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/40",
  },
  {
    id: 10,
    type: "success",
    icon: "CheckCircle2",
    title: "Task Completed",
    description: "Your daily sales report has been generated.",
    time: "1 day ago",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
  },
];

const simulateDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ================== 1. THỐNG KÊ TỔNG HỢP ==================
export const fetchDashboardStats = async () => {
  const res = await apiClient.get("/thong-ke/tong-hop");
  const body = res.data || {};
  const d = body.data || body.thong_ke || body;

  const doanhThu = Number(d.doanh_thu_thang_nay || 0);
  const donHang = Number(d.don_hang_thang_nay || 0);
  const userMoi = Number(d.nguoi_dung_moi_thang_nay || 0);
  const tongUser = Number(d.tong_so_tai_khoan || 0);

  return [
    {
      title: "Doanh thu tháng này",
      value: doanhThu.toLocaleString("vi-VN") + "₫",
      change: "+0%",
      trend: "up",
      icon: "DollarSign",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Đơn hàng trong tháng",
      value: donHang.toLocaleString("vi-VN"),
      change: "+0%",
      trend: "up",
      icon: "LucideShoppingCart",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Người dùng mới",
      value: userMoi.toLocaleString("vi-VN"),
      change: "+0%",
      trend: "up",
      icon: "Users",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Tổng số tài khoản",
      value: tongUser.toLocaleString("vi-VN"),
      change: "+0%",
      trend: "up",
      icon: "LucideEye",
      color: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
    },
  ];
};

// ================== 2. BIỂU ĐỒ DOANH THU ==================
export const fetchRevenueChartData = async () => {
  const nam = new Date().getFullYear();
  const res = await apiClient.get("/thong-ke/doanh-thu", {
    params: { nam },
  });
  const body = res.data || {};
  const arr = body.data || body.thong_ke || [];

  return arr.map((item) => {
    const thang = item.thang ?? null;
    const label = thang ? `T${thang}` : String(item.nam || "");
    const tongDoanhThu = Number(item.tong_doanh_thu || 0);
    const loiNhuan = Number(item.loi_nhuan || 0);

    return {
      month: label,
      revenue: tongDoanhThu,
      // Giả định "expenses" = doanh thu - lợi nhuận (nếu âm thì 0)
      expenses: Math.max(tongDoanhThu - loiNhuan, 0),
    };
  });
};

// ================== 3. BIỂU ĐỒ TRÒN THƯƠNG HIỆU ==================
const BRAND_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export const fetchSaleChartData = async () => {
  const res = await apiClient.get("/thong-ke/phan-bo-thuong-hieu");
  const body = res.data || {};
  const arr = body.data || body.thong_ke || body.thuong_hieu || [];

  const total = arr.reduce(
    (sum, item) => sum + Number(item.so_luong_san_pham || 0),
    0
  );

  if (!total) {
    // fallback rỗng
    return [];
  }

  return arr.map((item, idx) => {
    const count = Number(item.so_luong_san_pham || 0);
    const percent = Math.round((count * 100) / total);
    return {
      name: item.ten_thuong_hieu || "Khác",
      value: percent,
      color: BRAND_COLORS[idx % BRAND_COLORS.length],
    };
  });
};

// ================== 4. TOP PRODUCTS (mock) ==================
export const fetchTopProducts = async () => {
  await simulateDelay(500);
  return topProductsData;
};

// ================== 5. RECENT ORDERS (mock, có phân trang) ==================
export const fetchPaginatedOrders = async ({ page = 1, limit = 10 }) => {
  await simulateDelay(400);

  const start = (page - 1) * limit;
  const end = page * limit;
  const paginatedData = allOrdersData.slice(start, end);

  return {
    orders: paginatedData,
    totalPages: Math.ceil(allOrdersData.length / limit),
  };
};

// ================== 6. ACTIVITY FEED (mock, có phân trang) ==================
export const fetchPaginatedActivities = async ({ page = 1, limit = 6 }) => {
  await simulateDelay(400);

  const start = (page - 1) * limit;
  const end = page * limit;
  const paginatedData = allActivitiesData.slice(start, end);

  return {
    activities: paginatedData,
    totalPages: Math.ceil(allActivitiesData.length / limit),
  };
};
