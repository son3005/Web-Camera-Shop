// src/api/dashboardApi.js

// --- DỮ LIỆU MOCK TẬP TRUNG ---

// Dữ liệu cho StatsGrid (Thống kê)
const statsData = [
  {
    title: "Total Revenue",
    value: "$124.563",
    change: "+12.5%",
    trend: "up",
    icon: "DollarSign",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Active Users",
    value: "8,549",
    change: "+9.2%",
    trend: "up",
    icon: "Users",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Total Orders",
    value: "2,847",
    change: "+15.3%",
    trend: "up",
    icon: "LucideShoppingCart",
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Page Views",
    value: "35,928",
    change: "-3.8%",
    trend: "down",
    icon: "LucideEye",
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-600 dark:text-orange-400",
  },
];

// Dữ liệu cho RevenueChart (Biểu đồ doanh thu)
const revenueChartData = [
  { month: "Jan", revenue: 45000, expenses: 32000 },
  { month: "Feb", revenue: 52000, expenses: 38000 },
  { month: "Mar", revenue: 48000, expenses: 35000 },
  { month: "Apr", revenue: 61000, expenses: 42000 },
  { month: "May", revenue: 55000, expenses: 40000 },
  { month: "Jun", revenue: 67000, expenses: 45000 },
  { month: "Jul", revenue: 72000, expenses: 48000 },
  { month: "Sep", revenue: 69000, expenses: 46000 },
  { month: "Oct", revenue: 78000, expenses: 52000 },
  { month: "Nov", revenue: 82000, expenses: 50000 },
  { month: "Dec", revenue: 89000, expenses: 56000 },
];

// Dữ liệu cho SaleChart (Biểu đồ tròn)
const saleChartData = [
  { name: "Sony", value: 45, color: "#3b82f6" },
  { name: "Canon", value: 30, color: "#8b5cf6" },
  { name: "Fujifilm", value: 15, color: "#10b981" },
  { name: "Other", value: 10, color: "#f59e0b" },
];

// Dữ liệu cho Top Products
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
  {
    name: "GoPro Hero 12",
    sale: 190,
    revenue: "$142,000",
    trend: "down",
    change: "-3.7%",
  },
  {
    name: "GoPro Hero 12",
    sale: 190,
    revenue: "$142,000",
    trend: "down",
    change: "-3.7%",
  },
  {
    name: "GoPro Hero 12",
    sale: 190,
    revenue: "$142,000",
    trend: "down",
    change: "-3.7%",
  },
  {
    name: "GoPro Hero 12",
    sale: 190,
    revenue: "$142,000",
    trend: "down",
    change: "-3.7%",
  },
];

// Dữ liệu gốc cho tất cả đơn hàng (Recent Orders)
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

// Dữ liệu gốc cho tất cả hoạt động (Activity Feed)
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

// --- HÀM GIẢ LẬP API ---

// Hàm helper để giả lập độ trễ mạng
const simulateDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// API cho các ô thống kê
export const fetchDashboardStats = async () => {
  await simulateDelay(500);
  return statsData;
};

// API cho biểu đồ doanh thu
export const fetchRevenueChartData = async () => {
  await simulateDelay(1200);
  return revenueChartData;
};

// API cho biểu đồ tròn
export const fetchSaleChartData = async () => {
  await simulateDelay(800);
  return saleChartData;
};

// API cho bảng Top Products (thường không cần phân trang)
export const fetchTopProducts = async () => {
  await simulateDelay(1100);
  return topProductsData;
};

/**
 * API lấy danh sách đơn hàng CÓ PHÂN TRANG.
 * @param {object} params - Tham số cho API.
 * @param {number} params.page - Số trang hiện tại.
 * @param {number} params.limit - Số lượng item trên mỗi trang.
 * @returns {Promise<object>} - Trả về object chứa danh sách đơn hàng và tổng số trang.
 */
export const fetchPaginatedOrders = async ({ page = 1, limit = 10 }) => {
  await simulateDelay(900);

  // Logic phân trang: Cắt mảng dữ liệu lớn để trả về đúng trang
  const start = (page - 1) * limit;
  const end = page * limit;
  const paginatedData = allOrdersData.slice(start, end);

  // Trả về dữ liệu của trang hiện tại và tổng số trang
  return {
    orders: paginatedData,
    totalPages: Math.ceil(allOrdersData.length / limit),
  };
};

/**
 * API lấy danh sách hoạt động CÓ PHÂN TRANG.
 * @param {object} params - Tham số cho API.
 * @param {number} params.page - Số trang hiện tại.
 * @param {number} params.limit - Số lượng item trên mỗi trang.
 * @returns {Promise<object>} - Trả về object chứa danh sách hoạt động và tổng số trang.
 */
export const fetchPaginatedActivities = async ({ page = 1, limit = 6 }) => {
  await simulateDelay(800);

  // Logic phân trang
  const start = (page - 1) * limit;
  const end = page * limit;
  const paginatedData = allActivitiesData.slice(start, end);

  // Trả về dữ liệu và tổng số trang
  return {
    activities: paginatedData,
    totalPages: Math.ceil(allActivitiesData.length / limit),
  };
};
