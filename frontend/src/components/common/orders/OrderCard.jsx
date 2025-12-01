// src/components/orders/OrderCard.jsx
import React from "react";
import OrderStatusBadge from "./OrderStatusBadge";

// format tiền
const fmtVND = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

// tính tổng tiền sản phẩm
const calcProductTotal = (order) =>
  (order.items || []).reduce((s, i) => s + i.so_luong * i.don_gia_luc_mua, 0);

// lấy phí ship từ nhiều field
const getShippingFee = (order) =>
  Number(
    order.phi_van_chuyen ??
      order.phi_ship ??
      order.tien_ship ??
      order.phi_ship_van_chuyen ??
      0
  ) || 0;

// tổng thanh toán = sản phẩm + ship
const calcGrandTotal = (order) =>
  calcProductTotal(order) + getShippingFee(order);

// rule button
const canCancel = (status) => ["cho_xac_nhan", "da_xac_nhan"].includes(status);
const canRequestReturn = (status) => status === "da_giao";

export default function OrderCard({
  order,
  onClick,
  onCancel,
  onRequestReturn,
  disableActions = false,
}) {
  const shippingFee = getShippingFee(order);
  const total = calcGrandTotal(order);

  return (
    <div
      className="p-4 border rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-emerald-400 cursor-pointer transition"
      onClick={onClick}
    >
      {/* LEFT */}
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <b>Mã đơn:</b> {order.ma_don_hang}
        </p>
        <p className="text-xs text-slate-500">
          Ngày đặt:{" "}
          {order.ngay_tao
            ? new Date(order.ngay_tao).toLocaleDateString("vi-VN")
            : "-"}
        </p>
        <p className="text-sm mt-1 line-clamp-2">
          {(order.items || []).map((i) => i.ten_san_pham_luc_mua).join(", ")}
        </p>

        {shippingFee > 0 && (
          <p className="text-xs text-slate-600 mt-1">
            Phí vận chuyển: {fmtVND(shippingFee)}
          </p>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex flex-col items-end gap-2">
        <p className="font-bold">Tổng thanh toán: {fmtVND(total)}</p>
        <OrderStatusBadge trang_thai={order.trang_thai} />

        {!disableActions && (
          <div
            className="flex flex-wrap gap-2 text-xs mt-1"
            onClick={(e) => e.stopPropagation()} // tránh bubble lên card
          >
            {canCancel(order.trang_thai) && onCancel && (
              <button
                className="px-3 py-1 rounded-full border border-red-400 text-red-600 hover:bg-red-50"
                onClick={() => onCancel(order)}
              >
                Huỷ đơn
              </button>
            )}
            {canRequestReturn(order.trang_thai) && onRequestReturn && (
              <button
                className="px-3 py-1 rounded-full border border-amber-400 text-amber-700 hover:bg-amber-50"
                onClick={() => onRequestReturn(order)}
              >
                Yêu cầu đổi/trả
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
