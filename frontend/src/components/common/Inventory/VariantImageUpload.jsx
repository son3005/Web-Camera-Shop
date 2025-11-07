// src/components/common/Inventory/VariantImageUpload.jsx
import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, XCircle } from "lucide-react";

const VariantImageUpload = ({ images = [], onChange }) => {
  const fileInputRef = useRef(null);
  const [localImages, setLocalImages] = useState([]);

  // đồng bộ props -> state
  useEffect(() => {
    const valid = (images || []).filter((img) => img && (img.url || img.file));
    setLocalImages(valid);
  }, [images]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

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

  const handleRemove = (idx) => {
    const img = localImages[idx];
    if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl);

    const updated = localImages.filter((_, i) => i !== idx);
    // nếu xóa cái đang là ảnh chính thì set cái đầu tiên là chính
    if (img.la_anh_dai_dien && updated[0]) {
      updated[0].la_anh_dai_dien = true;
    }
    setLocalImages(updated);
    onChange?.(updated);
  };

  const setAsMain = (idx) => {
    const updated = localImages.map((img, i) => ({
      ...img,
      la_anh_dai_dien: i === idx,
    }));
    setLocalImages(updated);
    onChange?.(updated);
  };

  return (
    <div className="space-y-4">
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
        className="flex items-center justify-center px-4 py-2 font-semibold rounded-lg bg-gray-200 text-slate-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-slate-200 dark:hover:bg-gray-500 transition-colors duration-300 shadow"
      >
        <UploadCloud className="h-5 w-5 mr-2" />
        Chọn ảnh
      </button>

      {localImages.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {localImages.map((img, idx) => {
            const src = img.previewUrl || img.url;
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
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute -top-2 -right-2 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <XCircle className="h-6 w-6" />
                </button>
                {!img.la_anh_dai_dien && (
                  <button
                    type="button"
                    onClick={() => setAsMain(idx)}
                    className="absolute bottom-1 left-1 right-1 bg-blue-500 text-white text-xs py-1 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    Đặt làm chính
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-500 dark:text-slate-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <UploadCloud className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>Chưa có ảnh nào được chọn</p>
          <p className="text-sm mt-1">
            Ảnh sẽ được upload khi bạn lưu sản phẩm
          </p>
        </div>
      )}
    </div>
  );
};

export default VariantImageUpload;
