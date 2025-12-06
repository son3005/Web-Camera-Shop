// src/api/customerApi.js
// ======================================================
// API Quản lý Khách hàng (Admin)
// Map với backend /api/khach-hang theo tài liệu PDF
// ======================================================

import apiClient from "./apiClient";

// ------------------ Helper ------------------

// Backend trả enum 'trang_thai': 'kich_hoat' | 'khoa'
// Frontend đang dùng: "Active" | "Blocked"
const mapBackendStatusToLabel = (trang_thai) => {
  if (!trang_thai) return "Active";
  const v = String(trang_thai).toLowerCase();
  if (v.includes("khoa")) return "Blocked";
  // 'kich_hoat' hoặc bất kỳ giá trị nào khác coi như Active
  return "Active";
};

// ⚠️ Quan trọng: backend expect value của Enum (lowercase),
// nên ta phải gửi 'kich_hoat' / 'khoa' chứ không phải 'KICH_HOAT' / 'KHOA'
const mapLabelToBackendStatus = (status) => {
  if (!status) return null;
  const v = String(status).toLowerCase();
  if (v === "blocked") return "khoa";
  if (v === "active") return "kich_hoat";
  return null;
};

// Gom logic gọi backend tại 1 chỗ
async function fetchCustomersFromApi(params = {}) {
  const {
    page = 1,
    limit = 10,
    q = "",
    statuses = [],
    // Các filter/sort khác hiện CHƯA được backend hỗ trợ
    // nhưng vẫn nhận để không vỡ API
    priceSort,
    dateSort,
    priceRange,
    dateRange,
  } = params;

  const backendParams = {
    page,
    per_page: limit,
  };

  // Tạm thời: dùng q để tìm theo họ tên
  if (q && q.trim()) {
    backendParams.ho_ten = q.trim();
  }

  // Map filter trạng thái:
  // - Nếu chỉ chọn Active -> kich_hoat
  // - Nếu chỉ chọn Blocked -> khoa
  // - Nếu chọn cả 2 hoặc để trống thì không gửi filter trang_thai
  if (Array.isArray(statuses) && statuses.length === 1) {
    const st = mapLabelToBackendStatus(statuses[0]);
    if (st) backendParams.trang_thai = st;
  }

  const res = await apiClient.get("/khach-hang/", { params: backendParams });
  const payload = res.data;

  if (payload && payload.success === false) {
    throw new Error(payload.message || "Không thể tải danh sách khách hàng");
  }

  const list = payload?.data || [];
  const pagination = payload?.pagination || {};

  const items = list.map((u) => {
    const totalSpend = Number(u.tong_tien_da_mua || 0);
    const orderCount = Number(u.so_luong_don_hang || 0);

    return {
      id: u.id,
      ma_nguoi_dung: u.ma_nguoi_dung,
      name: u.ho_ten,
      email: u.email,
      phone: u.so_dien_thoai,
      joinedAt: u.ngay_tao,
      joinedDate: u.ngay_tao
        ? new Date(u.ngay_tao).toLocaleDateString("vi-VN")
        : "",
      statusRaw: u.trang_thai,
      status: mapBackendStatusToLabel(u.trang_thai),
      orderCount,
      totalSpend,
      avatar: null, // backend chưa có avatar
    };
  });

  const total = pagination.total ?? items.length;
  const pages = pagination.pages ?? Math.max(1, Math.ceil(total / limit));

  // Tính stats cho CustomerOverview (theo dữ liệu đang có)
  const activeCount = items.filter((c) => c.status === "Active").length;
  const blockedCount = items.filter((c) => c.status === "Blocked").length;
  const returningCount = items.filter((c) => (c.orderCount || 0) > 1).length;
  // Tạm coi VIP là khách chi >= 10 triệu (UI hiện tại đã bỏ card này,
  // nhưng vẫn giữ tính toán phòng khi dùng nơi khác)
  const vipCount = items.filter(
    (c) => (c.totalSpend || 0) >= 10_000_000
  ).length;
  const totalSpend = items.reduce(
    (sum, c) => sum + Number(c.totalSpend || 0),
    0
  );

  const stats = {
    total,
    active: activeCount,
    returning: returningCount,
    blocked: blockedCount,
    vip: vipCount,
    totalSpend,
  };

  return {
    items,
    total,
    pages,
    stats,
  };
}

// ======================================================
// 1) getCustomers — dùng cho trang /admin/customers
//    Trả về: { data, totalCount, stats }
// ======================================================
export async function getCustomers(params) {
  const { items, total, pages, stats } = await fetchCustomersFromApi(params);
  return {
    data: items,
    totalCount: total,
    totalPages: pages,
    stats,
  };
}

// ======================================================
// 2) fetchCustomers — cho CustomerTable cũ
//    Trả về: { items, total, totalPages }
// ======================================================
export async function fetchCustomers(params) {
  const { items, total, pages } = await fetchCustomersFromApi(params);
  return {
    items,
    total,
    totalPages: pages,
  };
}

// ======================================================
// 3) Lấy chi tiết 1 khách hàng (GET /api/khach-hang/{id})
// ======================================================
export async function fetchCustomerById(customerId) {
  if (!customerId) throw new Error("Thiếu customerId");

  const res = await apiClient.get(`/khach-hang/${customerId}`);
  const payload = res.data;

  if (!payload?.success) {
    throw new Error(payload?.message || "Không thể tải chi tiết khách hàng");
  }

  const d = payload.data || {};
  const basic = d.thong_tin_co_ban || {};
  const tk = d.thong_ke || {};
  const diaChiList = d.dia_chi || [];
  const recentOrders = d.don_hang_gan_day || [];

  // Lấy địa chỉ mặc định (hoặc địa chỉ đầu tiên)
  const defaultAddr =
    diaChiList.find((dc) => dc.mac_dinh || dc.la_mac_dinh) || diaChiList[0];

  const address = defaultAddr
    ? [
        defaultAddr.dia_chi_cu_the,
        defaultAddr.phuong_xa,
        defaultAddr.tinh_thanh,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const orderCount = Number(tk.so_luong_don_hang || 0);
  const totalSpend = Number(tk.tong_tien_da_mua || 0);

  // Gom sản phẩm đã mua từ 5 đơn gần nhất
  const productMap = new Map();

  for (const dh of recentOrders) {
    const items = dh.chi_tiet_don_hang || [];
    for (const it of items) {
      const key = it.ten_san_pham_luc_mua || `SP-${it.id}`;
      const price = Number(it.don_gia_luc_mua || 0);
      const qty = Number(it.so_luong || 0);
      const total = price * qty;

      if (!productMap.has(key)) {
        productMap.set(key, {
          id: key,
          name: key,
          price,
          totalQuantity: qty,
          totalSpend: total,
          image: null, // backend chưa có ảnh tại đây
        });
      } else {
        const cur = productMap.get(key);
        cur.totalQuantity += qty;
        cur.totalSpend += total;
      }
    }
  }

  const productsBought = Array.from(productMap.values()).sort(
    (a, b) => b.totalSpend - a.totalSpend
  );

  const firstOrder = recentOrders[0];
  const lastPurchase = firstOrder?.ngay_tao
    ? new Date(firstOrder.ngay_tao).toLocaleString("vi-VN")
    : "";

  return {
    id: basic.id,
    code: basic.ma_nguoi_dung,
    name: basic.ho_ten,
    email: basic.email,
    phone: basic.so_dien_thoai,
    statusRaw: basic.trang_thai,
    status: mapBackendStatusToLabel(basic.trang_thai),
    createdAt: basic.ngay_tao
      ? new Date(basic.ngay_tao).toLocaleString("vi-VN")
      : "",
    lastPurchase,
    address,
    orderCount,
    totalSpend,
    averageOrderValue: orderCount > 0 ? totalSpend / orderCount : 0,
    productsBought,
    avatar: null,
    // giữ raw phòng khi cần thêm sau
    raw: d,
  };
}

// ======================================================
// 4) Cập nhật trạng thái khách hàng
//    PATCH /api/khach-hang/{id}/trang-thai
//    body: { trang_thai: "kich_hoat" | "khoa" }
// ======================================================
export async function updateCustomerStatus({ customerId, status }) {
  if (!customerId) throw new Error("Thiếu customerId");
  const backendStatus = mapLabelToBackendStatus(status);

  if (!backendStatus) {
    throw new Error("Trạng thái không hợp lệ");
  }

  const res = await apiClient.patch(`/khach-hang/${customerId}/trang-thai`, {
    trang_thai: backendStatus,
  });

  const payload = res.data;
  if (!payload?.success) {
    throw new Error(payload?.message || "Cập nhật trạng thái thất bại");
  }

  return payload.data; // NguoiDungResponse (nếu cần dùng thêm)
}
