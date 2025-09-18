import React from "react";
import { MoreHorizontal, Trash2, Eye, Edit } from 'lucide-react';

const TableRow = ({ item, openMenuId, setOpenMenuId, onDelete, onView, onEdit }) => {
  
  // --- Logic để hiển thị trạng thái với màu sắc ---
  const StatusBadge = ({ quantity }) => {
    if (quantity > 10) {
      return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">In Stock</span>;
    }
    if (quantity > 0) {
      return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Low Stock</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Out of Stock</span>;
  };
  
  const isMenuOpen = openMenuId === item.id;
  
  return (
    <tr className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200">
      <td className="px-4 py-3 text-center">
        <span className="font-semibold text-sky-600 dark:text-sky-400">{item.id}</span>
      </td>
      <td className="px-4 py-3 text-left">
        <span className="font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
      </td>
      <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">{item.brand}</td>
      <td className="px-4 py-3 text-center font-medium text-slate-800 dark:text-slate-200">{item.quantity}</td>
      <td className="px-4 py-3 text-center font-medium text-slate-800 dark:text-slate-200">${item.price.toLocaleString()}</td>
      <td className="px-4 py-3 text-center">
        <StatusBadge quantity={item.quantity} />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="relative flex justify-center">
          <button 
            onClick={() => setOpenMenuId(isMenuOpen ? null : item.id)}
            className="p-2 rounded-full hover:bg-slate-500/10"
          >
            <MoreHorizontal size={20} className="text-slate-700 dark:text-slate-300" />
          </button>
          {/* Menu Hành Động */}
          {isMenuOpen && (
             <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-700 rounded-lg shadow-xl border dark:border-slate-600 z-10">
               <button onClick={() => { onView(item); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-t-lg"> <Eye size={14}/> Xem</button>
               <button onClick={() => { onEdit(item); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"> <Edit size={14}/> Sửa</button>
               <button onClick={() => { onDelete(item.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-b-lg"> <Trash2 size={14}/> Xóa</button>
             </div>
           )}
        </div>
      </td>
    </tr>
  );
};

export default TableRow;