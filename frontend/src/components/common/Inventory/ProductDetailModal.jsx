// src/components/common/Inventory/ProductDetailModal.jsx

import React from "react";
import { X, Loader2, Package, Tag, FileText } from "lucide-react";
import VariantManager from "./VariantManager";
import PropertyForm from "./PropertyForm";
import DescriptionEditor from "./DescriptionEditor";
import { useProducts } from "../../../hooks/useProducts";

const ProductDetailModal = ({ productId, onClose }) => {
  const { useGetSanPhamById } = useProducts();

  // Gọi API lấy chi tiết sản phẩm
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetSanPhamById(productId, {
    enabled: !!productId,
  });

  // Màn loading
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  // Màn báo lỗi
  if (isError) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/96 border border-slate-200 p-6 rounded-2xl shadow-xl max-w-md w-full">
          <p className="text-red-500 font-semibold mb-2">
            Không thể tải dữ liệu
          </p>
          <p className="text-sm text-slate-600 mb-4">
            {error?.message || "Đã xảy ra lỗi khi tải chi tiết sản phẩm."}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  // Chuẩn hóa nguồn data biến thể / thông số
  const variants =
    product?.cac_bien_the ||
    product?.bien_the_san_phams ||
    product?.variants ||
    [];

  const properties = product?.thong_so_ky_thuat || {};

  const maSanPham =
    product?.ma_san_pham || (product?.id ? `SP${product.id}` : "—");

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Khung modal chính */}
      <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col rounded-3xl bg-white/96 border border-emerald-50 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-5 bg-slate-50/90 border-b border-emerald-50">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Package className="h-6 w-6 text-emerald-500" />
            {product?.ten_san_pham}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Grid thông tin chung: mã, danh mục, thương hiệu, cấp độ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-4 w-4 text-emerald-500" />
                <p className="font-medium text-slate-700">Mã sản phẩm</p>
              </div>
              <p className="text-sm text-slate-800">{maSanPham}</p>
            </div>

            <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3">
              <p className="font-medium mb-1 text-slate-700">Danh mục</p>
              <p className="text-sm text-slate-800">
                {product.danh_muc?.ten_danh_muc || "—"}
              </p>
            </div>

            <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3">
              <p className="font-medium mb-1 text-slate-700">Thương hiệu</p>
              <p className="text-sm text-slate-800">
                {product.thuong_hieu?.ten_thuong_hieu || "—"}
              </p>
            </div>

            <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3">
              <p className="font-medium mb-1 text-slate-700">Cấp độ</p>
              <p className="text-sm text-slate-800">
                {product.cap_do?.ten_cap_do || "—"}
              </p>
            </div>
          </div>

          {/* Biến thể + thông số kỹ thuật (readOnly) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Xem biến thể ở chế độ chỉ đọc */}
            <VariantManager defaultVariants={variants} readOnly />
            {/* Xem thông số kỹ thuật ở chế độ chỉ đọc */}
            <PropertyForm properties={properties} readOnly />
          </div>

          {/* Mô tả (nếu có) */}
          {product.mo_ta && (
            <div className="bg-slate-50/90 border border-slate-200 p-4 rounded-2xl">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-slate-800">
                <FileText className="h-4 w-4 text-emerald-500" /> Mô tả
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
