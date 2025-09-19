// src/components/common/Orders/OrderRow.jsx

import React from "react";
import { MoreHorizontal, Trash2, Eye, Edit } from 'lucide-react'; // Thay Truck bằng Edit

export default function OrderRow({ item, openMenuId, setOpenMenuId, onView, onUpdateStatus }) {
  
  // Component "badge" để hiển thị trạng thái đơn hàng (giữ nguyên)
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      'Processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      'Shipped': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
      'Delivered': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-slate-100 text-slate-800'}`}>
        {status}
      </span>
    );
  };
  
  const isMenuOpen = openMenuId === item.id;

  // --- LOGIC MỚI: Xác định trạng thái tiếp theo và xử lý xác nhận ---
  const nextStatusMap = {
    'Pending': 'Processing',
    'Processing': 'Shipped',
    'Shipped': 'Delivered',
  };
  
  const nextStatus = nextStatusMap[item.status];

  const handleStatusUpdate = () => {
    if (nextStatus) {
      const confirmUpdate = window.confirm(`Bạn có chắc chắn muốn chuyển trạng thái đơn hàng #${item.id} thành "${nextStatus}" không?`);
      if (confirmUpdate) {
        onUpdateStatus(item.id, nextStatus);
      }
    }
    setOpenMenuId(null);
  };
  
  const handleCancelOrder = () => {
    const confirmCancel = window.confirm(`Bạn có chắc chắn muốn HỦY đơn hàng #${item.id} không? Hành động này không thể hoàn tác.`);
    if (confirmCancel) {
      onUpdateStatus(item.id, 'Cancelled');
    }
    setOpenMenuId(null);
  }

  return (
    <tr className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200">
      <td className="px-4 py-3 text-center">
        <span className="font-semibold text-sky-600 dark:text-sky-400">#{item.id}</span>
      </td>
      <td className="px-4 py-3 text-left">
        <span className="font-bold text-slate-900 dark:text-slate-100">{item.customerName}</span>
      </td>
      <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">{item.orderDate}</td>
      <td className="px-4 py-3 text-center font-medium text-slate-800 dark:text-slate-200">${item.totalAmount.toLocaleString()}</td>
      <td className="px-4 py-3 text-center">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="relative flex justify-center">
          <button 
            onClick={() => setOpenMenuId(isMenuOpen ? null : item.id)}
            className="p-2 rounded-full hover:bg-slate-500/10"
          >
            <MoreHorizontal size={20} className="text-slate-700 dark:text-slate-300" />
          </button>
          {isMenuOpen && (
             <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-xl border dark:border-slate-600 z-10">
               <button onClick={() => { onView(item); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-t-lg">
                 <Eye size={14}/> Xem chi tiết
               </button>
               
               {/* --- Nút Cập nhật trạng thái đã được nâng cấp --- */}
               <button 
                 onClick={handleStatusUpdate}
                 // Vô hiệu hóa nút nếu không có trạng thái tiếp theo (đã giao hoặc đã hủy)
                 disabled={!nextStatus}
                 className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Edit size={14}/> Cập nhật trạng thái
               </button>

               {/* --- Nút Hủy đơn cũng có xác nhận --- */}
               <button 
                onClick={handleCancelOrder} 
                disabled={item.status === 'Delivered' || item.status === 'Cancelled'}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Trash2 size={14}/> Hủy đơn
               </button>
             </div>
           )}
        </div>
      </td>
    </tr>
  );
};