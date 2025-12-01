// src/components/common/Inventory/TableRow.jsx
import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import ActionMenu from "./ActionMenu";

// ✅ format tiền VNĐ gọn: 333333.00 -> 333.333 VNĐ
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

const StockStatusBadge = ({ quantity }) => {
  if (typeof quantity !== "number" || isNaN(quantity)) {
    return (
      <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-300 rounded-full dark:bg-slate-600 dark:text-slate-300">
        Không rõ
      </span>
    );
  }
  if (quantity > 10)
    return (
      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full dark:bg-green-500/20 dark:text-green-300">
        Còn hàng
      </span>
    );
  if (quantity > 0)
    return (
      <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full dark:bg-yellow-500/20 dark:text-yellow-300">
        Sắp hết
      </span>
    );
  return (
    <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full dark:bg-red-500/20 dark:text-red-300">
      Hết hàng
    </span>
  );
};

// 3 trạng thái kinh doanh: đang bán / sắp bán / ngừng bán
const SellingStatusBadge = ({ status }) => {
  if (status === "sap_ban") {
    return (
      <span className="px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-200 rounded-full dark:bg-amber-500/20 dark:text-amber-300">
        Sắp bán
      </span>
    );
  }
  if (status === "ngung_ban") {
    return (
      <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-300 rounded-full dark:bg-slate-600 dark:text-slate-300">
        Ngừng bán
      </span>
    );
  }
  // mặc định coi là đang bán
  return (
    <span className="px-2 py-1 text-xs font-semibold text-cyan-800 bg-cyan-200 rounded-full dark:bg-cyan-500/20 dark:text-cyan-300">
      Đang bán
    </span>
  );
};

// map raw status => "dang_ban" | "sap_ban" | "ngung_ban"
const normalizeStatusKey = (raw) => {
  if (typeof raw === "boolean") {
    return raw ? "dang_ban" : "ngung_ban";
  }
  if (typeof raw === "string") {
    const v = raw.trim().toUpperCase();
    if (["DANG_BAN", "ACTIVE", "DANGBAN"].includes(v)) return "dang_ban";
    if (["SAP_BAN", "SAPPHANH", "SAPBAN", "COMING_SOON"].includes(v))
      return "sap_ban";
    if (["NGUNG_BAN", "AN", "INACTIVE"].includes(v)) return "ngung_ban";
  }
  return "ngung_ban";
};

const getBusinessStatus = (item) => {
  const variants =
    item?.cac_bien_the || item?.bien_the_san_phams || item?.variants || [];

  let raw =
    item.trang_thai_kich_hoat !== undefined &&
    item.trang_thai_kich_hoat !== null
      ? item.trang_thai_kich_hoat
      : item.trang_thai;

  if (raw !== undefined && raw !== null) {
    return normalizeStatusKey(raw);
  }

  // nếu không có trạng thái ở sản phẩm, nhìn xuống biến thể:
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

  const variants =
    item?.cac_bien_the || item?.bien_the_san_phams || item?.variants || [];

  const totalStock =
    variants.reduce(
      (total, variant) =>
        total +
        (typeof variant.so_luong === "number"
          ? variant.so_luong
          : variant.so_luong_ton || 0),
      0
    ) || 0;

  const minPrice =
    variants.reduce((min, variant) => {
      const price = variant.gia_ban || 0;
      return price > 0 && price < min ? price : min;
    }, Infinity) || 0;

  const businessStatus = getBusinessStatus(item);

  return (
    <tr className="border-b border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/70 dark:hover:bg-slate-800/70 transition-colors h-[61px]">
      <td className="px-4 py-3 font-semibold text-sky-600 dark:text-sky-400">
        {item.id}
      </td>
      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
        {item.ten_san_pham}
      </td>
      <td className="px-4 py-3 capitalize text-slate-700 dark:text-slate-200">
        {item.thuong_hieu?.ten_thuong_hieu || item.ten_thuong_hieu || "—"}
      </td>
      <td className="px-4 py-3 text-center text-slate-800 dark:text-slate-100">
        {minPrice > 0 && minPrice < Infinity
          ? `Từ ${formatVnd(minPrice)}`
          : "N/A"}
      </td>
      <td className="px-4 py-3 text-center font-medium text-slate-800 dark:text-slate-100">
        {totalStock}
      </td>
      {/* trạng thái sản phẩm (còn/sắp hết/hết) */}
      <td className="px-4 py-3 text-center">
        <StockStatusBadge quantity={totalStock} />
      </td>

      {/* trạng thái kinh doanh (3 trạng thái) */}
      <td className="px-4 py-3 text-center">
        <SellingStatusBadge status={businessStatus} />
      </td>

      <td className="px-4 py-3 text-center">
        <div className="relative flex justify-center">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
