// src/components/common/Inventory/TableRow.jsx

import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import ActionMenu from "./ActionMenu";

// Hàm format số tiền VNĐ
const formatVnd = (value) => {
  const n = Number(value);
  if (!n || Number.isNaN(n)) return "N/A";
  return (
    n.toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + " VNĐ"
  );
};

// Badge trạng thái tồn kho
const StockStatusBadge = ({ quantity }) => {
  if (typeof quantity !== "number" || isNaN(quantity)) {
    return (
      <span className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-200 rounded-full">
        Không rõ
      </span>
    );
  }
  if (quantity > 10)
    return (
      <span className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">
        Còn hàng
      </span>
    );
  if (quantity > 0)
    return (
      <span className="px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">
        Sắp hết
      </span>
    );
  return (
    <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
      Hết hàng
    </span>
  );
};

// Chuẩn hóa trạng thái raw -> 3 trạng thái chính
const normalizeStatusKey = (raw) => {
  if (typeof raw === "boolean") return raw ? "dang_ban" : "ngung_ban";

  if (typeof raw === "string") {
    const v = raw.trim().toUpperCase();
    if (["DANG_BAN", "ACTIVE"].includes(v)) return "dang_ban";
    if (["SAP_BAN", "COMING_SOON"].includes(v)) return "sap_ban";
    if (["NGUNG_BAN", "AN", "INACTIVE"].includes(v)) return "ngung_ban";
  }

  return "ngung_ban";
};

// Tính trạng thái kinh doanh tổng từ sản phẩm + các biến thể
const getBusinessStatus = (item) => {
  const variants = item?.cac_bien_the || [];

  let raw =
    item.trang_thai_kich_hoat !== undefined &&
    item.trang_thai_kich_hoat !== null
      ? item.trang_thai_kich_hoat
      : item.trang_thai;

  if (raw !== undefined && raw !== null) {
    return normalizeStatusKey(raw);
  }

  let hasActive = false;
  let hasComing = false;

  variants.forEach((v) => {
    const s = normalizeStatusKey(v.trang_thai_kich_hoat);
    if (s === "dang_ban") hasActive = true;
    if (s === "sap_ban") hasComing = true;
  });

  if (hasActive) return "dang_ban";
  if (hasComing) return "sap_ban";
  return "ngung_ban";
};

const TableRow = ({ item, onDelete, onView, onEdit }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const variants = item?.cac_bien_the || [];

  // Tồn kho tổng = sum(so_luong_nhap - so_luong_ban)
  const totalStock =
    variants.reduce((total, variant) => {
      const nhap = Number(variant.so_luong_nhap || 0);
      const ban = Number(variant.so_luong_ban || 0);
      return total + (nhap - ban);
    }, 0) || 0;

  // Giá thấp nhất trong các biến thể
  const minPrice =
    variants.reduce((min, variant) => {
      const price = Number(variant.gia_ban || 0);
      return price > 0 && price < min ? price : min;
    }, Infinity) || 0;

  const businessStatus = getBusinessStatus(item);

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors h-[61px]">
      {/* ID */}
      <td className="px-4 py-3 font-semibold text-sky-600">{item.id}</td>

      {/* Tên sản phẩm */}
      <td className="px-4 py-3 font-semibold text-slate-800">
        {item.ten_san_pham}
      </td>

      {/* Thương hiệu */}
      <td className="px-4 py-3 capitalize text-slate-700">
        {item.thuong_hieu?.ten_thuong_hieu || "—"}
      </td>

      {/* Giá tối thiểu */}
      <td className="px-4 py-3 text-center text-slate-800">
        {minPrice > 0 && minPrice < Infinity
          ? `Từ ${formatVnd(minPrice)}`
          : "N/A"}
      </td>

      {/* Số lượng tồn tổng */}
      <td className="px-4 py-3 text-center font-medium text-slate-800">
        {totalStock}
      </td>

      {/* Badge tồn kho */}
      <td className="px-4 py-3 text-center">
        <StockStatusBadge quantity={totalStock} />
      </td>

      {/* Trạng thái kinh doanh */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {businessStatus === "dang_ban"
            ? "Đang bán"
            : businessStatus === "sap_ban"
            ? "Sắp bán"
            : "Ngừng bán"}
        </span>
      </td>

      {/* Hành động (menu 3 chấm) */}
      <td className="px-4 py-3 text-center">
        <div className="relative flex justify-center">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <MoreHorizontal size={20} />
          </button>
          {isMenuOpen && (
            <ActionMenu
              onClose={() => setIsMenuOpen(false)}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </div>
      </td>
    </tr>
  );
};

export default TableRow;
