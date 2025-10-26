import React from "react";
import { X, LoaderCircle } from "lucide-react";
import { useSanPhamChiTiet } from "../../../hooks/useSanPham";
import VariantManager from "./AddProduct/VariantManager";
import PropertyForm from "./AddProduct/PropertyForm";
import DescriptionEditor from "./AddProduct/DescriptionEditor";

const ProductDetailModal = ({ productId, onClose }) => {
    const { 
        data: product, 
        isLoading, 
        isError 
    } = useSanPhamChiTiet(productId);

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-3xl shadow-2xl bg-slate-200/60 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50">
                <div className="flex justify-between items-center p-5 border-b border-black/10 dark:border-white/10 flex-shrink-0">
                    <h2 className="text-2xl font-bold dark:text-white">
                        Chi tiết sản phẩm: {product?.ten_san_pham || "Đang tải..."}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading && (
                        <div className="flex justify-center items-center h-64">
                            <LoaderCircle size={48} className="animate-spin text-cyan-500" />
                        </div>
                    )}
                    {isError && <p>Lỗi khi tải dữ liệu...</p>}
                    
                    {product && (
                        <div className="space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InfoBox label="Mã sản phẩm" value={product.ma_san_pham} />
                                <InfoBox label="Thương hiệu" value={product.thuong_hieu?.ten_thuong_hieu} />
                                <InfoBox label="Danh mục" value={product.danh_muc?.ten_danh_muc} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <VariantManager
                                        defaultVariants={product.cac_bien_the || []}
                                        readOnly={true}
                                    />
                                </div>
                                <div>
                                    <PropertyForm
                                        properties={product.thong_so_ky_thuat}
                                        readOnly={true}
                                    />
                                </div>
                            </div>
                            
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

const InfoBox = ({ label, value }) => (
    <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">{label}</label>
        <p className="text-lg font-semibold text-slate-800 dark:text-white mt-1">{value || 'N/A'}</p>
    </div>
);


export default ProductDetailModal;