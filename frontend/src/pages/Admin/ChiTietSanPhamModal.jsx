// src/pages/admin/ChiTietSanPhamModal.jsx
import React from "react";
import { useSanPhamChiTiet } from "../../hooks/useSanPham"; //
import { formatCurrency } from "../../utils/productUtils";
import { ThongSoKyThuatView } from "../../components/common/admin/ThongSoKyThuatView";
import { X, Check, AlertTriangle } from "lucide-react";
import ReactImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css"; // Cần CSS cho gallery

export const ChiTietSanPhamModal = ({ sanPhamId, onClose }) => {
  const { data: sanPham, isLoading, isError } = useSanPhamChiTiet(sanPhamId); //

  // Hàm helper để chuẩn bị ảnh cho gallery
  const getBienTheImages = (bienThe) => {
    if (!bienThe.hinh_anhs || bienThe.hinh_anhs.length === 0) {
      return [];
    }
    return bienThe.hinh_anhs.map((img) => ({
      original: img.url,
      thumbnail: img.url,
      originalAlt: img.alt_text,
      thumbnailAlt: img.alt_text,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Chi tiết Sản phẩm
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {isLoading && <div>Đang tải chi tiết...</div>}
        {isError && <div>Không thể tải chi tiết sản phẩm.</div>}

        {sanPham && (
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <section>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Tên:</strong> {sanPham.ten_san_pham}
                </div>
                <div>
                  <strong>Mã:</strong> {sanPham.ma_san_pham}
                </div>
                <div>
                  <strong>Danh mục:</strong> {sanPham.danh_muc.ten_danh_muc}
                </div>
                <div>
                  <strong>Thương hiệu:</strong> {sanPham.thuong_hieu.ten_thuong_hieu}
                </div>
                <div>
                  <strong>Trạng thái:</strong> {sanPham.trang_thai}
                </div>
              </div>
            </section>

            {/* Mô tả */}
            <section>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Mô tả</h3>
              {sanPham.mo_ta ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanPham.mo_ta }}
                />
              ) : (
                <p className="text-gray-500 italic">Không có mô tả.</p>
              )}
            </section>

            {/* Thông số kỹ thuật */}
            <section>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                Thông số kỹ thuật
              </h3>
              {/* Đây là phần được thay thế */}
              <ThongSoKyThuatView thong_so_ky_thuat={sanPham.thong_so_ky_thuat} />
            </section>

            {/* Danh sách biến thể */}
            <section>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                Các Biến Thể
              </h3>
              <div className="space-y-4">
                {sanPham.cac_bien_the.map((bt) => (
                  <div key={bt.id} className="border p-4 rounded-md shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cột thông tin */}
                      <div>
                        <p>
                          <strong>Tên biến thể:</strong> {bt.ten_bien_the}
                        </p>
                        <p>
                          <strong>Giá bán:</strong> {formatCurrency(bt.gia_ban)}
                        </p>
                        <p>
                          <strong>Giá KM:</strong>{" "}
                          {bt.gia_khuyen_mai
                            ? formatCurrency(bt.gia_khuyen_mai)
                            : "N/A"}
                        </p>
                        <p>
                          <strong>Tồn kho:</strong> {bt.so_luong_ton}
                        </p>
                        <p className="flex items-center gap-1">
                          <strong>Kích hoạt:</strong>{" "}
                          {bt.trang_thai_kich_hoat === "dang_ban" ? (
                            <Check className="text-green-600" size={18} />
                          ) : (
                            <AlertTriangle
                              className="text-yellow-600"
                              size={18}
                            />
                          )}
                        </p>
                      </div>
                      {/* Cột ảnh */}
                      {bt.hinh_anhs && bt.hinh_anhs.length > 0 ? (
                        <ReactImageGallery
                          items={getBienTheImages(bt)}
                          showPlayButton={false}
                          showFullscreenButton={false}
                          thumbnailPosition="bottom"
                        />
                      ) : (
                        <div className="flex justify-center items-center bg-gray-100 rounded-md h-full">
                          <p className="text-gray-500">Không có hình ảnh</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};