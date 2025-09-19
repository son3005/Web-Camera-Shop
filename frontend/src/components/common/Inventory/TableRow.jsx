// src/components/TableRow.jsx

import React, { useState } from "react";
import { MoreHorizontal } from 'lucide-react';
import ActionMenu from "./ActionMenu";

// Badge cho trạng thái tồn kho
const StockStatusBadge = ({ quantity }) => {
    if (quantity > 10) return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Còn hàng</span>;
    if (quantity > 0) return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Sắp hết</span>;
    return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Hết hàng</span>;
};

// Badge cho trạng thái kinh doanh
const SellingStatusBadge = ({ isActive }) => {
    return isActive ? 
        <span className="px-2 py-1 text-xs font-semibold text-cyan-800 bg-cyan-200 rounded-full">Còn bán</span> : 
        <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-300 rounded-full">Ngừng bán</span>;
};

const TableRow = ({ item, onDelete, onView, onEdit }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  
    return (
        <tr className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors h-[61px]">
            <td className="px-4 py-3 font-semibold text-sky-600 dark:text-sky-400">{item.id}</td>
            <td className="px-4 py-3 font-semibold">{item.name}</td>
            <td className="px-4 py-3 capitalize">{item.brand}</td>
            <td className="px-4 py-3 text-center">${item.price.toLocaleString()}</td>
            <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
            <td className="px-4 py-3 text-center"><StockStatusBadge quantity={item.quantity} /></td>
            <td className="px-4 py-3 text-center"><SellingStatusBadge isActive={item.isActive} /></td>
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