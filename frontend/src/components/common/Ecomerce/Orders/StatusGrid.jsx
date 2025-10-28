// src/components/common/Ecomerce/Orders/StatusGrid.jsx (Đã sửa)
import React from 'react';
// --- (THÊM) Import hook mới ---
import { useThongKeTrangThaiDonHang } from '../../../../hooks/useDonHangs'; // Đường dẫn hook của bạn
import { Box, Package, Truck, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight, LucideShoppingCart, AlertTriangle, LoaderCircle } from 'lucide-react'; // Thêm LoaderCircle

// Cấu hình trạng thái (Đảm bảo key `name` khớp với key trả về từ API backend, ví dụ: 'cho_xac_nhan')
const STATUS_CONFIG = [
   {
    name: 'Total', title: "Tổng Đơn Hàng", icon: LucideShoppingCart,
    color: "from-purple-500 to-pink-600", bgColor:"bg-purple-50 dark:bg-purple-900/20",
    textColor:"text-purple-600 dark:text-purple-400", change: "+15.3%", trend: "up" // Trend data tạm thời
  },
  {
    name: 'cho_xac_nhan', title: "Chờ xác nhận", icon: Box, // Sửa key name
    color: 'from-yellow-500 to-orange-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-600 dark:text-yellow-400', change: "+5.2%", trend: "up"
  },
  {
    name: 'da_xac_nhan', title: "Đã xác nhận", icon: Package, // Sửa key name
    color: 'from-blue-500 to-sky-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400', change: "-2.1%", trend: "down"
  },
   {
    name: 'dang_giao_hang', title: "Đang giao hàng", icon: Truck, // Sửa key name
    color: 'from-cyan-500 to-teal-600', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    textColor: 'text-cyan-600 dark:text-cyan-400', change: "+8.0%", trend: "up"
  },
  {
    name: 'hoan_thanh', title: "Hoàn thành", icon: CheckCircle, // Sửa key name
    color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-600 dark:text-green-400', change: "+12.5%", trend: "up"
  },
  {
    name: 'da_huy', title: "Đã hủy", icon: XCircle, // Sửa key name
    color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-600 dark:text-red-400', change: "+1.0%", trend: "up"
  },
  // Thêm các trạng thái khác nếu có (YEU_CAU_TRA_HANG, DA_TRA_HANG)
  // {
  //   name: 'yeu_cau_tra_hang', title: "Yêu cầu trả", icon: /* Icon */,
  //   /* ... styles ... */
  // },
  // {
  //   name: 'da_tra_hang', title: "Đã trả hàng", icon: /* Icon */,
  //   /* ... styles ... */
  // },
];

// --- (SỬA) Bỏ props không cần nữa, dùng hook bên trong ---
const StatusGrid = ({ activeFilters, setActiveFilters, setCurrentPage }) => {

    // --- (THÊM) Gọi hook để lấy dữ liệu ---
    const { data: statusCounts, isLoading, isError, error } = useThongKeTrangThaiDonHang();

    // Hàm xử lý click
    const handleClick = (statusKey) => {
         // Lấy mảng trạng thái hiện tại từ activeFilters (cha)
         const currentStatuses = activeFilters?.trang_thai || [];

         if (statusKey === 'Total') {
           // Nếu bấm Total, xóa hết filter trạng thái
           setActiveFilters(prev => ({...prev, trang_thai: []}));
         } else {
           // Logic chọn/bỏ chọn nhiều trạng thái
           const isActive = currentStatuses.includes(statusKey);
           const newStatuses = isActive
                ? currentStatuses.filter(s => s !== statusKey) // Bỏ chọn
                : [...currentStatuses, statusKey]; // Thêm chọn
           setActiveFilters(prev => ({...prev, trang_thai: newStatuses}));
         }
         setCurrentPage(1); // Reset về trang 1 khi lọc
    };

    // --- Xử lý Loading / Error ---
    if (isLoading) {
         return (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                 {/* Tạo skeleton UI */}
                 {Array.from({ length: STATUS_CONFIG.length }).map((_, index) => (
                     <div key={index} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse h-[150px]">
                         <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                         <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-1/2 mb-4"></div>
                         <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                         <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                     </div>
                 ))}
             </div>
         );
     }
    if (isError) {
         return (
             <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-3">
                 <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                 <p className="text-sm text-red-700 dark:text-red-300">
                     Không thể tải dữ liệu thống kê: {error?.response?.data?.error || error?.message || "Lỗi không xác định."}
                 </p>
             </div>
         );
     }

    // --- Render Grid với dữ liệu thật ---
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {STATUS_CONFIG.map((status) => {
                // Lấy count từ hook, dùng key là `status.name` (enum string)
                // Backend trả về key dạng 'cho_xac_nhan', khớp với `status.name` đã sửa
                const count = statusCounts?.[status.name] ?? '--'; // Hiển thị '--' nếu chưa có data
                // Check active dựa trên state `activeFilters.trang_thai`
                const isActive = status.name !== 'Total' && (activeFilters?.trang_thai || []).includes(status.name);
                const totalCount = statusCounts?.['Total'] ?? 1; // Lấy total
                // Tính % dựa trên count và total (tránh chia cho 0)
                const progressPercentage = status.name !== 'Total' && totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

                return (
                    <button
                        key={status.name}
                        onClick={() => handleClick(status.name)}
                        className={`relative p-4 rounded-2xl border transition-all duration-300 group
                            ${isActive
                                ? 'bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                                : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                            }`}
                    >
                        {/* Nội dung card (Giữ nguyên JSX, chỉ thay đổi data) */}
                        <div className="flex justify-between items-start">
                          <div className="text-left">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 truncate" title={status.title}>
                              {status.title}
                            </p>
                            <p className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                              {count} {/* Hiển thị count thật */}
                            </p>
                            {/* Trend data tạm thời ẩn */}
                            {/* <div className="flex items-center space-x-2"> ... </div> */}
                          </div>
                          <div className={`flex-shrink-0 w-12 h-12 p-3 rounded-xl ${status.bgColor} group-hover:scale-110 transition-all duration-300`}>
                            <status.icon className={`w-full h-full ${status.textColor}`} />
                          </div>
                        </div>
                        {/* Progressbar */}
                        {status.name !== 'Total' && (
                          <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`bg-gradient-to-r ${status.color} h-2 rounded-full transition-all duration-500`}
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