// src/components/common/Orders/OrderDetailsModal.jsx

import React from "react";
import { X, User, MapPin, Phone, ShoppingBag, DollarSign, Edit } from "lucide-react";

const OrderDetailsModal = ({ order, onClose, onUpdateStatus }) => {
  if (!order) return null;

  const nextStatus = {
    'Pending': 'Processing',
    'Processing': 'Shipped',
    'Shipped': 'Delivered',
  };

  const nextStatusAction = nextStatus[order.status];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
      <div className="relative max-w-2xl w-full mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-slate-700 z-10 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Chi tiết Đơn hàng #{order.id}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-500/10 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 space-y-6">
          {/* Thông tin khách hàng */}
          <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Thông tin khách hàng</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><User size={14} /> <strong>{order.customerName}</strong></p>
              <p className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Phone size={14} /> {order.phone}</p>
              <p className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><MapPin size={14} /> {order.address}</p>
            </div>
          </div>

          {/* Chi tiết sản phẩm */}
          <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Sản phẩm đã đặt</h3>
            <div className="space-y-3">
              {order.products.map(p => (
                <div key={p.id} className="flex items-center gap-4">
                  <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-md object-cover" />
                  <div className="flex-grow">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-slate-600 dark:text-slate-300">{p.quantity} x ${p.price.toLocaleString()}</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">${(p.quantity * p.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hành động */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
          <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tổng cộng:</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${order.totalAmount.toLocaleString()}</p>
          </div>
          {nextStatusAction && (
            <button onClick={() => onUpdateStatus(order.id, nextStatusAction)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-bold bg-gradient-to-br from-emerald-600 to-slate-800 hover:scale-105 transition-transform">
              <Edit size={18} />
              Chuyển sang "{nextStatusAction}"
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;