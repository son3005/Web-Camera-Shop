// src/components/common/Inventory/TableRow.jsx
// Mục đích:
// - Hiển thị 1 dòng sản phẩm trong bảng
// - Backend của bạn không có trường tồn kho → hiển thị an toàn
// - Backend có thể trả tên biến thể khác nhau → chuẩn hóa lại

import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import ActionMenu from "./ActionMenu";

// Badge tồn kho – backend chưa có nên mình để "Không rõ"
const StockStatusBadge = () => {
  return (
    <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-300 rounded-full dark:bg-slate-600 dark:text-slate-300">
      Không rõ
    </span>
  );
};

// Badge trạng thái kinh doanh – chỉ hiển thị khi backend trả về
const SellingStatusBadge = ({ trang_thai }) => {
  if (!trang_thai) {
    return (
      <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-300 rounded-full dark:bg-slate-600 dark:text-slate-300">
        —
      </span>
    );
  }
  return trang_thai === "dang_ban" ? (
    <span className="px-2 py-1 text-xs font-semibold text-cyan-800 bg-cyan-200 rounded-full dark:bg-cyan-500/20 dark:text-cyan-300">
      Còn bán
    </span>
  ) : (
    <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-300 rounded-full dark:bg-slate-600 dark:text-slate-300">
      Ngừng bán
    </span>
  );
};

const TableRow = ({ item, onDelete, onView, onEdit }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Chuẩn hóa danh sách biến thể
  const variants =
    item?.cac_bien_the || item?.bien_the_san_phams || item?.variants || [];

  // Giá thấp nhất trong các biến thể
  const minPrice =
    variants.reduce((min, variant) => {
      const price = variant.gia_ban || 0;
      return price > 0 && price < min ? price : min;
    }, Infinity) || 0;

  return (
    <tr className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors h-[61px]">
      {/* ID */}
      <td className="px-4 py-3 font-semibold text-sky-600 dark:text-sky-400">
        {item.id}
      </td>

      {/* Tên sản phẩm */}
      <td className="px-4 py-3 font-semibold">{item.ten_san_pham}</td>

      {/* Thương hiệu */}
      <td className="px-4 py-3 capitalize">
        {item.thuong_hieu?.ten_thuong_hieu || item.ten_thuong_hieu || "—"}
      </td>

      {/* Giá thấp nhất */}
      <td className="px-4 py-3 text-center">
        {minPrice > 0 && minPrice < Infinity
          ? `Từ ${minPrice.toLocaleString()} VNĐ`
          : "N/A"}
      </td>

      {/* Số lượng – backend chưa có */}
      <td className="px-4 py-3 text-center font-medium">—</td>

      {/* Badge tồn kho */}
      <td className="px-4 py-3 text-center">
        <StockStatusBadge />
      </td>

      {/* Trạng thái bán */}
      <td className="px-4 py-3 text-center">
        <SellingStatusBadge trang_thai={item.trang_thai} />
      </td>

      {/* Menu hành động */}
      <td className="px-4 py-3 text-center">
        <div className="relative flex justify-center">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-full hover:bg-slate-500/10"
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
