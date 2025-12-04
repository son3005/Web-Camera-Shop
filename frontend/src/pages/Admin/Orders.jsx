// src/pages/Admin/Orders.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  layDanhSachDonHangAdmin,
  capNhatTrangThaiDonHangAdmin,
  capNhatTrangThaiThanhToanAdmin,
} from "../../api/adminDonHangApi";

import { Filter, RefreshCw, Search, X, Truck, CreditCard } from "lucide-react";

const fmtVND = (n) =>
  Number(n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫";

const fmtDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "");

// Map trạng thái đơn hàng -> label + màu chữ (không dùng nền)
const ORDER_STATUS_MAP = {
  cho_xac_nhan: {
    label: "Chờ xác nhận",
    className: "text-amber-600",
  },
  da_xac_nhan: {
    label: "Đã xác nhận",
    className: "text-sky-600",
  },
  dang_giao: {
    label: "Đang giao",
    className: "text-blue-600",
  },
  da_giao: {
    label: "Đã giao",
    className: "text-emerald-600",
  },
  da_huy: {
    label: "Đã hủy",
    className: "text-red-600",
  },
  yeu_cau_doi_tra: {
    label: "Yêu cầu đổi trả",
    className: "text-purple-600",
  },
  chap_nhan_doi_tra: {
    label: "Chấp nhận đổi trả",
    className: "text-emerald-600",
  },
  tu_choi_doi_tra: {
    label: "Từ chối đổi trả",
    className: "text-red-600",
  },
  da_hoan_tien: {
    label: "Đã hoàn tiền",
    className: "text-slate-600",
  },
};

// Map trạng thái thanh toán -> label + màu chữ (không dùng nền)
const PAYMENT_STATUS_MAP = {
  cho_thanh_toan: {
    label: "Chờ thanh toán",
    className: "text-amber-600",
  },
  da_thanh_toan: {
    label: "Đã thanh toán",
    className: "text-emerald-600",
  },
  that_bai: {
    label: "Thanh toán thất bại",
    className: "text-red-600",
  },
  da_hoan_tien: {
    label: "Đã hoàn tiền",
    className: "text-slate-600",
  },
};

const PAYMENT_METHOD_MAP = {
  cod: "COD",
  payos_qr: "PayOS QR",
  vnpay_qr: "VNPay QR",
  vnpay_ewallet: "VNPay eWallet",
  khac: "Khác",
};

// Flow chuyển trạng thái giống backend
const ORDER_STATUS_FLOW = {
  cho_xac_nhan: ["da_xac_nhan", "da_huy"],
  da_xac_nhan: ["dang_giao", "da_huy"],
  dang_giao: ["da_giao"],
  da_giao: ["yeu_cau_doi_tra"],
  da_huy: [],
  yeu_cau_doi_tra: ["chap_nhan_doi_tra", "tu_choi_doi_tra"],
  chap_nhan_doi_tra: ["da_hoan_tien"],
  tu_choi_doi_tra: [],
};

const NECESSARY_REASON_STATUS = new Set([
  "da_huy",
  "chap_nhan_doi_tra",
  "tu_choi_doi_tra",
]);

// ======================= COMPONENT CHÍNH =======================
export default function Orders() {
  const queryClient = useQueryClient();

  // Bộ lọc list đơn
  const [filters, setFilters] = useState({
    trang_thai: "",
    phuong_thuc_thanh_toan: "",
    tu_ngay: "",
    den_ngay: "",
    sap_xep_theo: "ngay_tao",
    thu_tu: "desc",
    search: "",
  });

  // Phân trang client-side
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Đơn đang được chọn để xem chi tiết
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form cập nhật trạng thái đơn
  const [statusForm, setStatusForm] = useState({
    trang_thai: "",
    ly_do: "",
  });

  // Form cập nhật trạng thái thanh toán
  const [paymentForm, setPaymentForm] = useState({
    trang_thai_thanh_toan: "da_thanh_toan",
  });

  // Theo dõi "đơn mới" so với lần load đầu tiên
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const [newCount, setNewCount] = useState(0);

  // ======================= FETCH LIST =======================
  const {
    data: orders,
    isLoading,
    refetch,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-orders", filters],
    queryFn: async () => {
      const params = { ...filters };

      // Chuẩn hoá khoảng ngày -> gửi kèm time cho backend
      if (params.tu_ngay) {
        params.tu_ngay = `${params.tu_ngay}T00:00:00`;
      } else {
        delete params.tu_ngay;
      }
      if (params.den_ngay) {
        params.den_ngay = `${params.den_ngay}T23:59:59`;
      } else {
        delete params.den_ngay;
      }

      if (!params.trang_thai) delete params.trang_thai;
      if (!params.phuong_thuc_thanh_toan) delete params.phuong_thuc_thanh_toan;

      const list = await layDanhSachDonHangAdmin(params);

      if (Array.isArray(list)) return list;
      if (Array.isArray(list?.data)) return list.data;

      return [];
    },
  });

  // Theo dõi số đơn mới (dựa theo length mảng orders)
  useEffect(() => {
    if (!orders) return;
    const count = orders.length;

    if (!hasInitialLoaded) {
      setHasInitialLoaded(true);
      setLastSeenCount(count);
      setNewCount(0);
      return;
    }

    if (count > lastSeenCount) {
      setNewCount(count - lastSeenCount);
    }
  }, [orders, hasInitialLoaded, lastSeenCount]);

  // Lọc client-side theo ô search
  const filteredOrders = useMemo(() => {
    if (!filters.search) return orders || [];
    const q = filters.search.toLowerCase();
    return (orders || []).filter((o) => {
      return (
        o.ma_don_hang?.toLowerCase().includes(q) ||
        o.ten_nguoi_nhan?.toLowerCase().includes(q) ||
        o.so_dien_thoai_nguoi_nhan?.toLowerCase().includes(q)
      );
    });
  }, [orders, filters.search]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage) || 1);

  // Cắt danh sách theo trang hiện tại
  const paginatedOrders = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, page, perPage]);

  // Nếu số đơn thay đổi mà trang hiện tại vượt quá tổng trang -> lùi về trang cuối
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  // ======================= MUTATIONS =======================
  const updateStatusMutation = useMutation({
    mutationFn: capNhatTrangThaiDonHangAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      alert("Cập nhật trạng thái đơn hàng thành công!");
    },
    onError: (err) => {
      alert(
        err?.response?.data?.msg ||
          err?.message ||
          "Lỗi cập nhật trạng thái đơn hàng"
      );
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: capNhatTrangThaiThanhToanAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      alert("Cập nhật trạng thái thanh toán thành công!");
    },
    onError: (err) => {
      alert(
        err?.response?.data?.msg ||
          err?.message ||
          "Lỗi cập nhật trạng thái thanh toán"
      );
    },
  });

  // ======================= HANDLERS =======================
  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setStatusForm({
      trang_thai: "",
      ly_do: "",
    });
    setPaymentForm({
      trang_thai_thanh_toan: "da_thanh_toan",
    });
  };

  const handleChangeFilters = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // đổi filter -> quay lại trang 1
  };

  const handleSubmitUpdateStatus = () => {
    if (!selectedOrder) return;
    if (!statusForm.trang_thai) {
      alert("Vui lòng chọn trạng thái mới");
      return;
    }

    if (
      NECESSARY_REASON_STATUS.has(statusForm.trang_thai) &&
      !statusForm.ly_do
    ) {
      alert("Vui lòng nhập lý do cho trạng thái này");
      return;
    }

    updateStatusMutation.mutate({
      id: selectedOrder.id,
      trang_thai: statusForm.trang_thai,
      ly_do: statusForm.ly_do,
    });
  };

  const handleSubmitUpdatePayment = () => {
    if (!selectedOrder) return;
    if (!paymentForm.trang_thai_thanh_toan) {
      alert("Vui lòng chọn trạng thái thanh toán");
      return;
    }

    updatePaymentMutation.mutate({
      id: selectedOrder.id,
      trang_thai_thanh_toan: paymentForm.trang_thai_thanh_toan,
    });
  };

  // Nút “Huỷ đơn” nhanh
  const handleQuickCancel = () => {
    if (!selectedOrder) return;

    const allowed = ORDER_STATUS_FLOW[selectedOrder.trang_thai] || [];
    if (!allowed.includes("da_huy")) {
      alert("Chỉ có thể huỷ đơn ở trạng thái chờ xác nhận / đã xác nhận.");
      return;
    }

    const ly_do = prompt("Nhập lý do huỷ đơn:");
    if (!ly_do) return;

    updateStatusMutation.mutate({
      id: selectedOrder.id,
      trang_thai: "da_huy",
      ly_do,
    });
  };

  // Đánh dấu đã xem đơn mới
  const handleMarkNewSeen = () => {
    if (!orders) return;
    setLastSeenCount(orders.length);
    setNewCount(0);
  };

  // ======================= RENDER =======================
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">Đơn hàng</h1>
          {newCount > 0 && (
            <button
              type="button"
              onClick={handleMarkNewSeen}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs shadow-sm hover:bg-emerald-600 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              {newCount} đơn mới
            </button>
          )}
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white/90 text-sm hover:bg-emerald-50 hover:border-emerald-400 transition"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-4">
        {/* Nếu API lỗi, show ra cho dễ debug */}
        {isError && (
          <div className="rounded-2xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-700 shadow-sm">
            Lỗi khi tải danh sách đơn hàng:{" "}
            {error?.response?.data?.msg ||
              error?.message ||
              "Không rõ nguyên nhân"}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/90 border border-emerald-50 rounded-2xl shadow-md p-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                placeholder="Tìm mã đơn / tên / SĐT"
                className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white/95 text-sm w-60 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                value={filters.search}
                onChange={(e) => handleChangeFilters("search", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <Filter size={16} />
              <span className="text-xs uppercase tracking-wide">Bộ lọc</span>
            </div>

            <select
              className="ui-input text-sm max-w-[180px]"
              value={filters.trang_thai}
              onChange={(e) =>
                handleChangeFilters("trang_thai", e.target.value)
              }
            >
              <option value="">Tất cả trạng thái</option>
              <option value="cho_xac_nhan">Chờ xác nhận</option>
              <option value="da_xac_nhan">Đã xác nhận</option>
              <option value="dang_giao">Đang giao</option>
              <option value="da_giao">Đã giao</option>
              <option value="da_huy">Đã huỷ</option>
              <option value="yeu_cau_doi_tra">Yêu cầu đổi trả</option>
              <option value="chap_nhan_doi_tra">Chấp nhận đổi trả</option>
              <option value="tu_choi_do_tra">Từ chối đổi trả</option>
              <option value="da_hoan_tien">Đã hoàn tiền</option>
            </select>

            <select
              className="ui-input text-sm max-w-[160px]"
              value={filters.phuong_thuc_thanh_toan}
              onChange={(e) =>
                handleChangeFilters("phuong_thuc_thanh_toan", e.target.value)
              }
            >
              <option value="">Mọi PTTT</option>
              <option value="cod">COD</option>
              <option value="payos_qr">PayOS QR</option>
              <option value="vnpay_qr">VNPay QR</option>
              <option value="vnpay_ewallet">VNPay eWallet</option>
              <option value="khac">Khác</option>
            </select>

            <div className="flex items-center gap-2 text-xs">
              <span>Từ ngày</span>
              <input
                type="date"
                className="ui-input text-xs"
                value={filters.tu_ngay}
                onChange={(e) => handleChangeFilters("tu_ngay", e.target.value)}
              />
              <span>đến</span>
              <input
                type="date"
                className="ui-input text-xs"
                value={filters.den_ngay}
                onChange={(e) =>
                  handleChangeFilters("den_ngay", e.target.value)
                }
              />
            </div>

            <select
              className="ui-input text-xs max-w-[140px]"
              value={filters.sap_xep_theo}
              onChange={(e) =>
                handleChangeFilters("sap_xep_theo", e.target.value)
              }
            >
              <option value="ngay_tao">Sắp xếp: Ngày tạo</option>
              <option value="tong_tien">Tổng tiền</option>
            </select>

            <select
              className="ui-input text-xs max-w-[110px]"
              value={filters.thu_tu}
              onChange={(e) => handleChangeFilters("thu_tu", e.target.value)}
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Danh sách đơn */}
          <div className="col-span-12 xl:col-span-7 2xl:col-span-8">
            <div className="bg-white/90 border border-emerald-50 rounded-3xl shadow-lg overflow-hidden flex flex-col">
              {isLoading ? (
                <div className="p-6 text-center text-slate-500">
                  Đang tải danh sách đơn hàng...
                </div>
              ) : totalItems === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  Không có đơn hàng nào phù hợp.
                </div>
              ) : (
                <>
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr className="text-left">
                        <th className="px-4 py-2">Mã đơn</th>
                        <th className="px-4 py-2">Khách hàng</th>
                        <th className="px-4 py-2">Thời gian</th>
                        <th className="px-4 py-2 text-right">Tổng tiền</th>
                        <th className="px-4 py-2">Trạng thái</th>
                        <th className="px-4 py-2">Thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((o) => {
                        const statusInfo =
                          ORDER_STATUS_MAP[o.trang_thai] ||
                          ORDER_STATUS_MAP["cho_xac_nhan"];
                        const paymentStatusInfo =
                          PAYMENT_STATUS_MAP[o.thanh_toan?.trang_thai] ||
                          PAYMENT_STATUS_MAP["cho_thanh_toan"];

                        return (
                          <tr
                            key={o.id}
                            className="hover:bg-emerald-50/70 cursor-pointer border-t border-slate-100 transition-colors"
                            onClick={() => handleRowClick(o)}
                          >
                            <td className="px-4 py-2 font-mono text-xs">
                              {o.ma_don_hang}
                            </td>
                            <td className="px-4 py-2">
                              <div className="font-medium">
                                {o.ten_nguoi_nhan}
                              </div>
                              <div className="text-xs text-slate-500">
                                {o.so_dien_thoai_nguoi_nhan}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-xs text-slate-500">
                              {fmtDate(o.ngay_tao)}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold">
                              {fmtVND(o.thanh_toan?.so_tien || 0)}
                            </td>
                            <td className="px-4 py-2">
                              {/* Trạng thái đơn: chỉ chữ màu + chấm nhỏ */}
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold ${statusInfo.className}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {/* Trạng thái thanh toán: chữ màu + chấm nhỏ */}
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold ${paymentStatusInfo.className}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {paymentStatusInfo.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Footer phân trang */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/80 text-xs">
                    <div className="text-slate-600">
                      Hiển thị{" "}
                      <span className="font-semibold">
                        {totalItems === 0 ? 0 : (page - 1) * perPage + 1} –{" "}
                        {Math.min(page * perPage, totalItems)}
                      </span>{" "}
                      trên <span className="font-semibold">{totalItems}</span>{" "}
                      đơn hàng
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button
                          className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={page === 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          Trước
                        </button>
                        <span className="text-slate-600">
                          Trang <span className="font-semibold">{page}</span> /{" "}
                          {totalPages}
                        </span>
                        <button
                          className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={page === totalPages}
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                        >
                          Sau
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Hiển thị</span>
                        <select
                          className="ui-input text-xs w-18"
                          value={perPage}
                          onChange={(e) => {
                            setPerPage(Number(e.target.value) || 10);
                            setPage(1);
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span className="text-slate-500">/ trang</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Panel chi tiết */}
          <div className="col-span-12 xl:col-span-5 2xl:col-span-4">
            {selectedOrder ? (
              <div className="bg-white/90 border border-emerald-50 rounded-3xl shadow-lg h-full flex flex-col p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">
                      Đơn {selectedOrder.ma_don_hang}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Tạo lúc: {fmtDate(selectedOrder.ngay_tao)}
                    </p>
                  </div>
                  <button
                    className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto pr-1">
                  {/* Khách hàng & giao hàng */}
                  <section className="border rounded-lg p-3 border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Truck size={16} /> Thông tin giao hàng
                      </h3>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Người nhận: </span>
                        {selectedOrder.ten_nguoi_nhan} (
                        {selectedOrder.so_dien_thoai_nguoi_nhan})
                      </p>
                      <p>
                        <span className="font-medium">Địa chỉ: </span>
                        {selectedOrder.dia_chi_giao}
                      </p>
                      {selectedOrder.ghi_chu && (
                        <p>
                          <span className="font-medium">Ghi chú: </span>
                          {selectedOrder.ghi_chu}
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Items */}
                  <section className="border rounded-lg p-3 border-slate-200">
                    <h3 className="font-semibold text-sm mb-2">Sản phẩm</h3>
                    <div className="space-y-2">
                      {(selectedOrder.items || []).map((it) => (
                        <div
                          key={it.id}
                          className="flex justify-between text-sm"
                        >
                          <div>
                            <div className="font-medium">
                              {it.ten_san_pham_luc_mua}
                            </div>
                            <div className="text-xs text-slate-500">
                              {it.ten_bien_the_luc_mua} × {it.so_luong}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {fmtVND(it.don_gia_luc_mua)}
                            </div>
                            <div className="text-xs text-slate-500">
                              Tổng: {fmtVND(it.don_gia_luc_mua * it.so_luong)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 border-t pt-2 text-sm">
                      <div className="flex justify-between">
                        <span>Phí vận chuyển</span>
                        <span>{fmtVND(selectedOrder.phi_van_chuyen || 0)}</span>
                      </div>
                      <div className="flex justify-between font-semibold mt-1">
                        <span>Tổng thanh toán</span>
                        <span>
                          {fmtVND(selectedOrder.thanh_toan?.so_tien || 0)}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Thanh toán */}
                  <section className="border rounded-lg p-3 border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <CreditCard size={16} />
                        Thanh toán
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-50 border border-slate-200">
                        {PAYMENT_METHOD_MAP[
                          selectedOrder.thanh_toan?.phuong_thuc
                        ] || "Không rõ"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        Trạng thái thanh toán:
                      </span>
                      {(() => {
                        const info =
                          PAYMENT_STATUS_MAP[
                            selectedOrder.thanh_toan?.trang_thai
                          ] || PAYMENT_STATUS_MAP["cho_thanh_toan"];
                        return (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold ${info.className}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {info.label}
                          </span>
                        );
                      })()}
                    </div>

                    {selectedOrder.thanh_toan?.phuong_thuc === "cod" && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium">
                          Cập nhật trạng thái thanh toán (COD)
                        </label>
                        <div className="flex gap-2">
                          <select
                            className="ui-input text-xs"
                            value={
                              paymentForm.trang_thai_thanh_toan ||
                              "da_thanh_toan"
                            }
                            onChange={(e) =>
                              setPaymentForm((f) => ({
                                ...f,
                                trang_thai_thanh_toan: e.target.value,
                              }))
                            }
                          >
                            <option value="da_thanh_toan">Đã thanh toán</option>
                            <option value="that_bai">
                              Thanh toán thất bại
                            </option>
                          </select>
                          <button
                            className="btn-emerald text-xs px-3 hover:shadow-md transition-shadow"
                            disabled={updatePaymentMutation.isLoading}
                            onClick={handleSubmitUpdatePayment}
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Cập nhật trạng thái đơn */}
                  <section className="border rounded-lg p-3 border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">
                        Cập nhật trạng thái đơn hàng
                      </h3>
                      {(() => {
                        const info =
                          ORDER_STATUS_MAP[selectedOrder.trang_thai] ||
                          ORDER_STATUS_MAP["cho_xac_nhan"];
                        return (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold ${info.className}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {info.label}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Trạng thái mới
                      </label>
                      <select
                        className="ui-input text-sm"
                        value={statusForm.trang_thai}
                        onChange={(e) =>
                          setStatusForm((f) => ({
                            ...f,
                            trang_thai: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- Chọn trạng thái --</option>
                        {(
                          ORDER_STATUS_FLOW[selectedOrder.trang_thai] || []
                        ).map((st) => (
                          <option key={st} value={st}>
                            {ORDER_STATUS_MAP[st]?.label || st}
                          </option>
                        ))}
                      </select>

                      {NECESSARY_REASON_STATUS.has(statusForm.trang_thai) && (
                        <div>
                          <label className="text-xs font-medium">Lý do</label>
                          <textarea
                            rows={2}
                            className="ui-input text-sm"
                            value={statusForm.ly_do}
                            onChange={(e) =>
                              setStatusForm((f) => ({
                                ...f,
                                ly_do: e.target.value,
                              }))
                            }
                            placeholder="Nhập lý do cập nhật..."
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn-emerald text-sm px-4 hover:shadow-md transition-shadow"
                          disabled={updateStatusMutation.isLoading}
                          onClick={handleSubmitUpdateStatus}
                        >
                          Lưu trạng thái
                        </button>

                        <button
                          className="text-sm px-4 py-2 rounded-lg border border-red-300 text-red-600 bg-white hover:bg-red-50 hover:border-red-500 hover:shadow-sm transition-colors"
                          onClick={handleQuickCancel}
                        >
                          Huỷ đơn
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 border border-emerald-50 rounded-3xl shadow-lg h-full flex items-center justify-center text-sm text-slate-500">
                Chọn một đơn hàng ở bảng bên trái để xem chi tiết.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
