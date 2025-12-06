// src/components/common/Inventory/VariantImageUpload.jsx

import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, XCircle } from "lucide-react";

/**
 * Upload và quản lý danh sách ảnh cho một biến thể
 *
 * props:
 * - images: mảng ảnh hiện tại (url / file)
 * - onChange: callback khi danh sách ảnh thay đổi
 * - readOnly: true => chỉ xem, không thao tác
 * - placeholderImage: ảnh thay thế nếu không có url
 */
const VariantImageUpload = ({
  images = [],
  onChange,
  readOnly = false,
  placeholderImage,
}) => {
  const fileInputRef = useRef(null);
  const [localImages, setLocalImages] = useState([]);

  // Đồng bộ props.images vào state local (lọc ra những phần tử hợp lệ)
  useEffect(() => {
    const valid = (images || []).filter((img) => img && (img.url || img.file));
    setLocalImages(valid);
  }, [images]);

  // Khi chọn file
  const handleFileChange = (e) => {
    if (readOnly) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Map file -> object ảnh local
    const newImgs = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      alt_text: file.name,
      la_anh_dai_dien: false,
    }));

    const updated = [...localImages, ...newImgs];
    setLocalImages(updated);
    onChange?.(updated);
    e.target.value = null;
  };

  // Xóa 1 ảnh
  const handleRemove = (idx) => {
    if (readOnly) return;
    const img = localImages[idx];
    if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl);

    const updated = localImages.filter((_, i) => i !== idx);

    // Nếu ảnh bị xoá là ảnh chính thì đặt ảnh đầu tiên còn lại làm chính
    if (img.la_anh_dai_dien && updated[0]) {
      updated[0].la_anh_dai_dien = true;
    }

    setLocalImages(updated);
    onChange?.(updated);
  };

  // Đặt 1 ảnh làm ảnh chính
  const setAsMain = (idx) => {
    if (readOnly) return;
    const updated = localImages.map((img, i) => ({
      ...img,
      la_anh_dai_dien: i === idx,
    }));
    setLocalImages(updated);
    onChange?.(updated);
  };

  return (
    <div className="space-y-4">
      {/* Nút chọn ảnh (ẩn khi chỉ đọc) */}
      {!readOnly && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center px-4 py-2 font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 transition-colors duration-300 shadow-sm cursor-pointer"
          >
            <UploadCloud className="h-5 w-5 mr-2" />
            Chọn ảnh
          </button>
        </>
      )}

      {/* Danh sách ảnh */}
      {localImages.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {localImages.map((img, idx) => {
            const src = img.previewUrl || img.url || placeholderImage;
            return (
              <div key={idx} className="relative group aspect-square">
                <img
                  src={src}
                  alt={img.alt_text || `Ảnh ${idx + 1}`}
                  className={`w-full h-full object-cover rounded-md shadow-md ${
                    img.la_anh_dai_dien ? "ring-2 ring-emerald-500" : ""
                  }`}
                />
                {img.la_anh_dai_dien && (
                  <div className="absolute top-1 left-1 bg-emerald-500 text-white text-xs px-1 py-0.5 rounded">
                    Chính
                  </div>
                )}

                {/* Nút xoá + đặt làm chính (chỉ khi không readOnly) */}
                {!readOnly && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="absolute -top-2 -right-2 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                    {!img.la_anh_dai_dien && (
                      <button
                        type="button"
                        onClick={() => setAsMain(idx)}
                        className="absolute bottom-1 left-1 right-1 bg-slate-900/80 text-white text-xs py-1 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        Đặt làm chính
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // TH chưa có ảnh nào
        <div className="text-center py-6 text-slate-500 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/60">
          <UploadCloud className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>Chưa có ảnh nào</p>
          {!readOnly && (
            <p className="text-sm mt-1">
              Ảnh sẽ được upload khi bạn lưu sản phẩm
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VariantImageUpload;
