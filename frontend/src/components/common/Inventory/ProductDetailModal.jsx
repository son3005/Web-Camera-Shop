// src/components/common/Inventory/ProductDetailModal.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Loader2, Package, Tag, Building, FileText } from "lucide-react";
import VariantManager from "./VariantManager";
import PropertyForm from "./PropertyForm";
import DescriptionEditor from "./DescriptionEditor";
import { useProducts } from '../../../hooks/useProducts';

const ProductDetailModal = ({ productId, onClose }) => {
    const { useGetSanPhamById } = useProducts();
    
    const { 
        data: product, 
        isLoading, 
        isError,
        error 
    } = useGetSanPhamById(productId, {
        enabled: !!productId,
    });

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-slate-200/60 dark:bg-slate-800/70 rounded-3xl p-8 flex flex-col items-center">
                    <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
                    <p className="text-lg dark:text-slate-300">Đang tải chi tiết sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-slate-200/60 dark:bg-slate-800/70 rounded-3xl p-8 flex flex-col items-center">
                    <p className="text-red-500 text-lg mb-4">Lỗi khi tải sản phẩm</p>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{error?.message}</p>
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col rounded-3xl shadow-2xl bg-slate-200/60 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-black/10 dark:border-white/10 flex-shrink-0">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        Chi tiết sản phẩm: {product?.ten_san_pham}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow p-6 overflow-y-auto scrollbar-thin">
                    {product && (
                        <div className="flex flex-col gap-8">
                            {/* Thông tin cơ bản */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Tag className="h-5 w-5 text-emerald-500" />
                                        <h3 className="font-semibold text-slate-600 dark:text-slate-300">Mã sản phẩm</h3>
                                    </div>
                                    <p className="text-lg font-mono">{product.ma_san_pham}</p>
                                </div>
                                <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                        <h3 className="font-semibold text-slate-600 dark:text-slate-300">Danh mục</h3>
                                    </div>
                                    <p className="text-lg">{product.danh_muc?.ten_danh_muc}</p>
                                </div>
                                <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building className="h-5 w-5 text-purple-500" />
                                        <h3 className="font-semibold text-slate-600 dark:text-slate-300">Thương hiệu</h3>
                                    </div>
                                    <p className="text-lg">{product.thuong_hieu?.ten_thuong_hieu}</p>
                                </div>
                                <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package className="h-5 w-5 text-orange-500" />
                                        <h3 className="font-semibold text-slate-600 dark:text-slate-300">Trạng thái</h3>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        product.trang_thai === 'dang_ban' 
                                            ? 'bg-green-200 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                                            : 'bg-slate-200 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300'
                                    }`}>
                                        {product.trang_thai === 'dang_ban' ? 'Đang bán' : 'Ngừng bán'}
                                    </span>
                                </div>
                            </div>

                            {/* Grid cho Variant + Property */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Cột Variant */}
                                <div>
                                    <VariantManager
                                        defaultVariants={product.cac_bien_the || []}
                                        readOnly={true}
                                    />
                                </div>
                                {/* Cột Property - KHÔNG truyền control trong chế độ readOnly */}
                                <div>
                                    <PropertyForm
                                        properties={product.thong_so_ky_thuat || {}}
                                        readOnly={true}
                                    />
                                </div>
                            </div>
                            
                            {/* Phần mô tả */}
                            {product.mo_ta && (
                                <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Mô tả sản phẩm
                                    </h3>
                                    <DescriptionEditor 
                                        value={product.mo_ta} 
                                        readOnly={true} 
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;