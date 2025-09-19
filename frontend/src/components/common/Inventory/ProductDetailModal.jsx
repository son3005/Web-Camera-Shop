// src/components/common/Inventory/ProductDetailModal.jsx

import React, { useState, useEffect } from "react";
import { X, LoaderCircle } from "lucide-react";
import { fetchProductById } from ".././../../api/mockApi";
import VariantManager from "./AddProduct/VariantManager";
import PropertyForm from "./AddProduct/PropertyForm";
import DescriptionEditor from "./AddProduct/DescriptionEditor";

const ProductDetailModal = ({ product: initialProduct, onClose }) => {
    const [product, setProduct] = useState(initialProduct);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProductDetails = async () => {
            setIsLoading(true);
            const data = await fetchProductById(initialProduct.id);
            setProduct(data || initialProduct); // Dùng data chi tiết nếu có
            setIsLoading(false);
        };
        loadProductDetails();
    }, [initialProduct]);

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-4xl max-h-[95vh] flex flex-col rounded-3xl shadow-2xl bg-slate-200/60 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50">
                {isLoading && (
                    <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-3xl">
                        <LoaderCircle className="animate-spin h-12 w-12 text-white mb-4" />
                        <p className="text-white font-semibold">Đang truy xuất dữ liệu chi tiết...</p>
                    </div>
                )}
                <div className="flex justify-between items-center p-5 border-b border-black/10 dark:border-white/10">
                    <h2 className="text-2xl font-bold dark:text-white">
                        Chi tiết sản phẩm: {product?.name || ""}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-grow p-6 overflow-y-auto scrollbar-thin">
                    <div className="space-y-8">
                        <DescriptionEditor value={product.description || "Chưa có mô tả chi tiết."} readOnly={true} />
                        <PropertyForm properties={product.properties} readOnly={true} />
                        <VariantManager defaultVariants={product.variants} readOnly={true} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;