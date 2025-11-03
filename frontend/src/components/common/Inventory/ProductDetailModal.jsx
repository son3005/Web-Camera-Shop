// src/components/common/Inventory/ProductDetailModal.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { X, LoaderCircle } from "lucide-react";
import VariantManager from "./VariantManager";
import PropertyForm from "./PropertyForm";
import DescriptionEditor from "./DescriptionEditor";
import { useProducts } from '../../../hooks/useProducts';

const ProductDetailModal = ({ productId, onClose }) => {
    const { useGetSanPhamById } = useProducts();
    
    const { 
        data: product, 
        isLoading, 
        isError 
    } = useGetSanPhamById(productId, {
        enabled: !!productId,
    });

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-3xl shadow-2xl bg-slate-200/60 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-black/10 dark:border-white/10 flex-shrink-0">
                    <h2 className="text-2xl font-bold dark:text-white">
                        Chi tiết sản phẩm: {product?.ten_san_pham || "Đang tải..."}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Loading, Error, Content */}
                <div className="flex-grow p-6 overflow-y-auto scrollbar-thin">
                    {isLoading ? (
                        <div className="flex-grow flex flex-col items-center justify-center h-full">
                            <LoaderCircle className="animate-spin text-emerald-500" size={48} />
                            <p className="mt-4 text-lg dark:text-slate-300">Đang truy xuất dữ liệu chi tiết...</p>
                        </div>
                    ) : isError ? (
                        <div className="flex-grow flex flex-col items-center justify-center h-full text-red-500">
                            <p>Lỗi! Không thể tải dữ liệu sản phẩm.</p>
                        </div>
                    ) : product && (
                        <div className="flex flex-col gap-8">
                            {/* Thông tin cơ bản */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <h4 className="font-semibold text-slate-600 dark:text-slate-300">Mã sản phẩm</h4>
                                    <p className="text-lg">{product.ma_san_pham}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-600 dark:text-slate-300">Danh mục</h4>
                                    <p className="text-lg">{product.danh_muc?.ten_danh_muc}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-600 dark:text-slate-300">Thương hiệu</h4>
                                    <p className="text-lg">{product.thuong_hieu?.ten_thuong_hieu}</p>
                                </div>
                            </div>

                            {/* Grid cho Variant + Property */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Cột Variant */}
                                <div>
                                    <VariantManager
                                        defaultVariants={product.cac_bien_the || []}
                                        readOnly={true}
                                    />
                                </div>
                                {/* Cột Property */}
                                <div>
                                    <PropertyForm
                                        properties={product.thong_so_ky_thuat}
                                        readOnly={true}
                                    />
                                </div>
                            </div>
                            
                            {/* Phần mô tả */}
                            <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Mô tả</h3>
                                <DescriptionEditor 
                                    value={product.mo_ta || ""} 
                                    readOnly={true} 
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;