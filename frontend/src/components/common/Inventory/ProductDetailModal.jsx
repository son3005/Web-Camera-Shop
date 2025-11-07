// src/components/common/Inventory/ProductDetailModal.jsx
// Mục đích: xem chi tiết sản phẩm.
// Điểm quan trọng:
// - Chuẩn hóa tên biến thể: product.cac_bien_the / product.bien_the_san_phams
// - Hiển thị thêm cấp độ nếu backend trả về
// - Không upload gì ở đây, chỉ đọc dữ liệu từ backend
// - ĐÃ FIX lỗi "Adjacent JSX elements..." ở phần grid thông tin cơ bản

import React from "react";
import { X, Loader2, Package, Tag, Building, FileText } from "lucide-react";
import VariantManager from "./VariantManager";
import PropertyForm from "./PropertyForm";
import DescriptionEditor from "./DescriptionEditor";
import { useProducts } from "../../../hooks/useProducts";

const ProductDetailModal = ({ productId, onClose }) => {
  const { useGetSanPhamById } = useProducts();

  // gọi API detail
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetSanPhamById(productId, {
    enabled: !!productId,
  });

  // trạng thái loading
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-slate-200/60 dark:bg-slate-800/70 rounded-3xl p-8 flex flex-col items-center">
          <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
          <p className="text-lg dark:text-slate-300">
            Đang tải chi tiết sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  // trạng thái lỗi
  if (isError) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-slate-200/60 dark:bg-slate-800/70 rounded-3xl p-8 flex flex-col items-center">
          <p className="text-red-500 text-lg mb-4">Lỗi khi tải sản phẩm</p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {error?.message}
          </p>
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

  // chuẩn hóa biến thể để truyền xuống VariantManager (ở chế độ readOnly)
  const variants =
    product?.cac_bien_the ||
    product?.bien_the_san_phams ||
    product?.variants ||
    [];

  // thông số kỹ thuật
  const properties = product?.thong_so_ky_thuat || {};

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
                {/* Mã sản phẩm */}
                <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-semibold text-slate-600 dark:text-slate-300">
                      Mã sản phẩm
                    </h3>
                  </div>
                  <p className="text-lg font-mono">
                    {product.ma_san_pham || product.code || "—"}
                  </p>
                </div>

                {/* Danh mục */}
                <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-slate-600 dark:text-slate-300">
                      Danh mục
                    </h3>
                  </div>
                  <p className="text-lg">
                    {product.danh_muc?.ten_danh_muc ||
                      product.ten_danh_muc ||
                      "—"}
                  </p>
                </div>

                {/* Thương hiệu */}
                <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold text-slate-600 dark:text-slate-300">
                      Thương hiệu
                    </h3>
                  </div>
                  <p className="text-lg">
                    {product.thuong_hieu?.ten_thuong_hieu ||
                      product.ten_thuong_hieu ||
                      "—"}
                  </p>
                </div>

                {/* Cấp độ */}
                <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-slate-600 dark:text-slate-300">
                      Cấp độ
                    </h3>
                  </div>
                  <p className="text-lg">
                    {product.cap_do?.ten_cap_do ||
                      product.ten_cap_do ||
                      product.cap_do_id ||
                      "—"}
                  </p>
                </div>

                {/* Trạng thái – chỉ render khi backend có field này */}
                {typeof product.trang_thai !== "undefined" && (
                  <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-orange-500" />
                      <h3 className="font-semibold text-slate-600 dark:text-slate-300">
                        Trạng thái
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.trang_thai === "dang_ban"
                          ? "bg-green-200 text-green-800 dark:bg-green-500/20 dark:text-green-300"
                          : "bg-slate-200 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300"
                      }`}
                    >
                      {product.trang_thai === "dang_ban"
                        ? "Đang bán"
                        : "Ngừng bán"}
                    </span>
                  </div>
                )}
              </div>

              {/* Grid cho Variant + Property */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Biến thể - dùng VariantManager ở chế độ readOnly */}
                <div>
                  <VariantManager defaultVariants={variants} readOnly={true} />
                </div>

                {/* Thông số kỹ thuật */}
                <div>
                  <PropertyForm properties={properties} readOnly={true} />
                </div>
              </div>

              {/* Mô tả sản phẩm */}
              {product.mo_ta && (
                <div className="bg-white/40 dark:bg-slate-700/40 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Mô tả sản phẩm
                  </h3>
                  <DescriptionEditor value={product.mo_ta} readOnly={true} />
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
