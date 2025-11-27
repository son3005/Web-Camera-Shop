// src/pages/Admin/Orders.jsx
import React, { useMemo, useState } from "react";
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

// Map trạng thái đơn hàng -> label + màu
const ORDER_STATUS_MAP = {
  cho_xac_nhan: {
    label: "Chờ xác nhận",
    className: "bg-amber-100 text-amber-700",
  },
  da_xac_nhan: {
    label: "Đã xác nhận",
    className: "bg-sky-100 text-sky-700",
  },
  dang_giao: {
    label: "Đang giao",
    className: "bg-blue-100 text-blue-700",
  },
  da_giao: {
    label: "Đã giao",
    className: "bg-emerald-100 text-emerald-700",
  },
  da_huy: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-700",
  },
  yeu_cau_doi_tra: {
    label: "Yêu cầu đổi trả",
    className: "bg-violet-100 text-violet-700",
  },
  chap_nhan_doi_tra: {
    label: "Chấp nhận đổi trả",
    className: "bg-emerald-100 text-emerald-700",
  },
  tu_choi_doi_tra: {
    label: "Từ chối đổi trả",
    className: "bg-red-100 text-red-700",
  },
  da_hoan_tien: {
    label: "Đã hoàn tiền",
    className: "bg-slate-200 text-slate-700",
  },
};

const PAYMENT_STATUS_MAP = {
  cho_thanh_toan: {
    label: "Chờ thanh toán",
    className: "bg-amber-100 text-amber-700",
  },
  da_thanh_toan: {
    label: "Đã thanh toán",
    className: "bg-emerald-100 text-emerald-700",
  },
  that_bai: {
    label: "Thanh toán thất bại",
    className: "bg-red-100 text-red-700",
  },
  da_hoan_tien: {
    label: "Đã hoàn tiền",
    className: "bg-slate-200 text-slate-700",
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

  // Filter state
  const [filters, setFilters] = useState({
    trang_thai: "",
    phuong_thuc_thanh_toan: "",
    tu_ngay: "",
    den_ngay: "",
    sap_xep_theo: "ngay_tao",
    thu_tu: "desc",
    search: "",
  });

  // Đơn được chọn để xem chi tiết
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Local state cho cập nhật trạng thái
  const [statusForm, setStatusForm] = useState({
    trang_thai: "",
    ly_do: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    trang_thai_thanh_toan: "da_thanh_toan",
  });

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

  // 🔴 Nút “Huỷ đơn” mới: gọi luôn API cập nhật trạng thái = "da_huy"
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

  // ======================= RENDER =======================
  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Đơn hàng
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý toàn bộ đơn hàng trong hệ thống
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Nếu API lỗi, show ra cho dễ debug */}
      {isError && (
        <div className="surface-panel p-3 text-sm text-red-600">
          Lỗi khi tải danh sách đơn hàng:{" "}
          {error?.response?.data?.msg ||
            error?.message ||
            "Không rõ nguyên nhân"}
        </div>
      )}

      {/* Filters */}
      <div className="surface-panel p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Tìm mã đơn / tên / SĐT"
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm w-60 dark:bg-slate-900 dark:border-slate-700"
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
            onChange={(e) => handleChangeFilters("trang_thai", e.target.value)}
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
              onChange={(e) => handleChangeFilters("den_ngay", e.target.value)}
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
          <div className="surface-panel overflow-hidden">
            {isLoading ? (
              <div className="p-6 text-center text-slate-500">
                Đang tải danh sách đơn hàng...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                Không có đơn hàng nào phù hợp.
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800">
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
                  {filteredOrders.map((o) => {
                    const statusInfo =
                      ORDER_STATUS_MAP[o.trang_thai] ||
                      ORDER_STATUS_MAP["cho_xac_nhan"];
                    const paymentStatusInfo =
                      PAYMENT_STATUS_MAP[o.thanh_toan?.trang_thai] ||
                      PAYMENT_STATUS_MAP["cho_thanh_toan"];

                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-emerald-50/60 dark:hover:bg-slate-800 cursor-pointer border-t border-slate-100 dark:border-slate-800"
                        onClick={() => handleRowClick(o)}
                      >
                        <td className="px-4 py-2 font-mono text-xs">
                          {o.ma_don_hang}
                        </td>
                        <td className="px-4 py-2">
                          <div className="font-medium">{o.ten_nguoi_nhan}</div>
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
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${paymentStatusInfo.className}`}
                          >
                            {paymentStatusInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Panel chi tiết */}
        <div className="col-span-12 xl:col-span-5 2xl:col-span-4">
          {selectedOrder ? (
            <div className="surface-panel h-full flex flex-col">
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
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                  onClick={() => setSelectedOrder(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Khách hàng & giao hàng */}
                <section className="border rounded-lg p-3 border-slate-200 dark:border-slate-700">
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
                <section className="border rounded-lg p-3 border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-sm mb-2">Sản phẩm</h3>
                  <div className="space-y-2">
                    {(selectedOrder.items || []).map((it) => (
                      <div key={it.id} className="flex justify-between text-sm">
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
                <section className="border rounded-lg p-3 border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <CreditCard size={16} />
                      Thanh toán
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${info.className}`}
                        >
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
                            paymentForm.trang_thai_thanh_toan || "da_thanh_toan"
                          }
                          onChange={(e) =>
                            setPaymentForm((f) => ({
                              ...f,
                              trang_thai_thanh_toan: e.target.value,
                            }))
                          }
                        >
                          <option value="da_thanh_toan">Đã thanh toán</option>
                          <option value="that_bai">Thanh toán thất bại</option>
                        </select>
                        <button
                          className="btn-emerald text-xs px-3"
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
                <section className="border rounded-lg p-3 border-slate-200 dark:border-slate-700 space-y-3">
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${info.className}`}
                        >
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
                      {(ORDER_STATUS_FLOW[selectedOrder.trang_thai] || []).map(
                        (st) => (
                          <option key={st} value={st}>
                            {ORDER_STATUS_MAP[st]?.label || st}
                          </option>
                        )
                      )}
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

                    <div className="flex gap-2">
                      <button
                        className="btn-emerald text-sm px-4"
                        disabled={updateStatusMutation.isLoading}
                        onClick={handleSubmitUpdateStatus}
                      >
                        Lưu trạng thái
                      </button>

                      <button
                        className="text-sm px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
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
            <div className="surface-panel h-full flex items-center justify-center text-sm text-slate-500">
              Chọn một đơn hàng ở bảng bên trái để xem chi tiết.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
