// src/pages/Inventory.jsx

import React, { useState, useMemo } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, Download, Inbox } from "lucide-react";
import TableRow from "./TableRow";
import ExportMenu from "./ExportMenu";
import AddProductModal from "./AddProduct/AddProductModal";
import ProductDetailModal from "./ProductDetailModal";

const initialData = [
    { id: "P001", name: "Canon EOS R5", brand: "canon", quantity: 12, price: 3899, isActive: true },
    { id: "P002", name: "Sony A7 IV", brand: "sony", quantity: 8, price: 2499, isActive: true },
    { id: "P003", name: "Nikon Z6 II", brand: "nikon", quantity: 0, price: 1999, isActive: false },
    { id: "P004", name: "Fujifilm X-T4", brand: "fujifilm", quantity: 15, price: 1699, isActive: true },
    { id: "P005", name: "Canon EOS R6", brand: "canon", quantity: 3, price: 2499, isActive: true },
    { id: "P006", name: "Sony A7S III", brand: "sony", quantity: 10, price: 3499, isActive: true },
    { id: "P007", name: "Nikon Z7 II", brand: "nikon", quantity: 6, price: 2999, isActive: false },
    { id: "P008", name: "Panasonic GH5", brand: "panasonic", quantity: 0, price: 1499, isActive: true },
    { id: "P009", name: "Canon EOS 90D", brand: "canon", quantity: 18, price: 1199, isActive: true },
    { id: "P010", name: "Sony A6600", brand: "sony", quantity: 9, price: 1399, isActive: true },
    { id: "P011", name: "Nikon D850", brand: "nikon", quantity: 5, price: 2799, isActive: true },
    { id: "P012", name: "Fujifilm X-S10", brand: "fujifilm", quantity: 7, price: 999, isActive: false },
    { id: "P013", name: "Canon EOS RP", brand: "canon", quantity: 0, price: 999, isActive: true },
    { id: "P014", name: "Sony A7C", brand: "sony", quantity: 11, price: 1799, isActive: true },
    { id: "P015", name: "Nikon Z5", brand: "nikon", quantity: 0, price: 1299, isActive: false },
    { id: "P016", name: "Panasonic S5", brand: "panasonic", quantity: 8, price: 1999, isActive: true },
    { id: "P017", name: "Canon M50 II", brand: "canon", quantity: 20, price: 599, isActive: true },
    { id: "P018", name: "Sony ZV-1", brand: "sony", quantity: 14, price: 749, isActive: true },
    { id: "P019", name: "Nikon Z50", brand: "nikon", quantity: 0, price: 859, isActive: false },
    { id: "P020", name: "Fujifilm X-E4", brand: "fujifilm", quantity: 6, price: 849, isActive: true },
    { id: "P021", name: "Canon R3", brand: "canon", quantity: 5, price: 5999, isActive: true },
    { id: "P022", name: "Sony A1", brand: "sony", quantity: 0, price: 6499, isActive: false },
    { id: "P023", name: "Nikon Z9", brand: "nikon", quantity: 4, price: 5499, isActive: true },
    { id: "P024", name: "Panasonic GH6", brand: "panasonic", quantity: 7, price: 2199, isActive: true },
    { id: "P025", name: "Canon R7", brand: "canon", quantity: 13, price: 1499, isActive: true },
    { id: "P026", name: "Sony A7R V", brand: "sony", quantity: 6, price: 3899, isActive: true },
    { id: "P027", name: "Nikon Z30", brand: "nikon", quantity: 9, price: 709, isActive: false },
    { id: "P028", name: "Fujifilm X-H2", brand: "fujifilm", quantity: 4, price: 1999, isActive: true }
];

const useInventory = (initialProducts) => {
    const [products, setProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', currentProduct: null });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const filteredProducts = useMemo(() => products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())), [products, searchTerm]);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);
    const handleSaveProduct = (productData) => {
        if (modalState.mode === 'add') {
            const newProduct = { ...productData, id: `P${Date.now().toString().slice(-4)}` };
            setProducts(prev => [newProduct, ...prev]);
        } else {
            setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
        }
    };
    const handleDeleteProduct = (productId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };
    const openModal = (mode, product = null) => setModalState({ isOpen: true, mode, currentProduct: product });
    const closeModal = () => setModalState({ isOpen: false, mode: 'add', currentProduct: null });

    return { paginatedData, filteredProducts, searchTerm, setSearchTerm, modalState, openModal, closeModal, handleSaveProduct, handleDeleteProduct, currentPage, setCurrentPage, totalPages, itemsPerPage };
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
    const { paginatedData, filteredProducts, searchTerm, setSearchTerm, modalState, openModal, closeModal, handleSaveProduct, handleDeleteProduct, currentPage, setCurrentPage, totalPages, itemsPerPage } = useInventory(initialData);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null); // State cho modal xem chi tiết
    const emptyRows = paginatedData.length > 0 ? itemsPerPage - paginatedData.length : 0;

    return (
        <div className="p-6 min-h-screen text-slate-800 dark:text-slate-200">
            {/* Modal để Thêm/Sửa */}
            {modalState.isOpen && <AddProductModal mode={modalState.mode} product={modalState.currentProduct} onClose={closeModal} onSave={handleSaveProduct} />}
            
            {/* Modal để Xem chi tiết */}
            {viewingProduct && <ProductDetailModal product={viewingProduct} onClose={() => setViewingProduct(null)} />}

            <div className="w-full max-w-7xl mx-auto rounded-2xl shadow-xl bg-slate-200/50 dark:bg-slate-800/70 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6">
                <h1 className="text-3xl font-bold mb-6">Quản lý Kho hàng</h1>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/40 dark:bg-slate-700/50 border border-transparent focus:border-cyan-500 focus:ring-cyan-500 transition" />
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => openModal('add')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-emerald-500 to-slate-600 shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform duration-300">
                            <Plus size={20} /> Thêm Sản phẩm
                        </button>
                        <div className="relative">
                            <button onClick={() => setIsExportMenuOpen(prev => !prev)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 transition">
                                <Download size={20} /> Xuất file
                            </button>
                            {isExportMenuOpen && <ExportMenu onClose={() => setIsExportMenuOpen(false)} />}
                        </div>
                    </div>
                </div>
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
                        <tbody>
                            {paginatedData.map(item => <TableRow key={item.id} item={item} onView={() => setViewingProduct(item)} onEdit={() => openModal('edit', item)} onDelete={() => handleDeleteProduct(item.id)} />)}
                            {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => <tr key={`empty-${index}`} className="h-[61px]"><td colSpan="8">&nbsp;</td></tr>)}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="h-[504px]">
                                        <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 dark:text-slate-400">
                                            <Inbox size={48} className="mb-4" /><h3 className="text-xl font-semibold">Không tìm thấy sản phẩm nào</h3><p className="mt-1 text-sm">Hãy thử thay đổi từ khóa tìm kiếm của bạn.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} dataLength={paginatedData.length} totalLength={filteredProducts.length} />
            </div>
        </div>
    );
};

export default Inventory;