// src/components/common/orders/OrderCard.jsx

import React from "react";
import OrderStatusBadge from "./OrderStatusBadge";

const fmtVND = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

const calcProductTotal = (order) =>
  (order?.items || []).reduce((s, i) => s + i.so_luong * i.don_gia_luc_mua, 0);

const getShippingFee = (order) =>
  Number(
    order?.phi_van_chuyen ??
      order?.phi_ship ??
      order?.tien_ship ??
      order?.phi_ship_van_chuyen ??
      0
  ) || 0;

const calcGrandTotal = (order) =>
  order?.tong_thanh_toan ??
  order?.tong_tien ??
  calcProductTotal(order) + getShippingFee(order);

const canCancel = (status) => ["cho_xac_nhan", "da_xac_nhan"].includes(status);
const canRequestReturn = (status) => status === "da_giao";

export default function OrderCard({
  order,
  onClick,
  onCancel,
  onRequestReturn,
  onReview, // 🔹 callback mở modal đánh giá
}) {
  const handleCardClick = () => {
    onClick?.(order);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    onCancel?.(order);
  };

  const handleRequestReturn = (e) => {
    e.stopPropagation();
    onRequestReturn?.(order);
  };

  const handleReview = (e) => {
    e.stopPropagation();
    onReview?.(order);
  };

  return (
    <div
      className="border border-slate-200 rounded-2xl px-4 py-3 bg-white hover:shadow-sm cursor-pointer transition-shadow flex justify-between gap-4"
      onClick={handleCardClick}
    >
      {/* LEFT: info */}
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <p className="font-semibold text-sm">
            Mã đơn:{" "}
            <span className="font-mono">
              {order.ma_don_hang || `DH${order.id}`}
            </span>
          </p>
        </div>

        <p className="text-xs text-slate-500 mt-1">
          Ngày đặt:{" "}
          {order.ngay_tao
            ? new Date(order.ngay_tao).toLocaleString("vi-VN")
            : "-"}
        </p>

        {order.ghi_chu && (
          <p className="text-xs text-slate-600 mt-1 line-clamp-1">
            {order.ghi_chu}
          </p>
        )}

        <p className="text-xs text-slate-500 mt-1">
          Phí vận chuyển: {fmtVND(getShippingFee(order))}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-slate-500">Trạng thái:</span>
          <OrderStatusBadge trang_thai={order.trang_thai} />
        </div>
      </div>

      {/* RIGHT: total + actions */}
      <div className="flex flex-col items-end justify-between gap-2">
        <div className="text-right">
          <p className="text-xs text-slate-500">Tổng thanh toán:</p>
          <p className="font-bold text-base">{fmtVND(calcGrandTotal(order))}</p>
        </div>

        <div className="flex flex-wrap justify-end gap-2 text-xs">
          {canCancel(order.trang_thai) && (
            <button
              onClick={handleCancel}
              className="px-3 py-1 rounded-full border border-red-400 text-red-600 hover:bg-red-50"
            >
              Hủy đơn
            </button>
          )}

          {canRequestReturn(order.trang_thai) && (
            <>
              {/* 🔸 Nút Đánh giá nằm ngoài, cạnh nút yêu cầu đổi/trả */}
              {onReview && (
                <button
                  onClick={handleReview}
                  className="px-3 py-1 rounded-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  Đánh giá
                </button>
              )}

              <button
                onClick={handleRequestReturn}
                className="px-3 py-1 rounded-full border border-amber-400 text-amber-700 hover:bg-amber-50"
              >
                Yêu cầu đổi/trả
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
