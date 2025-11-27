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

// chip nhỏ hiển thị “Đang bán/Ngừng bán”
const SellingStatusBadge = ({ isActive }) => {
  return isActive ? (
    <span className="px-2 py-1 text-xs font-semibold text-cyan-800 bg-cyan-200 rounded-full dark:bg-cyan-500/20 dark:text-cyan-300">
      Đang bán
    </span>
  ) : (
    <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-300 rounded-full dark:bg-slate-600 dark:text-slate-300">
      Ngừng bán
    </span>
  );
};

// ✅ hàm chuẩn hoá mọi kiểu trạng thái từ BE thành boolean
// BE của cậu đang có: "DANG_BAN" | "AN"
// FE trước đây có: "dang_ban" | "ngung_ban" | true | false
const toActiveBool = (raw) => {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") {
    const v = raw.trim().toLowerCase();
    if (v === "dang_ban") return true;
    if (v === "dang ban") return true;
    if (v === "dang_ban".toLowerCase()) return true;
    return false;
  }
  return false;
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

  // ✅ lấy trạng thái ở cấp sản phẩm trước
  // backend có thể trả: item.trang_thai_kich_hoat = "DANG_BAN"
  // hoặc item.trang_thai = "DANG_BAN"
  let isActive = false;
  if (
    item.trang_thai_kich_hoat !== undefined &&
    item.trang_thai_kich_hoat !== null
  ) {
    isActive = toActiveBool(item.trang_thai_kich_hoat);
  } else if (item.trang_thai !== undefined && item.trang_thai !== null) {
    isActive = toActiveBool(item.trang_thai);
  } else if (Array.isArray(variants) && variants.length > 0) {
    // nếu sản phẩm không có field thì nhìn xuống biến thể
    isActive = variants.some((v) => toActiveBool(v.trang_thai_kich_hoat));
  }

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

      {/* trạng thái kinh doanh */}
      <td className="px-4 py-3 text-center">
        <SellingStatusBadge isActive={isActive} />
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
