// src/pages/Admin/Inventory.jsx
import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/productApi';
import { Search, Plus, ChevronLeft, ChevronRight, Download, Inbox, AlertCircle, Filter } from "lucide-react";
import TableRow from "../../components/common/Inventory/TableRow";
import ExportMenu from "../../components/common/Inventory/ExportMenu";
import AddProductModal from "../../components/common/Inventory/AddProduct/AddProductModal";
import ProductDetailModal from "../../components/common/Inventory/ProductDetailModal";
import FilterPopup from "../../components/common/Inventory/FilterPopup";

export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const useInventoryUI = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const [activeProductId, setActiveProductId] = useState(null);
    const [modalType, setModalType] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const initialFilters = {
        sortBy: { name: null, price: null, stock: null },
        brands: [],          // lọc theo thương hiệu
        status: [],          // lọc theo trạng thái kinh doanh
        stockStatus: [],     // lọc theo trạng thái tồn kho
        priceRange: { min: '', max: '' },
    };

    const [localFilters, setLocalFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);

    const openModal = (type, productId = null) => {
        setModalType(type);
        setActiveProductId(productId);
    };

    const closeModal = () => {
        setModalType(null);
        setActiveProductId(null);
    };

    const handleSortChange = (groupKey, direction) => {
        setLocalFilters(prev => ({
            ...prev,
            sortBy: {
                ...prev.sortBy,
                [groupKey]: prev.sortBy[groupKey] === direction ? null : direction,
            }
        }));
    };

    const handleMultiSelectChange = (filterKey, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [filterKey]: prev[filterKey].includes(value)
                ? prev[filterKey].filter(v => v !== value)
                : [...prev[filterKey], value]
        }));
    };

    const handleRangeChange = (filterKey, rangeKey, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [filterKey]: { ...prev[filterKey], [rangeKey]: value }
        }));
    };

    const applyFilters = () => {
        setCurrentPage(1);
        setAppliedFilters(localFilters);
        setIsFilterOpen(false);
    };

    const resetFilters = () => {
        setLocalFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setCurrentPage(1);
        setIsFilterOpen(false);
    };

    const toggleFilterPopup = () => {
        if (!isFilterOpen) {
            setLocalFilters(appliedFilters);
        }
        setIsFilterOpen(prev => !prev);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    return {
        searchTerm, setSearchTerm, debouncedSearchTerm,
        activeProductId, modalType, openModal, closeModal,
        currentPage, setCurrentPage, itemsPerPage,
        isFilterOpen, toggleFilterPopup, setIsFilterOpen,
        localFilters, appliedFilters,
        handleSortChange, handleMultiSelectChange, handleRangeChange,
        applyFilters, resetFilters
    };
};

const Pagination = ({ currentPage, totalPages, setCurrentPage, dataLength, totalLength }) => {
    const [goToPage, setGoToPage] = useState(currentPage);
    const handleGoToPage = (e) => {
        e.preventDefault();
        let pageNum = parseInt(goToPage, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            setCurrentPage(pageNum);
        } else {
            setGoToPage(currentPage);
        }
    };
    React.useEffect(() => { setGoToPage(currentPage); }, [currentPage]);

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Hiển thị {dataLength} trên {totalLength} kết quả
            </p>
            {totalPages > 1 && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-50 transition"> <ChevronLeft size={20} /> </button>
                        <span className="text-sm font-semibold"> Trang {currentPage} / {totalPages} </span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-50 transition"> <ChevronRight size={20} /> </button>
                    </div>
                    <form onSubmit={handleGoToPage} className="flex items-center gap-2">
                        <input type="number" min="1" max={totalPages} value={goToPage} onChange={(e) => setGoToPage(e.target.value)} className="w-16 px-2 py-1.5 text-center rounded-md bg-white/40 dark:bg-slate-700/50 border border-transparent focus:border-cyan-500 focus:ring-cyan-500 transition" />
                        <button type="submit" className="px-3 py-1.5 text-sm font-semibold rounded-md bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 transition">Go</button>
                    </form>
                </div>
            )}
        </div>
    );
};

const Inventory = () => {
    const queryClient = useQueryClient();
    const filterContainerRef = useRef(null);

    const {
        searchTerm, setSearchTerm, debouncedSearchTerm,
        activeProductId, modalType, openModal, closeModal,
        currentPage, setCurrentPage, itemsPerPage,
        isFilterOpen, toggleFilterPopup, setIsFilterOpen,
        localFilters, appliedFilters,
        handleSortChange, handleMultiSelectChange, handleRangeChange,
        applyFilters, resetFilters
    } = useInventoryUI();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [filterContainerRef, setIsFilterOpen]);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['products', currentPage, debouncedSearchTerm, appliedFilters],
        queryFn: () => getProducts({
            page: currentPage,
            limit: itemsPerPage,
            searchTerm: debouncedSearchTerm,
            filters: appliedFilters
        }),
        keepPreviousData: true,
    });

    const products = data?.items || [];
    const totalPages = data?.totalPages || 0;
    const totalItems = data?.totalItems || 0;

    const createProductMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); },
        onError: (err) => { alert(`Lỗi: ${err.message}`); }
    });
    const updateProductMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); },
        onError: (err) => { alert(`Lỗi: ${err.message}`); }
    });
    const deleteProductMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); },
        onError: (err) => { alert(`Lỗi: ${err.message}`); }
    });

    const handleSaveProduct = (productData) => {
        if (modalType === 'add') {
            createProductMutation.mutate(productData);
        } else {
            updateProductMutation.mutate({ productId: activeProductId, productData });
        }
        closeModal();
    };

    const handleDeleteProduct = (productId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            deleteProductMutation.mutate(productId);
        }
    };

    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const emptyRows = products.length > 0 ? itemsPerPage - products.length : 0;

    const renderLoadingSkeleton = () => (
        <tbody>
            {Array.from({ length: itemsPerPage }).map((_, index) => (
                <tr key={index} className="border-b border-black/5 dark:border-white/5 h-[61px] animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-6 w-20 mx-auto bg-slate-300 dark:bg-slate-700 rounded-full"></div></td>
                    <td className="px-4 py-3"><div className="h-6 w-20 mx-auto bg-slate-300 dark:bg-slate-700 rounded-full"></div></td>
                    <td className="px-4 py-3"><div className="w-8 h-8 mx-auto bg-slate-300 dark:bg-slate-700 rounded-full"></div></td>
                </tr>
            ))}
        </tbody>
    );

    const renderError = () => (
        <tbody>
            <tr>
                <td colSpan="8" className="h-[504px]">
                    <div className="flex flex-col items-center justify-center text-center h-full text-red-500">
                        <AlertCircle size={48} className="mb-4" />
                        <h3 className="text-xl font-semibold">Không thể tải dữ liệu!</h3>
                        <p className="mt-1 text-sm">{error?.message || 'Đã có lỗi xảy ra'}</p>
                    </div>
                </td>
            </tr>
        </tbody>
    );

    return (
        <div className="p-6 min-h-screen text-slate-800 dark:text-slate-200">
            {(modalType === 'add' || modalType === 'edit') && (
                <AddProductModal
                    mode={modalType}
                    productId={activeProductId}
                    onClose={closeModal}
                    onSave={handleSaveProduct}
                />
            )}
            {modalType === 'view' && (
                <ProductDetailModal
                    productId={activeProductId}
                    onClose={closeModal}
                />
            )}

            <div className="w-full max-w-7xl mx-auto rounded-2xl shadow-xl bg-slate-200/50 dark:bg-slate-800/70 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6">
                <h1 className="text-3xl font-bold mb-6">Quản lý Kho hàng</h1>

                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/40 dark:bg-slate-700/50 border border-transparent focus:border-cyan-500 focus:ring-cyan-500 transition"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Nút lọc */}
                        <div className="relative" ref={filterContainerRef}>
                            <button
                                onClick={toggleFilterPopup}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 transition"
                            >
                                <Filter size={20} /> Lọc & Sắp xếp
                            </button>
                            {isFilterOpen && (
                                <div className="absolute right-0 mt-2 z-50">
                                    <FilterPopup
                                        onClose={() => setIsFilterOpen(false)}
                                        localFilters={localFilters}
                                        handleSortChange={handleSortChange}
                                        handleMultiSelectChange={handleMultiSelectChange}
                                        handleRangeChange={handleRangeChange}
                                        onApply={applyFilters}
                                        onReset={resetFilters}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Nút thêm sản phẩm */}
                        <button
                            onClick={() => openModal('add')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-emerald-500 to-slate-600 shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform duration-300"
                        >
                            <Plus size={20} /> Thêm Sản phẩm
                        </button>
                    </div>
                </div>

                {/* Bảng sản phẩm */}
                <div className="overflow-x-auto rounded-lg border border-black/5 dark:border-white/10">
                    <table className="w-full">
                        <thead className="bg-black/5 dark:bg-white/5">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold uppercase w-[8%]">ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold uppercase w-[27%]">Sản phẩm</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold uppercase w-[12%]">Thương hiệu</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[10%]">Giá</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[8%]">Số lượng</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[12%]">Tồn kho</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[13%]">Kinh doanh</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[10%]">Hành động</th>
                            </tr>
                        </thead>

                        {isLoading ? renderLoadingSkeleton() : isError ? renderError() : (
                            <tbody>
                                {products.map(item => (
                                    <TableRow
                                        key={item.id}
                                        item={item}
                                        onView={() => openModal('view', item.id)}
                                        onEdit={() => openModal('edit', item.id)}
                                        onDelete={() => handleDeleteProduct(item.id)}
                                    />
                                ))}
                                {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
                                    <tr key={`empty-${index}`} className="h-[61px]"><td colSpan="8">&nbsp;</td></tr>
                                ))}
                                {products.length === 0 && (
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

                {/* Phân trang */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    dataLength={products.length}
                    totalLength={totalItems}
                />
            </div>
        </div>
    );
};

export default Inventory;
