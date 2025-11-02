// components/ProductDetailModal.jsx
import React from 'react';
import { X } from 'lucide-react';

const ProductDetailModal = ({ product, onClose }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Chi tiết Sản phẩm</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã sản phẩm</label>
                  <p className="mt-1">{product.ma_san_pham}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên sản phẩm</label>
                  <p className="mt-1">{product.ten_san_pham}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Danh mục</label>
                  <p className="mt-1">{product.danh_muc.ten_danh_muc}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Thương hiệu</label>
                  <p className="mt-1">{product.thuong_hieu.ten_thuong_hieu}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Thông số kỹ thuật</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(product.thong_so_ky_thuat, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.mo_ta && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Mô tả</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">{product.mo_ta}</p>
              </div>
            </div>
          )}

          {/* Variants */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Chi tiết Biến thể</h3>
            <div className="space-y-4">
              {product.cac_bien_the?.map((variant, index) => (
                <div key={variant.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Biến thể {index + 1}: {variant.ten_bien_the}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      variant.trang_thai_kich_hoat === 'dang_ban' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {variant.trang_thai_kich_hoat}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Giá bán:</span>
                      <p className="font-medium">{formatPrice(variant.gia_ban)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Giá KM:</span>
                      <p>{variant.gia_khuyen_mai ? formatPrice(variant.gia_khuyen_mai) : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tồn kho:</span>
                      <p>{variant.so_luong_ton}</p>
                    </div>
                  </div>

                  {/* Variant Images */}
                  {variant.hinh_anhs?.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">Hình ảnh:</span>
                      <div className="flex gap-2 mt-2">
                        {variant.hinh_anhs.map((image) => (
                          <div key={image.id} className="relative">
                            <img
                              src={image.url}
                              alt={image.alt_text}
                              className="w-16 h-16 object-cover rounded border"
                            />
                            {image.la_anh_dai_dien && (
                              <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded">
                                Chính
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;