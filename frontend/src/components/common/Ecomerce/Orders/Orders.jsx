import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import OrderRow from "./OrderRow";
import OrderDetailsModal from "./OrderDetailsModal";
import FilterMenu from "./FilterMenu"; //

// --- DỮ LIỆU MẪU ---
const initialData = [
  { id: "78912", customerName: "Nguyễn Văn An", orderDate: "18-09-2025", totalAmount: 10000000000, status: "Delivered", phone: "0905123456", address: "123 Đường 3/2, Quận Ninh Kiều, Cần Thơ", products: [{id: 1, name: "Canon EOS R5", sku: "P001-BLK", price: 3899, quantity: 1, imageUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?Text=R5"}, {id: 2, name: "Lens Cap", sku: "A012", price: 159, quantity: 1, imageUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=Cap"}]},
  { id: "78913", customerName: "Trần Thị Bích", orderDate: "18-09-2025", totalAmount: 2499, status: "Shipped", phone: "0905234567", address: "456 Đường 30/4, Quận Ninh Kiều, Cần Thơ", products: [{id: 3, name: "Sony A7 IV", sku: "P002-BLK", price: 2499, quantity: 1, imageUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?Text=A7IV"}]},
  { id: "78914", customerName: "Lê Văn Cường", orderDate: "17-09-2025", totalAmount: 2058, status: "Processing", phone: "0905345678", address: "789 Đường Mậu Thân, Quận Ninh Kiều, Cần Thơ", products: [{id: 4, name: "Nikon Z6 II", sku: "P003-BLK", price: 1999, quantity: 1, imageUrl: "https://via.placeholder.com/150/FFFF00/000000?Text=Z6II"}, {id: 5, name: "SD Card 128GB", sku: "A015", price: 59, quantity: 1, imageUrl: "https://via.placeholder.com/150/000000/FFFFFF?Text=SD"}]},
  { id: "78915", customerName: "Phạm Thị Dung", orderDate: "16-09-2025", totalAmount: 1699, status: "Pending", phone: "0905456789", address: "101 Đường Trần Hưng Đạo, Quận Ninh Kiều, Cần Thơ", products: [{id: 6, name: "Fujifilm X-T4", sku: "P004-SIL", price: 1699, quantity: 1, imageUrl: "https://via.placeholder.com/150/C0C0C0/000000?Text=XT4"}]},
  { id: "78916", customerName: "Võ Văn Hùng", orderDate: "15-09-2025", totalAmount: 2499, status: "Cancelled", phone: "0905567890", address: "212 Đường Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ", products: [{id: 7, name: "Canon EOS R6", sku: "P005-BLK", price: 2499, quantity: 1, imageUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?Text=R6"}]},
  { id: "78917", customerName: "Nguyễn Thị Hoa", orderDate: "14-09-2025", totalAmount: 2999, status: "Delivered", phone: "0905678901", address: "321 Đường 3/2, Quận Ninh Kiều, Cần Thơ", products: [{id: 8, name: "Sony A7 III", sku: "P006-BLK", price: 2999, quantity: 1, imageUrl: "https://via.placeholder.com/150/FF00FF/FFFFFF?Text=A7III"}]},
  { id: "78918", customerName: "Phạm Văn Tài", orderDate: "13-09-2025", totalAmount: 1599, status: "Shipped", phone: "0905789012", address: "654 Đường 30/4, Quận Ninh Kiều, Cần Thơ", products: [{id: 9, name: "Panasonic Lumix S5", sku: "P007-BLK", price: 1599, quantity: 1, imageUrl: "https://via.placeholder.com/150/00FFFF/000000?Text=S5"}]},
  { id: "78919", customerName: "Lê Thị Mai", orderDate: "12-09-2025", totalAmount: 1899, status: "Processing", phone: "0905890123", address: "987 Đường Mậu Thân, Quận Ninh Kiều, Cần Thơ", products: [{id: 10, name: "Olympus OM-D E-M1", sku: "P008-BLK", price: 1899, quantity: 1, imageUrl: "https://via.placeholder.com/150/FFA500/FFFFFF?Text=OMD"}]},
  { id: "78920", customerName: "Trần Văn Bình", orderDate: "11-09-2025", totalAmount: 999, status: "Pending", phone: "0905901234", address: "202 Đường Trần Hưng Đạo, Quận Ninh Kiều, Cần Thơ", products: [{id: 11, name: "GoPro HERO9", sku: "P009-BLK", price: 999, quantity: 1, imageUrl: "https://via.placeholder.com/150/008000/FFFFFF?Text=GoPro"}]},
  { id: "78921", customerName: "Vũ Thị Hạnh", orderDate: "10-09-2025", totalAmount: 1299, status: "Cancelled", phone: "0906012345", address: "303 Đường Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ", products: [{id: 12, name: "Canon EOS M50", sku: "P010-WHT", price: 1299, quantity: 1, imageUrl: "https://via.placeholder.com/150/FFFFFF/000000?Text=M50"}]},
  { id: "78922", customerName: "Nguyễn Văn Sơn", orderDate: "09-09-2025", totalAmount: 2099, status: "Delivered", phone: "0906123456", address: "404 Đường 3/2, Quận Ninh Kiều, Cần Thơ", products: [{id: 13, name: "Nikon D750", sku: "P011-BLK", price: 2099, quantity: 1, imageUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?Text=D750"}]},
  { id: "78923", customerName: "Trần Thị Lan", orderDate: "08-09-2025", totalAmount: 1799, status: "Shipped", phone: "0906234567", address: "505 Đường 30/4, Quận Ninh Kiều, Cần Thơ", products: [{id: 14, name: "Sony RX100 VII", sku: "P012-BLK", price: 1799, quantity: 1, imageUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=RX100"}]},
  { id: "78924", customerName: "Lê Văn Phúc", orderDate: "07-09-2025", totalAmount: 1599, status: "Processing", phone: "0906345678", address: "606 Đường Mậu Thân, Quận Ninh Kiều, Cần Thơ", products: [{id: 15, name: "Fujifilm X-S10", sku: "P013-BLK", price: 1599, quantity: 1, imageUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?Text=XS10"}]},
  { id: "78925", customerName: "Phạm Thị Thu", orderDate: "06-09-2025", totalAmount: 899, status: "Pending", phone: "0906456789", address: "707 Đường Trần Hưng Đạo, Quận Ninh Kiều, Cần Thơ", products: [{id: 16, name: "DJI Osmo Pocket", sku: "P014-BLK", price: 899, quantity: 1, imageUrl: "https://via.placeholder.com/150/FFFF00/000000?Text=Osmo"}]},
  { id: "78926", customerName: "Võ Văn Quang", orderDate: "05-09-2025", totalAmount: 1199, status: "Cancelled", phone: "0906567890", address: "808 Đường Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ", products: [{id: 17, name: "Panasonic GH5", sku: "P015-BLK", price: 1199, quantity: 1, imageUrl: "https://via.placeholder.com/150/000000/FFFFFF?Text=GH5"}]},
  { id: "78927", customerName: "Nguyễn Thị Kim", orderDate: "04-09-2025", totalAmount: 1399, status: "Delivered", phone: "0906678901", address: "909 Đường 3/2, Quận Ninh Kiều, Cần Thơ", products: [{id: 18, name: "Canon EOS 90D", sku: "P016-BLK", price: 1399, quantity: 1, imageUrl: "https://via.placeholder.com/150/FF00FF/FFFFFF?Text=90D"}]},
  { id: "78928", customerName: "Phạm Văn Hòa", orderDate: "03-09-2025", totalAmount: 1499, status: "Shipped", phone: "0906789012", address: "1010 Đường 30/4, Quận Ninh Kiều, Cần Thơ", products: [{id: 19, name: "Sony ZV-1", sku: "P017-BLK", price: 1499, quantity: 1, imageUrl: "https://via.placeholder.com/150/00FFFF/000000?Text=ZV1"}]},
  { id: "78929", customerName: "Lê Thị Hương", orderDate: "02-09-2025", totalAmount: 1099, status: "Processing", phone: "0906890123", address: "1111 Đường Mậu Thân, Quận Ninh Kiều, Cần Thơ", products: [{id: 20, name: "Olympus PEN-F", sku: "P018-BLK", price: 1099, quantity: 1, imageUrl: "https://via.placeholder.com/150/FFA500/FFFFFF?Text=PENF"}]},
  { id: "78930", customerName: "Trần Văn Lâm", orderDate: "01-09-2025", totalAmount: 799, status: "Pending", phone: "0906901234", address: "1212 Đường Trần Hưng Đạo, Quận Ninh Kiều, Cần Thơ", products: [{id: 21, name: "GoPro HERO8", sku: "P019-BLK", price: 799, quantity: 1, imageUrl: "https://via.placeholder.com/150/008000/FFFFFF?Text=GoPro8"}]},
  { id: "78931", customerName: "Vũ Thị Ngọc", orderDate: "31-08-2025", totalAmount: 999, status: "Cancelled", phone: "0907012345", address: "1313 Đường Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ", products: [{id: 22, name: "Canon EOS M6", sku: "P020-WHT", price: 999, quantity: 1, imageUrl: "https://via.placeholder.com/150/FFFFFF/000000?Text=M6"}]},
  { id: "78932", customerName: "Nguyễn Văn Phước", orderDate: "30-08-2025", totalAmount: 2199, status: "Delivered", phone: "0907123456", address: "1414 Đường 3/2, Quận Ninh Kiều, Cần Thơ", products: [{id: 23, name: "Nikon D780", sku: "P021-BLK", price: 2199, quantity: 1, imageUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?Text=D780"}]},
  { id: "78933", customerName: "Trần Thị Thanh", orderDate: "29-08-2025", totalAmount: 1899, status: "Shipped", phone: "0907234567", address: "1515 Đường 30/4, Quận Ninh Kiều, Cần Thơ", products: [{id: 24, name: "Sony RX10 IV", sku: "P022-BLK", price: 1899, quantity: 1, imageUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=RX10"}]},
  { id: "78934", customerName: "Lê Văn Tùng", orderDate: "28-08-2025", totalAmount: 1699, status: "Processing", phone: "0907345678", address: "1616 Đường Mậu Thân, Quận Ninh Kiều, Cần Thơ", products: [{id: 25, name: "Fujifilm X-E4", sku: "P023-BLK", price: 1699, quantity: 1, imageUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?Text=XE4"}]},
  { id: "78935", customerName: "Phạm Thị Hồng", orderDate: "27-08-2025", totalAmount: 899, status: "Pending", phone: "0907456789", address: "1717 Đường Trần Hưng Đạo, Quận Ninh Kiều, Cần Thơ", products: [{id: 26, name: "DJI Osmo Action", sku: "P024-BLK", price: 899, quantity: 1, imageUrl: "https://via.placeholder.com/150/FFFF00/000000?Text=Action"}]},
  { id: "78936", customerName: "Võ Văn Phát", orderDate: "26-08-2025", totalAmount: 1199, status: "Cancelled", phone: "0907567890", address: "1818 Đường Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ", products: [{id: 27, name: "Panasonic G9", sku: "P025-BLK", price: 1199, quantity: 1, imageUrl: "https://via.placeholder.com/150/000000/FFFFFF?Text=G9"}]},
];

const ITEMS_PER_PAGE = 10;
const parseDate = (dateString) => { const [day, month, year] = dateString.split('-').map(Number); return new Date(year, month - 1, day); };

const Orders = () => {
  const [orders, setOrders] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [goToPage, setGoToPage] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState({
      statuses: [], priceSort: "default", dateSort: "default",
      priceRange: { min: "", max: "" }, dateRange: { start: "", end: "" }
  });

  const handleViewDetails = (order) => { setSelectedOrder(order); setModalOpen(true); setOpenMenuId(null); };
  const handleUpdateStatus = (orderId, newStatus) => { setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: newStatus} : o)); if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({...prev, status: newStatus})); };
  const handleGoToPage = (e) => { e.preventDefault(); const num = parseInt(goToPage); if (num >= 1 && num <= totalPages) setCurrentPage(num); setGoToPage(""); };

  // --- LOGIC LỌC VÀ SẮP XẾP ĐƯỢC VIẾT LẠI ---
  const processedData = useMemo(() => {
    // 1. Tìm kiếm trước
    const searchedData = searchTerm.trim() 
        ? orders.filter(item => item.id.includes(searchTerm.trim())) 
        : [...orders];

    // 2. Lọc trên kết quả đã tìm kiếm
    const filteredData = searchedData.filter(item => {
        if (filters.statuses.length > 0 && !filters.statuses.includes(item.status)) return false;
        
        const minPrice = parseFloat(filters.priceRange.min);
        const maxPrice = parseFloat(filters.priceRange.max);
        if (filters.priceRange.min && !isNaN(minPrice) && item.totalAmount < minPrice) return false;
        if (filters.priceRange.max && !isNaN(maxPrice) && item.totalAmount > maxPrice) return false;

        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        if (startDate || endDate) {
            startDate?.setHours(0, 0, 0, 0);
            endDate?.setHours(23, 59, 59, 999);
            const itemDate = parseDate(item.orderDate);
            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;
        }
        return true;
    });

    // 3. Sắp xếp trên kết quả đã lọc
    const sortedData = [...filteredData];
    sortedData.sort((a, b) => {
        // Sắp xếp đa cấp: ưu tiên ngày, sau đó đến giá
        if (filters.dateSort !== 'default') {
            const dateA = parseDate(a.orderDate);
            const dateB = parseDate(b.orderDate);
            const dateComparison = filters.dateSort === 'asc' ? dateA - dateB : dateB - dateA;
            if (dateComparison !== 0) return dateComparison;
        }
        if (filters.priceSort !== 'default') {
            return filters.priceSort === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
        }
        return 0;
    });

    return sortedData;
  }, [orders, searchTerm, filters]);
  
  const totalPages = Math.max(1, Math.ceil(processedData.length / ITEMS_PER_PAGE));
  const paginatedData = processedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const emptyRows = Array.from({ length: ITEMS_PER_PAGE - paginatedData.length });

  return (
    <div className="w-full">
      {modalOpen && <OrderDetailsModal order={selectedOrder} onClose={() => setModalOpen(false)} onUpdateStatus={handleUpdateStatus} />}
      <div className="w-full mx-auto bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 border-b border-black/10 dark:border-white/10">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Đơn hàng</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="text" placeholder="Tìm theo Mã Đơn Hàng..." className="w-full sm:w-64 bg-black/5 dark:bg-white/10 border border-transparent rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="relative"><button onClick={() => setIsFilterOpen(prev => !prev)} className="flex items-center justify-center gap-2 px-4 py-2 text-slate-800 dark:text-slate-200 bg-slate-500/10 hover:bg-slate-500/20 text-sm font-semibold rounded-lg"><Filter size={16} /> <span>Lọc & Sắp xếp</span></button>{isFilterOpen && <FilterMenu filters={filters} setFilters={setFilters} onClose={() => setIsFilterOpen(false)} />}</div>
          </div>
        </div>
        {/* Table & Pagination */}
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-black/5 dark:bg-white/5"><tr>{["Mã ĐH", "Khách hàng", "Ngày đặt", "Tổng tiền", "Trạng thái", "Hành động"].map((header, i) => (<th key={i} className={`px-4 py-3 font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-xs ${header === 'Khách hàng' ? 'text-left' : 'text-center'}`}>{header}</th>))}</tr></thead><tbody>{paginatedData.map((item) => ( <OrderRow key={item.id} item={item} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} onView={handleViewDetails} onUpdateStatus={handleUpdateStatus}/> ))}{emptyRows.map((_, idx) => ( <tr key={`empty-${idx}`} className="border-b border-black/5 dark:border-white/5 h-[69px]"><td colSpan="6"></td></tr> ))}</tbody></table></div>
        <div className="px-5 py-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4"><span className="text-sm text-slate-800 dark:text-slate-400 font-medium">Hiển thị {paginatedData.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {(currentPage - 1) * ITEMS_PER_PAGE + paginatedData.length} trên tổng số {processedData.length} đơn hàng</span><div className="flex items-center gap-4"><div className="flex items-center gap-2"><button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> <ChevronLeft size={20} /> </button><span className="text-sm font-bold text-slate-800 dark:text-slate-200"> Trang {currentPage} / {totalPages} </span><button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> <ChevronRight size={20} /> </button></div><form onSubmit={handleGoToPage} className="flex items-center gap-2"><input type="number" min="1" max={totalPages} value={goToPage} onChange={(e) => setGoToPage(e.target.value)} className="w-16 px-2 py-1.5 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 rounded-lg text-sm text-center text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Trang"/><button type="submit" className="px-4 py-1.5 text-white text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">Go</button></form></div></div>
      </div>
    </div>
  );
};

export default Orders;