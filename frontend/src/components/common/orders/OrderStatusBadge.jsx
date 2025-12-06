// src/components/common/orders/OrderStatusBadge.jsx
import React from "react";

// Map trạng thái -> nhãn + class màu chữ
const STATUS_MAP = {
  cho_xac_nhan: { label: "Chờ xác nhận", colorClass: "text-amber-600" },
  da_xac_nhan: { label: "Đã xác nhận", colorClass: "text-sky-600" },
  dang_giao: { label: "Đang giao", colorClass: "text-blue-600" },
  da_giao: { label: "Đã giao", colorClass: "text-emerald-600" },
  da_huy: { label: "Đã hủy", colorClass: "text-red-600" },
  yeu_cau_doi_tra: {
    label: "Yêu cầu đổi/trả",
    colorClass: "text-purple-600",
  },
};

export default function OrderStatusBadge({ trang_thai }) {
  // Nếu không khớp thì dùng "Không rõ"
  const info = STATUS_MAP[trang_thai] || {
    label: "Không rõ",
    colorClass: "text-slate-600",
  };

  return (
    // inline-flex + gap nhỏ, chỉ color text, không có nền / border / rounded pill
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${info.colorClass}`}
    >
      {/* Chấm tròn màu cho trực quan nhưng không bị “ô màu” to */}
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {info.label}
    </span>
  );
}
