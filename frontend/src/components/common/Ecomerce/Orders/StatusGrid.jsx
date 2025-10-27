// src/components/common/Ecomerce/Orders/StatusGrid.jsx (Đã sửa)
import React from 'react';
import { Box, Package, Truck, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight, LucideShoppingCart, AlertTriangle } from 'lucide-react';

// Cấu hình trạng thái (Giữ nguyên)
const STATUS_CONFIG = [
  // ... (Giữ nguyên config của bạn)
   {
    name: 'Total', title: "Tổng Đơn Hàng", icon: LucideShoppingCart,
    color: "from-purple-500 to-pink-600", bgColor:"bg-purple-50 dark:bg-purple-900/20",
    textColor:"text-purple-600 dark:text-purple-400", change: "+15.3%", trend: "up"
  },
  {
    name: 'CHO_XAC_NHAN', title: "Chờ xác nhận", icon: Box,
    color: 'from-yellow-500 to-orange-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-600 dark:text-yellow-400', change: "+5.2%", trend: "up"
  },
  {
    name: 'DA_XAC_NHAN', title: "Đã xác nhận", icon: Package,
    color: 'from-blue-500 to-sky-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400', change: "-2.1%", trend: "down"
  },
   {
    name: 'DANG_GIAO_HANG', title: "Đang giao hàng", icon: Truck,
    color: 'from-cyan-500 to-teal-600', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    textColor: 'text-cyan-600 dark:text-cyan-400', change: "+8.0%", trend: "up"
  },
  {
    name: 'HOAN_THANH', title: "Hoàn thành", icon: CheckCircle,
    color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-600 dark:text-green-400', change: "+12.5%", trend: "up"
  },
  {
    name: 'DA_HUY', title: "Đã hủy", icon: XCircle,
    color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-600 dark:text-red-400', change: "+1.0%", trend: "up"
  },
];

// --- (SỬA) Thêm props isLoading, isError, errorMessage ---
const StatusGrid = ({
  // statusCounts, // Tạm thời không dùng
  // activeFilters,
  // setActiveFilters,
  // setCurrentPage,
  isLoading = false, // Mặc định không loading
  isError = false,   // Mặc định không có lỗi
  errorMessage = "Không thể tải dữ liệu thống kê." // Thông báo lỗi mặc định
}) => {

  // Hàm xử lý click (Tạm thời vô hiệu hóa việc lọc)
  const handleClick = (statusName) => {
    // if (statusName === 'Total') {
    //   setActiveFilters([]); // Bỏ hết filter
    // } else {
    //   setActiveFilters(prev =>
    //     prev.includes(statusName)
    //       ? prev.filter(s => s !== statusName) // Bỏ chọn
    //       : [statusName] // Chỉ chọn 1 cái này
    //   );
    // }
    // setCurrentPage(1); // Reset về trang 1
    console.log("Lọc theo trạng thái:", statusName, "(Chức năng tạm ẩn)");
  };

   // --- (SỬA) Hiển thị thông báo nếu có lỗi ---
   if (isError) {
        return (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
            </div>
        );
    }
    // (Có thể thêm UI Loading nếu cần)
    // if (isLoading) { ... }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {STATUS_CONFIG.map((status) => {
        // const count = statusCounts?.[status.name] ?? 0; // Lấy count thật (tạm ẩn)
        const count = "--"; // Hiển thị '--' vì chưa có data
        // const isActive = status.name !== 'Total' && activeFilters?.includes(status.name); // Check active thật (tạm ẩn)
        const isActive = false; // Tạm thời không active
        // const totalCount = statusCounts?.['Total'] ?? 1; // Lấy total thật (tạm ẩn)
        // const progressPercentage = status.name !== 'Total' && totalCount > 0 ? (count / totalCount) * 100 : 0; // Tính % thật (tạm ẩn)
        const progressPercentage = 0; // Tạm thời 0%

        return (
          <button
            key={status.name}
            // onClick={() => handleClick(status.name)}
            disabled={true} // --- (SỬA) Vô hiệu hóa nút bấm ---
            className={`relative p-4 rounded-2xl border transition-all duration-300 group
                        ${isActive
                          ? 'bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                          : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-not-allowed opacity-50' // --- (SỬA) Thêm style disabled ---
                        }`}
          >
            {/* Nội dung card (Giữ nguyên) */}
            <div className="flex justify-between items-start">
              <div className="text-left">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {status.title}
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                  {count}
                </p>
                 {/* Trend (Tạm ẩn vì data giả)
                <div className="flex items-center space-x-2">
                  {status.trend === "up" ?
                    <ArrowUpRight className="w-4 h-4 text-emerald-500"/> :
                    <ArrowDownRight className="w-4 h-4 text-red-500"/>
                  }
                  <span className={`text-sm font-semibold ${status.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                    {status.change}
                  </span>
                </div>
                 */}
              </div>

              <div className={`w-12 h-12 p-3 rounded-xl ${status.bgColor} group-hover:scale-110 transition-all duration-300`}>
                <status.icon className={`w-6 h-6 ${status.textColor}`} />
              </div>
            </div>

            {/* Progressbar (Giữ nguyên) */}
            {status.name !== 'Total' && (
              <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${status.color} h-2`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StatusGrid;