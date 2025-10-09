import React from 'react';
import { Box, Package, Truck, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight, LucideShoppingCart } from 'lucide-react';

// [CẬP NHẬT] Cấu hình mới, bao gồm màu sắc, icon, và dữ liệu "trend" giả lập
// Trong thực tế, 'change' và 'trend' nên được tính toán và trả về từ API
const STATUS_CONFIG = [
  { 
    name: 'Total', // Thêm một mục "Total" không phải là bộ lọc
    title: "Tổng Đơn Hàng",
    icon: LucideShoppingCart,
    color: "from-purple-500 to-pink-600",
    bgColor:"bg-purple-50 dark:bg-purple-900/20",
    textColor:"text-purple-600 dark:text-purple-400",
    change: "+15.3%", // Dữ liệu giả lập
    trend: "up"      // Dữ liệu giả lập
  },
  { 
    name: 'Pending', 
    title: "Đang chờ xử lý",
    icon: Box, 
    color: 'from-yellow-500 to-orange-600', 
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    change: "+5.2%",
    trend: "up"
  },
  { 
    name: 'Processing', 
    title: "Đang xử lý",
    icon: Package, 
    color: 'from-blue-500 to-indigo-600', 
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    change: "-1.8%",
    trend: "down"
  },
  { 
    name: 'Shipped', 
    title: "Đang giao",
    icon: Truck, 
    color: 'from-cyan-500 to-sky-600', 
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    change: "+22.1%",
    trend: "up"
  },
  { 
    name: 'Delivered', 
    title: "Đã giao",
    icon: CheckCircle, 
    color: 'from-emerald-500 to-teal-600', 
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    change: "+8.9%",
    trend: "up"
  },
  { 
    name: 'Cancelled', 
    title: "Đã hủy",
    icon: XCircle, 
    color: 'from-red-500 to-rose-600', 
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-600 dark:text-red-400',
    change: "+1.2%",
    trend: "up"
  },
];

const StatusGrid = ({ counts, activeStatuses, onStatusSelect }) => {
  
  const totalOrders = counts?.Total ?? 0;

  const handleSelect = (statusName) => {
    // Không làm gì nếu click vào thẻ "Total"
    if (statusName === 'Total') return;

    // Nếu bấm vào trạng thái đang được chọn, thì bỏ chọn nó (hiện tất cả)
    if (activeStatuses.length === 1 && activeStatuses[0] === statusName) {
      onStatusSelect([]);
    } else {
      onStatusSelect([statusName]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 mb-6">
      {STATUS_CONFIG.map((status) => {
        const count = counts?.[status.name] ?? 0;
        const isActive = activeStatuses.length === 1 && activeStatuses[0] === status.name;
        // Tính toán % cho thanh tiến trình
        const progressPercentage = totalOrders > 0 ? (count / totalOrders * 100).toFixed(2) : 0;

        // Thẻ "Total" không phải là nút bấm, các thẻ khác là nút bấm
        const CardComponent = status.name === 'Total' ? 'div' : 'button';

        return (
          <CardComponent
            key={status.name}
            onClick={() => handleSelect(status.name)}
            className={`
              bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 text-left
              border hover:shadow-xl dark:hover:shadow-slate-900/20 transition-all duration-300 group
              ${isActive 
                ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' 
                : 'border-slate-200/50 dark:border-slate-700/50 shadow-slate-200/10'
              }
              ${status.name !== 'Total' && 'cursor-pointer'}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {status.title}
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                  {count}
                </p>
                <div className="flex items-center space-x-2">
                  {status.trend === "up" ? 
                    <ArrowUpRight className="w-4 h-4 text-emerald-500"/> :
                    <ArrowDownRight className="w-4 h-4 text-red-500"/>
                  }
                  <span className={`text-sm font-semibold ${status.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                    {status.change}
                  </span>
                </div>
              </div>

              <div className={`w-12 h-12 p-3 rounded-xl ${status.bgColor} group-hover:scale-110 transition-all duration-300`}>
                <status.icon className={`w-6 h-6 ${status.textColor}`} />
              </div>
            </div>
            
            {/* Progressbar */}
            {status.name !== 'Total' && (
              <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`bg-gradient-to-r ${status.color} h-2`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            )}
          </CardComponent>
        );
      })}
    </div>
  );
};

export default StatusGrid;

