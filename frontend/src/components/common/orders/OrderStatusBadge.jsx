// src/components/orders/OrderStatusBadge.jsx
import React from "react";

const STATUS_MAP = {
  cho_xac_nhan: ["Chờ xác nhận", "bg-amber-100 text-amber-700"],
  da_xac_nhan: ["Đã xác nhận", "bg-sky-100 text-sky-700"],
  dang_giao: ["Đang giao", "bg-blue-100 text-blue-700"],
  da_giao: ["Đã giao", "bg-emerald-100 text-emerald-700"],
  da_huy: ["Đã hủy", "bg-red-100 text-red-700"],
  yeu_cau_doi_tra: ["Yêu cầu đổi/trả", "bg-purple-100 text-purple-700"],
};

export default function OrderStatusBadge({ trang_thai }) {
  const [label, classes] = STATUS_MAP[trang_thai] || [
    "Không rõ",
    "bg-slate-200 text-slate-700",
  ];

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${classes}`}>{label}</span>
  );
}
