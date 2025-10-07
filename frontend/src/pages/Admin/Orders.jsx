import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Service để gọi API giả lập
import { getOrders, updateOrderStatus } from "../../api/orderApi";

// Icons và các component con
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import OrderRow from "../../components/common/Ecomerce/Orders/OrderRow";
import OrderDetailsModal from "../../components/common/Ecomerce/Orders/OrderDetailsModal";
import FilterMenu from "../../components/common/Ecomerce/Orders/FilterMenu";
import StatusGrid from "../../components/common/Ecomerce/Orders/StatusGrid";

const ITEMS_PER_PAGE = 10;

const Orders = () => {
  // --- State quản lý UI ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [goToPage, setGoToPage] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // State `activeFilters` chỉ chứa các bộ lọc đã được người dùng nhấn "Áp dụng"
  // Mặc định sắp xếp theo ngày mới nhất (`dateSort: "desc"`)
  const [activeFilters, setActiveFilters] = useState({
    statuses: [], 
    priceSort: "default", 
    dateSort: "desc",
    priceRange: { min: "", max: "" }, 
    dateRange: { start: "", end: "" }
  });

  const queryClient = useQueryClient();

  // --- Lấy dữ liệu từ API ---
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orders', currentPage, searchTerm, activeFilters],
    queryFn: () => getOrders({
      currentPage, 
      itemsPerPage: ITEMS_PER_PAGE, 
      q: searchTerm.trim(), 
      ...activeFilters
    }),
    keepPreviousData: true,
  });

  // Lấy dữ liệu từ API, có fallback để tránh lỗi
  const orders = data?.data ?? [];
  const totalItems = data?.totalCount ?? 0;
  const statusCounts = data?.statusCounts ?? {};
  
  // --- Cập nhật trạng thái ---
  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      // Làm mới lại query để cập nhật cả bảng và lưới trạng thái
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err) => alert(`Cập nhật thất bại: ${err.message}`),
  });

  // --- Các hàm xử lý sự kiện ---
  const handleUpdateStatus = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, newStatus });
  };
  
  const handleViewDetails = (order) => { 
    setSelectedOrder(order); 
    setModalOpen(true); 
    setOpenMenuId(null); 
  };
  
  const handleApplyFilters = (newFilters) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
  };

  const handleStatusSelect = (newStatuses) => {
    setActiveFilters(prev => ({ ...prev, statuses: newStatuses }));
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  
  const handleGoToPage = (e) => { 
    e.preventDefault(); 
    const num = parseInt(goToPage); 
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num);
    }
    setGoToPage(""); 
  };
  
  const emptyRows = Array.from({ length: Math.max(0, ITEMS_PER_PAGE - orders.length) });

  return (
    <div className="w-full">
      {modalOpen && <OrderDetailsModal order={selectedOrder} onClose={() => setModalOpen(false)} onUpdateStatus={handleUpdateStatus} />}
      
      <StatusGrid 
        counts={statusCounts}
        activeStatuses={activeFilters.statuses}
        onStatusSelect={handleStatusSelect}
      />

      <div className="w-full mx-auto bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 border-b border-black/10 dark:border-white/10">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Danh sách Đơn hàng</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Tìm theo Mã Đơn Hàng..." className="w-full sm:w-64 bg-black/5 dark:bg-white/10 border border-transparent rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="relative">
              <button onClick={() => setIsFilterOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 text-slate-800 dark:text-slate-200 bg-slate-500/10 hover:bg-slate-500/20 text-sm font-semibold rounded-lg">
                <Filter size={16} /> <span>Lọc & Sắp xếp</span>
              </button>
              {isFilterOpen && (
                <FilterMenu 
                  initialFilters={activeFilters}
                  onApplyFilters={handleApplyFilters}
                  onClose={() => setIsFilterOpen(false)} 
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-black/5 dark:bg-white/5">
                    <tr>
                        {["Mã ĐH", "Khách hàng", "Ngày đặt", "Tổng tiền", "Trạng thái", "Hành động"].map((header) => {
                          const alignmentClass = header === 'Khách hàng' ? 'text-left' : 'text-center';
                          return (
                            <th key={header} className={`px-4 py-3 font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-xs ${alignmentClass}`}>
                              {header}
                            </th>
                          );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (<tr><td colSpan="6" className="text-center p-8 text-slate-500">Đang tải dữ liệu...</td></tr>) 
                    : isError ? (<tr><td colSpan="6" className="text-center p-8 text-red-500">Lỗi: {error.message}</td></tr>) 
                    : orders.length === 0 ? (<tr><td colSpan="6" className="text-center p-8 text-slate-500">Không tìm thấy đơn hàng nào.</td></tr>) 
                    : (orders.map((item) => (<OrderRow key={item.id} item={item} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} onView={handleViewDetails} onUpdateStatus={handleUpdateStatus}/>)))}
                    
                    {!isLoading && !isError && emptyRows.map((_, idx) => (<tr key={`empty-${idx}`} className="border-b border-black/5 dark:border-white/5 h-[69px]"><td colSpan="6"></td></tr>))}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        <div className="px-5 py-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-slate-800 dark:text-slate-400 font-medium">Hiển thị {orders.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {(currentPage - 1) * ITEMS_PER_PAGE + orders.length} trên tổng {totalItems}</span>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> <ChevronLeft size={20} /> </button>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200"> Trang {currentPage} / {totalPages} </span>
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> <ChevronRight size={20} /> </button>
                </div>
                <form onSubmit={handleGoToPage} className="flex items-center gap-2">
                    <input type="number" min="1" max={totalPages} value={goToPage} onChange={(e) => setGoToPage(e.target.value)} className="w-16 px-2 py-1.5 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 rounded-lg text-sm text-center text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Trang"/>
                    <button type="submit" className="px-4 py-1.5 text-white text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">Go</button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
