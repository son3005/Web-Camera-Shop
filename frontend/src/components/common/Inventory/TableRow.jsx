// src/components/common/Inventory/TableRow.jsx
import React, { useState } from "react";
import { MoreHorizontal } from 'lucide-react';
import ActionMenu from "./ActionMenu";

// Badge cho trạng thái tồn kho
const StockStatusBadge = ({ quantity }) => {
    if (typeof quantity !== 'number' || isNaN(quantity)) {
        return <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-300 rounded-full dark:bg-slate-600 dark:text-slate-300">Không rõ</span>;
    }
    if (quantity > 10) return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full dark:bg-green-500/20 dark:text-green-300">Còn hàng</span>;
    if (quantity > 0) return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full dark:bg-yellow-500/20 dark:text-yellow-300">Sắp hết</span>;
    return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full dark:bg-red-500/20 dark:text-red-300">Hết hàng</span>;
};

// Badge cho trạng thái kinh doanh
const SellingStatusBadge = ({ trang_thai }) => {
    return trang_thai === 'dang_ban' ? 
        <span className="px-2 py-1 text-xs font-semibold text-cyan-800 bg-cyan-200 rounded-full dark:bg-cyan-500/20 dark:text-cyan-300">Còn bán</span> : 
        <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-300 rounded-full dark:bg-slate-600 dark:text-slate-300">Ngừng bán</span>;
};

const TableRow = ({ item, onDelete, onView, onEdit }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Tính tổng số lượng tồn kho từ các biến thể
    const totalStock = item.cac_bien_the?.reduce((total, variant) => total + (variant.so_luong_ton || 0), 0) || 0;
    
    // Tìm giá thấp nhất từ các biến thể
    const minPrice = item.cac_bien_the?.reduce((min, variant) => {
        const price = variant.gia_ban || 0;
        return price < min ? price : min;
    }, Infinity) || 0;

    return (
        <tr className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors h-[61px]">
            <td className="px-4 py-3 font-semibold text-sky-600 dark:text-sky-400">{item.id}</td>
            <td className="px-4 py-3 font-semibold">{item.ten_san_pham}</td>
            <td className="px-4 py-3 capitalize">{item.thuong_hieu?.ten_thuong_hieu}</td>

            {/* Hiển thị giá thấp nhất */}
            <td className="px-4 py-3 text-center">
                {minPrice > 0 && minPrice < Infinity ? `Từ ${minPrice.toLocaleString()} VNĐ` : 'N/A'}
            </td>

            {/* Hiển thị tổng tồn kho */}
            <td className="px-4 py-3 text-center font-medium">{totalStock}</td>
            <td className="px-4 py-3 text-center"><StockStatusBadge quantity={totalStock} /></td>
            
            <td className="px-4 py-3 text-center"><SellingStatusBadge trang_thai={item.trang_thai} /></td>
            
            <td className="px-4 py-3 text-center">
                <div className="relative flex justify-center">
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full hover:bg-slate-500/10">
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