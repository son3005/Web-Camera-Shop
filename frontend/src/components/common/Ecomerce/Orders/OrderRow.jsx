import React from "react";
import { MoreHorizontal, Trash2, Eye, Edit } from 'lucide-react';

/**
 * OrderRow Component
 * @param {object} props - Component props
 * @param {object} props.item - Dữ liệu của một đơn hàng
 * @param {string|null} props.openMenuId - ID của menu đang được mở
 * @param {function} props.setOpenMenuId - Hàm để set ID của menu đang mở
 * @param {function} props.onView - Hàm xử lý khi bấm "Xem chi tiết"
 * @param {function} props.onUpdateStatus - Hàm xử lý khi cập nhật trạng thái
 */
export default function OrderRow({ item, openMenuId, setOpenMenuId, onView, onUpdateStatus }) {
  
  // Component nội bộ "StatusBadge" để hiển thị trạng thái với màu sắc riêng.
  // Giúp cho code JSX chính gọn gàng hơn.
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

  // Logic để xác định trạng thái tiếp theo trong quy trình xử lý đơn hàng
  const nextStatus = {
    'Pending': 'Processing',
    'Processing': 'Shipped',
    'Shipped': 'Delivered',
  }[item.status];

  // Hàm xử lý khi bấm nút "Cập nhật trạng thái".
  // Sẽ gọi hàm `onUpdateStatus` được truyền từ component cha (Orders.jsx).
  const handleStatusUpdate = () => {
    if (nextStatus) {
      onUpdateStatus(item.id, nextStatus);
    }
    setOpenMenuId(null); // Đóng menu sau khi thực hiện hành động
  };
  
  // Hàm xử lý khi bấm nút "Hủy đơn".
  // Có một bước xác nhận để tránh người dùng bấm nhầm.
  const handleCancelOrder = () => {
    if (window.confirm(`Bạn có chắc muốn hủy đơn hàng #${item.id} không?`)) {
      onUpdateStatus(item.id, 'Cancelled');
    }
    setOpenMenuId(null); // Đóng menu sau khi thực hiện hành động
  };
  
  return (
    <tr className="border-b border-black/5 dark:border-white/5 hover:bg-slate-200/50 dark:hover:bg-slate-200/50 transition-colors">
        {/* ---- CÁC Ô DỮ LIỆU ĐÃ ĐƯỢC CĂN CHỈNH ---- */}

        {/* Cột Mã ĐH: Căn giữa */}
        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 text-center">
            #{item.id}
        </td>

        {/* Cột Khách hàng: Căn trái (mặc định) */}
        <td className="px-4 py-3 text-left">
            <div className="font-semibold text-slate-800 dark:text-slate-200">{item.customerName}</div>
        </td>

        {/* Cột Ngày đặt: Căn giữa */}
        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-center">
            {item.orderDate}
        </td>

        {/* Cột Tổng tiền: Căn giữa */}
        <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400 text-center">
            ${item.totalAmount.toLocaleString()}
        </td>

        {/* Cột Trạng thái: Căn giữa */}
        <td className="px-4 py-3 text-center">
            <StatusBadge status={item.status} />
        </td>

        {/* Cột Hành động: Căn giữa */}
        <td className="px-4 py-3 text-center relative">
             {/* Nút ba chấm để mở/đóng menu hành động */}
             <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">
                <MoreHorizontal size={18} />
             </button>

             {/* Menu hành động, chỉ hiển thị khi `openMenuId` trùng với id của hàng này */}
             {openMenuId === item.id && (
             <div className="absolute top-full right-5 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-black/5 dark:border-white/10 z-10 p-1">
               <button onClick={() => { onView(item); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                 <Eye size={14}/> Xem chi tiết
               </button>
               <button 
                 onClick={handleStatusUpdate}
                 disabled={!nextStatus} // Vô hiệu hóa nếu không có trạng thái tiếp theo
                 className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Edit size={14}/> Cập nhật trạng thái
               </button>
               <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
               <button 
                onClick={handleCancelOrder} 
                disabled={item.status === 'Delivered' || item.status === 'Cancelled'} // Vô hiệu hóa nếu đơn đã giao hoặc đã hủy
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Trash2 size={14}/> Hủy đơn
               </button>
             </div>
             )}
        </td>
    </tr>
  );
}

