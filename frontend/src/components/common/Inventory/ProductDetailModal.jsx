// src/components/common/Inventory/ProductDetailModal.jsx
import React from "react";
import { X, Loader2, Package, Tag, Building, FileText } from "lucide-react";
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
      <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl">
          <p className="text-red-500 mb-4">Lỗi: {error?.message}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-white rounded"
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

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col rounded-3xl bg-slate-200/60 dark:bg-slate-800/70 overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            {product?.ten_san_pham}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/40 p-3 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-4 w-4" />
                <p className="font-medium">Mã sản phẩm</p>
              </div>
              <p>{product.ma_san_pham || "—"}</p>
            </div>
            <div className="bg-white/40 p-3 rounded">
              <p className="font-medium mb-1">Danh mục</p>
              <p>{product.danh_muc?.ten_danh_muc || "—"}</p>
            </div>
            <div className="bg-white/40 p-3 rounded">
              <p className="font-medium mb-1">Thương hiệu</p>
              <p>{product.thuong_hieu?.ten_thuong_hieu || "—"}</p>
            </div>
            <div className="bg-white/40 p-3 rounded">
              <p className="font-medium mb-1">Cấp độ</p>
              <p>{product.cap_do?.ten_cap_do || "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VariantManager defaultVariants={variants} readOnly />
            <PropertyForm properties={properties} readOnly />
          </div>

          {product.mo_ta && (
            <div className="bg-white/40 p-4 rounded">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
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
