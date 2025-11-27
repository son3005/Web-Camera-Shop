// src/components/common/Inventory/ProductDetailModal.jsx
import React from "react";
import { X, Loader2, Package, Tag, FileText } from "lucide-react";
import VariantManager from "./VariantManager";
import PropertyForm from "./PropertyForm";
import DescriptionEditor from "./DescriptionEditor";
import { useProducts } from "../../../hooks/useProducts";

const ProductDetailModal = ({ productId, onClose }) => {
  const { useGetSanPhamById } = useProducts();

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetSanPhamById(productId, {
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl shadow-xl">
          <p className="text-red-500 mb-4">Lỗi: {error?.message}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const variants =
    product?.cac_bien_the ||
    product?.bien_the_san_phams ||
    product?.variants ||
    [];

  const properties = product?.thong_so_ky_thuat || {};

  const maSanPham =
    product?.ma_san_pham || (product?.id ? `SP${product.id}` : "—");

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-5 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-700/60">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-50">
            <Package className="h-6 w-6" />
            {product?.ten_san_pham}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/60 p-3 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-4 w-4" />
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  Mã sản phẩm
                </p>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-100">
                {maSanPham}
              </p>
            </div>
            <div className="bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/60 p-3 rounded-2xl">
              <p className="font-medium mb-1 text-slate-700 dark:text-slate-200">
                Danh mục
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-100">
                {product.danh_muc?.ten_danh_muc || "—"}
              </p>
            </div>
            <div className="bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/60 p-3 rounded-2xl">
              <p className="font-medium mb-1 text-slate-700 dark:text-slate-200">
                Thương hiệu
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-100">
                {product.thuong_hieu?.ten_thuong_hieu || "—"}
              </p>
            </div>
            <div className="bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/60 p-3 rounded-2xl">
              <p className="font-medium mb-1 text-slate-700 dark:text-slate-200">
                Cấp độ
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-100">
                {product.cap_do?.ten_cap_do || "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VariantManager defaultVariants={variants} readOnly />
            <PropertyForm properties={properties} readOnly />
          </div>

          {product.mo_ta && (
            <div className="bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/60 p-4 rounded-2xl">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <FileText className="h-4 w-4" /> Mô tả
              </h3>
              <DescriptionEditor value={product.mo_ta} readOnly />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
