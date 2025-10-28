// src/pages/admin/Orders.jsx (Đã sửa)
import React, { useState, useMemo } from "react";
import { format } from 'date-fns'; 

// --- (1) IMPORT HOOKS THẬT ---
import {
  useTatCaDonHang,
  useCapNhatTrangThaiDonHang,
} from "../../hooks/useDonHangs"; // Đường dẫn hook của bạn

// (Dùng lại hook debounce từ Inventory)
import { useDebounce } from "../../hooks/useDebounce"; // (Bạn cần tạo file này)

// Icons và các component con
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  LoaderCircle,
  Inbox,
  AlertCircle,
} from "lucide-react";
import OrderRow from "../../components/common/Ecomerce/Orders/OrderRow"; // Đường dẫn component của bạn
import OrderDetailsModal from "../../components/common/Ecomerce/Orders/OrderDetailsModal"; // Đường dẫn component của bạn
import FilterMenu from "../../components/common/Ecomerce/Orders/FilterMenu"; // Đường dẫn component của bạn
import StatusGrid from "../../components/common/Ecomerce/Orders/StatusGrid"; // Đường dẫn component của bạn

const ITEMS_PER_PAGE = 10;

// --- BỘ PHIÊN DỊCH TRẠNG THÁI (Giữ nguyên) ---
export const TRANG_THAI_MAP = {
  CHO_XAC_NHAN: { text: "Chờ xác nhận", color: "yellow" },
  DA_XAC_NHAN: { text: "Đã xác nhận", color: "blue" },
  DANG_GIAO_HANG: { text: "Đang giao", color: "cyan" },
  HOAN_THANH: { text: "Hoàn thành", color: "green" },
  DA_HUY: { text: "Đã hủy", color: "red" },
  YEU_CAU_TRA_HANG: { text: "Yêu cầu trả hàng", color: "purple" },
  DA_TRA_HANG: { text: "Đã trả hàng", color: "gray" },
};
// Lấy danh sách các key Enum để truyền cho FilterMenu
export const ALL_STATUS_KEYS = Object.keys(TRANG_THAI_MAP);

const Orders = () => {
  // --- State quản lý UI (Giữ nguyên) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [goToPage, setGoToPage] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- (2) STATE FILTER THẬT (Khớp với backend và FilterMenu) ---
  const [activeFilters, setActiveFilters] = useState({
    trang_thai: [], // Mảng các Enum string (backend sẽ nhận dạng chuỗi)
    sort_by: "date", // 'date' hoặc 'price'
    sort_order: "desc", // 'asc' hoặc 'desc'
    start_date: null, // Sẽ là chuỗi 'YYYY-MM-DD'
    end_date: null, // Sẽ là chuỗi 'YYYY-MM-DD'
  });

  // --- (3) GỌI API THẬT BẰNG HOOK (Truyền đúng params) ---
  const queryParams = useMemo(() => {
    // Hook useTatCaDonHang đã xử lý việc join mảng trạng thái và bỏ null
    return {
      page: currentPage,
      limit: ITEMS_PER_PAGE, // Component dùng 'limit', hook sẽ đổi thành 'per_page'
      search_term: debouncedSearchTerm || null,
      trang_thai: activeFilters.trang_thai, // Truyền mảng vào hook
      start_date: activeFilters.start_date,
      end_date: activeFilters.end_date,
      sort_by: activeFilters.sort_by,
      sort_order: activeFilters.sort_order,
    };
  }, [currentPage, debouncedSearchTerm, activeFilters]);

  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
  } = useTatCaDonHang(queryParams);

  // --- Gọi MUTATION HOOK THẬT (Giữ nguyên) ---
  const { mutate: capNhatTrangThai } = useCapNhatTrangThaiDonHang();

  // Hàm xử lý khi component con (FilterMenu) nhấn "Áp dụng"
  const handleApplyFilters = (newFilters) => {
    setCurrentPage(1); // Reset về trang 1
    setActiveFilters(newFilters);
    setIsFilterOpen(false);
  };

  // Hàm xử lý khi component con (OrderRow, Modal) muốn cập nhật
  const handleUpdateStatus = (donHangId, trangThaiMoi_Enum) => {
    capNhatTrangThai({
      donHangId: donHangId,
      data: { trang_thai: trangThaiMoi_Enum },
    });
  };

  // Hàm xem chi tiết
  const handleViewDetails = (order) => {
    setSelectedOrderId(order.id);
    setModalOpen(true);
  };

  // (Các hàm phân trang giữ nguyên)
  const totalPages = paginatedData?.total_pages || 1;
  const orders = paginatedData?.items || [];

  const handleGoToPage = (e) => {
    e.preventDefault();
    const pageNum = parseInt(goToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPage(""); // Clear input sau khi nhảy trang
    }
  };

  return (
    <div className="p-6  min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">
        Quản lý Đơn hàng
      </h1>

      {/* --- (4) STATUS GRID (Hiển thị thông báo tạm thời) --- */}
      <StatusGrid
        // statusCounts={data?.statusCounts} // Dữ liệu này chưa có
        // activeFilters={activeFilters.trang_thai} // Sửa lại key cho đúng
        // setActiveFilters={(statuses) => setActiveFilters(f => ({...f, trang_thai: statuses}))}
        // setCurrentPage={setCurrentPage}
        isLoading={false} // Tạm thời không loading
        isError={true} // Báo lỗi
        errorMessage="Chức năng thống kê theo trạng thái đang được phát triển." // Thông báo lỗi
      />

      {/* Thanh Search và Filter (Giữ nguyên JSX, truyền props mới) */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo Mã đơn hàng, SĐT, Tên khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          />
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold"
          >
            <Filter size={18} /> Lọc & Sắp xếp
          </button>
          {isFilterOpen && (
            <FilterMenu
              initialFilters={activeFilters} // Truyền state filter hiện tại
              onApplyFilters={handleApplyFilters} // Truyền hàm xử lý Apply
              onClose={() => setIsFilterOpen(false)}
              trangThaiMap={TRANG_THAI_MAP} // Truyền map trạng thái để hiển thị
              allStatusKeys={ALL_STATUS_KEYS} // Truyền list key trạng thái
            />
          )}
        </div>
      </div>

      {/* Bảng dữ liệu (Giữ nguyên JSX) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Mã ĐH</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Ngày đặt</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Tổng tiền</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {isLoading && (
                <tr>
                  <td colSpan="6" className="h-64">
                    <div className="flex justify-center items-center">
                      <LoaderCircle size={48} className="animate-spin text-cyan-500" />
                    </div>
                  </td>
                </tr>
              )}
              {isError && (
                 <tr>
                  <td colSpan="6" className="h-64 text-center text-red-500">
                    <AlertCircle size={48} className="mx-auto mb-2" />
                    Lỗi khi tải dữ liệu: {error.response?.data?.error || error.message}
                  </td>
                </tr>
              )}
              {!isLoading && !isError && orders.length === 0 && (
                 <tr>
                  <td colSpan="6" className="h-64 text-center text-slate-500">
                    <Inbox size={48} className="mx-auto mb-2" />
                    Không tìm thấy đơn hàng nào khớp.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && orders.map((order) => (
                <OrderRow
                  key={order.id}
                  item={order}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  onView={handleViewDetails}
                  onUpdateStatus={handleUpdateStatus}
                  trangThaiMap={TRANG_THAI_MAP}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phân trang (Giữ nguyên JSX) */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 md:mb-0">
            Hiển thị {orders.length} trên tổng số {paginatedData?.total_items || 0} đơn hàng
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> <ChevronLeft size={20} /> </button>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200"> Trang {currentPage} / {totalPages} </span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> <ChevronRight size={20} /> </button>
             <form onSubmit={handleGoToPage} className="flex items-center gap-2 ml-4">
              <input type="number" min="1" max={totalPages} value={goToPage} onChange={(e) => setGoToPage(e.target.value)} className="w-16 px-2 py-1.5 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 rounded-lg text-sm text-center text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Trang"/>
              <button type="submit" className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700">Đi</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi tiết (Truyền isAdmin=true) */}
      {modalOpen && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setModalOpen(false)}
          onUpdateStatus={handleUpdateStatus} // Vẫn truyền hàm này để modal có thể gọi nếu cần (dù hook đã xử lý)
          trangThaiMap={TRANG_THAI_MAP}
          isAdmin={true} // --- (5) BÁO CHO MODAL BIẾT ĐÂY LÀ ADMIN ---
        />
      )}
    </div>
  );
};

export default Orders;