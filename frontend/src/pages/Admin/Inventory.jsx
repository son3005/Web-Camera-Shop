import React, { useState, useEffect } from "react"; 
import { useSanPhams } from "../../hooks/useSanPham";
import { useXoaSanPham } from "../../hooks/useSanphamBienDoi";

import { Search, Plus, ChevronLeft, ChevronRight, Download, Inbox, AlertCircle, Filter, LoaderCircle } from "lucide-react"; 
import { toast } from "react-toastify";
import TableRow from "../../components/common/Inventory/TableRow";
import ExportMenu from "../../components/common/Inventory/ExportMenu";
import AddProductModal from "../../components/common/Inventory/AddProduct/AddProductModal";
import ProductDetailModal from "../../components/common/Inventory/ProductDetailModal";
import FilterPopup from "../../components/common/Inventory/FilterPopup";

// (Component Pagination của bạn - Giữ nguyên)
const Pagination = ({ currentPage, totalPages, setCurrentPage, dataLength, totalLength }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Hiển thị {dataLength} trên tổng số {totalLength} sản phẩm
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-semibold">
                    Trang {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};


const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};


// (Hook UI - Giữ nguyên)
const useInventoryUI = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const [activeProductId, setActiveProductId] = useState(null);
    const [modalType, setModalType] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const defaultFilters = {
        brands: [],
        stockStatus: [],
        priceRange: ["", ""], 
        sort: 'new',
    };

    const [filters, setFilters] = useState(defaultFilters);
    
    const onApplyFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentPage(1); 
    };

    const onResetFilters = () => {
        setFilters(defaultFilters);
        setCurrentPage(1); 
    };

    const handleOpenModal = (type, productId = null) => {
        setModalType(type);
        setActiveProductId(productId);
    };

    const handleCloseModal = () => {
        setModalType(null);
        setActiveProductId(null);
    };

    return {
        searchTerm, setSearchTerm, debouncedSearchTerm,
        activeProductId, modalType, handleOpenModal, handleCloseModal,
        currentPage, setCurrentPage, itemsPerPage,
        isFilterOpen, setIsFilterOpen, filters, setFilters,
        onApplyFilters,
        onResetFilters
    };
};


const Inventory = () => {
    const {
        searchTerm, setSearchTerm, debouncedSearchTerm,
        activeProductId, modalType, handleOpenModal, handleCloseModal,
        currentPage, setCurrentPage, itemsPerPage,
        isFilterOpen, setIsFilterOpen, filters, setFilters,
        onApplyFilters,
        onResetFilters
    } = useInventoryUI();

    const { 
      data: productData, 
      isLoading: isLoadingProducts, 
      isError, 
      error 
    } = useSanPhams({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        brands: filters.brands.join(','), 
        minPrice: filters.priceRange[0] || null, 
        maxPrice: filters.priceRange[1] || null, 
        sort: filters.sort,
    });

    const { mutate: xoaSanPhamMutate } = useXoaSanPham();

    const handleDelete = (productId) => {
        if (window.confirm("Bạn có chắc muốn xóa sản phẩm này? Thao tác này không thể hoàn tác.")) {
            xoaSanPhamMutate(productId);
        }
    };

    const products = productData?.items || [];
    const totalItems = productData?.total_items || 0;
    const totalPages = productData?.total_pages || 1;
    
    // (Ánh xạ dữ liệu - Giữ nguyên)
    const normalizedProducts = products.map(item => ({
        id: item.id,
        name: item.ten_san_pham,
        brand: item.thuong_hieu?.ten_thuong_hieu || 'N/A',
        category: item.danh_muc?.ten_danh_muc || 'N/A',
        price_from: item.gia_goc,
        total_stock: item.tong_ton_kho,
        isActive: item.trang_thai === 'DANG_BAN',
    }));

    return (
        <div className="p-6  min-h-screen">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8">
                {/* Header: Tiêu đề và Nút bấm */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Quản lý Kho</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tổng cộng {totalItems} sản phẩm</p>
                    </div>
                    
                    {/* --- LAYOUT ĐÚNG THEO YÊU CẦU CỦA BẠN --- */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        
                        {/* 1. Nút Export (Bên trái) */}
                        <ExportMenu /> 
                        
                        {/* 2. Nút Thêm sản phẩm (Bên phải) */}
                        <button 
                            onClick={() => handleOpenModal('add')} 
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-lg text-white bg-gradient-to-br from-cyan-500 to-blue-600 hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-cyan-500/30"
                        >
                            <Plus size={20} /> Thêm sản phẩm
                        </button>
                    </div>
                </div>

                {/* Thanh Tìm kiếm và Lọc (Giữ nguyên) */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-5">
                    <div className="relative w-full md:flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm (tên, SKU...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        />
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="relative w-full md:w-auto">
                         <button onClick={() => setIsFilterOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors">
                            <Filter size={18} /> Lọc
                        </button>
                        
                        {isFilterOpen && (
                            <FilterPopup 
                                onClose={() => setIsFilterOpen(false)}
                                filters={filters}
                                setFilters={setFilters}
                                onApplyFilters={onApplyFilters}
                                onResetFilters={onResetFilters}
                            />
                        )}
                    </div>
                </div>

                {/* Bảng dữ liệu (Giữ nguyên) */}
                <div className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-100 dark:bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Mã SP</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Tên sản phẩm</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Thương hiệu</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Giá bán</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Tồn kho</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Tình trạng kho</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Trạng thái</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        
                        {isLoadingProducts ? (
                            <tbody>
                                <tr>
                                    <td colSpan="8" className="h-[504px]">
                                        <div className="flex justify-center items-center h-full">
                                            <LoaderCircle size={48} className="animate-spin text-cyan-500" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        ) : isError ? (
                            <tbody>
                                <tr>
                                    <td colSpan="8" className="h-[504px]">
                                        <div className="flex flex-col items-center justify-center text-center h-full text-red-500">
                                            <AlertCircle size={48} className="mb-4" />
                                            <h3 className="text-xl font-semibold">Lỗi khi tải dữ liệu</h3>
                                            <p className="mt-1 text-sm">{error?.response?.data?.error || "Đã có lỗi xảy ra."}</p>
        
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {normalizedProducts.length > 0 ? (
                                  <>
                                    {normalizedProducts.map((item, index) => (
                                        <TableRow
                                            key={item.id}
                                            item={item}
                                            onView={() => handleOpenModal('detail', item.id)}
                                            onEdit={() => handleOpenModal('edit', item.id)}
                                            onDelete={() => handleDelete(item.id)}
                                        />
                                    ))}
                                    {Array.from({ length: Math.max(0, itemsPerPage - normalizedProducts.length) }).map((_, i) => (
                                        <tr key={`placeholder-${i}`} className="h-[61px]"><td colSpan="8">&nbsp;</td></tr>
                                    ))}
                                  </>
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="h-[504px]">
                                            <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 dark:text-slate-400">
                                                <Inbox size={48} className="mb-4" />
                                                <h3 className="text-xl font-semibold">Không tìm thấy sản phẩm nào</h3>
                                                <p className="mt-1 text-sm">Hãy thử thay đổi từ khóa tìm kiếm hoặc các bộ lọc.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>

            {/* Phần Phân trang (Giữ nguyên) */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    dataLength={products.length}
                    totalLength={totalItems}
                />
            )}

            {/* Các Modal (Giữ nguyên) */}
            {modalType === 'add' && <AddProductModal mode="add" onClose={handleCloseModal} />}
            {modalType === 'edit' && activeProductId && <AddProductModal mode="edit" productId={activeProductId} onClose={handleCloseModal} />}
            {modalType === 'detail' && activeProductId && <ProductDetailModal productId={activeProductId} onClose={handleCloseModal} />}
        </div>
    );
};

export default Inventory;