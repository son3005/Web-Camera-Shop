import React from "react";
import { X, User, MapPin, Phone } from "lucide-react";

const OrderDetailsModal = ({ order, onClose, onUpdateStatus }) => {
  if (!order) return null;

  const nextStatus = {
    'Pending': 'Processing',
    'Processing': 'Shipped',
    'Shipped': 'Delivered',
  }[order.status];

  // Gọi hàm onUpdateStatus từ component cha
  const handleUpdate = () => {
    if (nextStatus) {
      onUpdateStatus(order.id, nextStatus);
      onClose(); // Đóng modal sau khi gọi update
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
      <div className="relative max-w-2xl w-full mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-slate-700 z-10 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Chi tiết Đơn hàng #{order.id}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-6">
            {/* Customer Information */}
            <div className="space-y-3">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Thông tin khách hàng</h3>
                <div className="text-sm space-y-2 text-slate-800 dark:text-slate-200">
                    <p className="flex items-center gap-2"><User size={14} className="text-slate-500"/> {order.customerName}</p>
                    <p className="flex items-center gap-2"><Phone size={14} className="text-slate-500"/> {order.phone}</p>
                    <p className="flex items-start gap-2"><MapPin size={14} className="text-slate-500 mt-0.5"/> {order.address}</p>
                </div>
            </div>

            {/* Product List */}
            <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Sản phẩm</h3>
                <div className="space-y-3">
                    {order.products.map(p => (
                        <div key={p.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-md" />
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

        {/* Actions & Total */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
          <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tổng cộng:</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${order.totalAmount.toLocaleString()}</p>
          </div>
          {nextStatus && (
            <button onClick={handleUpdate} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-bold bg-slate-800 hover:bg-slate-700 transition-colors">
              Chuyển sang "{nextStatus}"
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
