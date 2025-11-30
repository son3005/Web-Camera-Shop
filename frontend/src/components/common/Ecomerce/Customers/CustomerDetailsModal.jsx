// src/components/common/Ecomerce/Customers/CustomerDetailsModal.jsx
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import {
  fetchCustomerById,
  updateCustomerStatus,
} from "../../../../api/customerApi";

const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

export default function CustomerDetailsModal({ customerId, onClose }) {
  const qc = useQueryClient();
  const {
    data: c,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => fetchCustomerById(customerId),
  });

  const mutation = useMutation({
    mutationFn: updateCustomerStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customer", customerId] });
    },
  });

  const toggleStatus = async () => {
    if (!c) return;
    const next = c.status === "Blocked" ? "Active" : "Blocked";
    try {
      await mutation.mutateAsync({ customerId: c.id, status: next });
    } catch (e) {
      alert(e.message || "Cập nhật trạng thái thất bại");
    }
  };

  const renderAvatar = () => {
    if (c?.avatar) {
      return (
        <img
          src={c.avatar}
          alt={c.name}
          className="w-20 h-20 rounded-full object-cover"
        />
      );
    }
    const initial = (c?.name || c?.email || "?")[0]?.toUpperCase() || "?";
    return (
      <div className="w-20 h-20 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-800 dark:text-white">
        {initial}
      </div>
    );
  };

  const renderProductImage = (pb) => {
    if (pb.image) {
      return (
        <img
          src={pb.image}
          alt={pb.name}
          className="w-14 h-14 rounded-md object-cover"
        />
      );
    }
    const initial = (pb.name || "?")[0]?.toUpperCase() || "?";
    return (
      <div className="w-14 h-14 rounded-md bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-800 dark:text-white">
        {initial}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className="relative max-w-4xl w-full mx-auto bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700 z-10 max-h-[92vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-black/10 dark:border-white/10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Chi tiết khách hàng
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pr-4 -mr-2">
          {isLoading ? (
            <div className="text-center text-slate-500">Đang tải...</div>
          ) : isError ? (
            <div className="text-center text-red-500">Lỗi: {error.message}</div>
          ) : (
            c && (
              <>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {renderAvatar()}
                  <div className="flex-1">
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {c.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700 dark:text-slate-300 mt-1">
                      <span className="inline-flex items-center gap-1">
                        <Mail size={14} /> {c.email}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone size={14} /> {c.phone || "-"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={14} /> Tạo: {c.createdAt || "-"}
                      </span>
                      {c.lastPurchase && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={14} /> Mua gần nhất:{" "}
                          {c.lastPurchase}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleStatus}
                      className={`px-4 py-2 rounded-lg text-white font-semibold ${
                        c.status === "Blocked"
                          ? "bg-emerald-600 hover:bg-emerald-500"
                          : "bg-red-600 hover:bg-red-500"
                      }`}
                    >
                      {c.status === "Blocked" ? "Mở khóa" : "Khóa khách hàng"}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-5">
                  <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4">
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                      Thông tin
                    </div>
                    <div className="space-y-2 text-sm text-slate-800 dark:text-slate-200">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 text-slate-400" />{" "}
                        {c.address || "Chưa có địa chỉ"}
                      </div>
                      <div className="flex items-center gap-2">
                        {c.status === "Active" ? (
                          <>
                            <ShieldCheck
                              size={14}
                              className="text-emerald-500"
                            />{" "}
                            Trạng thái:{" "}
                            <span className="font-semibold text-emerald-600">
                              Active
                            </span>
                          </>
                        ) : c.status === "Blocked" ? (
                          <>
                            <ShieldAlert size={14} className="text-red-500" />{" "}
                            Trạng thái:{" "}
                            <span className="font-semibold text-red-600">
                              Blocked
                            </span>
                          </>
                        ) : (
                          <>
                            Trạng thái:{" "}
                            <span className="font-semibold">{c.status}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4">
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                      Tổng quan chi tiêu
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-black/5 dark:bg-white/10 rounded-lg p-3">
                        <div className="text-slate-500">Tổng đơn</div>
                        <div className="text-lg font-bold">
                          {Number(c.orderCount || 0)}
                        </div>
                      </div>
                      <div className="bg-black/5 dark:bg-white/10 rounded-lg p-3">
                        <div className="text-slate-500">Tổng chi</div>
                        <div className="text-lg font-bold">
                          {vnd(c.totalSpend)}
                        </div>
                      </div>
                      <div className="bg-black/5 dark:bg-white/10 rounded-lg p-3">
                        <div className="text-slate-500">AOV</div>
                        <div className="text-lg font-bold">
                          {vnd(c.averageOrderValue)}
                        </div>
                      </div>
                      <div className="bg-black/5 dark:bg-white/10 rounded-lg p-3">
                        <div className="text-slate-500">Lần mua gần nhất</div>
                        <div className="text-lg font-bold">
                          {c.lastPurchase || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                    Sản phẩm đã mua
                  </div>
                  {!c.productsBought || c.productsBought.length === 0 ? (
                    <div className="p-4 text-slate-500">
                      Khách hàng chưa mua sản phẩm nào.
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                      {c.productsBought.map((pb) => (
                        <div
                          key={pb.id}
                          className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/70 rounded-lg p-3 border border-slate-200/50 dark:border-slate-700/50"
                        >
                          {renderProductImage(pb)}
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {pb.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              Giá: {vnd(pb.price)}
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="text-slate-700 dark:text-slate-200">
                              SL: {Number(pb.totalQuantity || 0)}
                            </div>
                            <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {vnd(pb.totalSpend)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </div>

        <div className="px-6 py-3 border-t border-black/10 dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
