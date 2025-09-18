// VariantImageUpload.jsx
import React, { useRef } from "react";
// 1. Import icon cần dùng từ thư viện lucide-react
import { UploadCloud, XCircle } from 'lucide-react';

// (Bạn có thể xóa các component SVG thủ công trước đó)

const VariantImageUpload = ({ images = [], onChange, readOnly = false }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onChange && onChange([...images, ...files]);
    }
    event.target.value = null; 
  };

  const handleRemove = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onChange && onChange(newImages);
  };

  const triggerFileSelect = () => !readOnly && fileInputRef.current?.click();

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={readOnly}
      />

      <div className="flex items-center space-x-4">
        {!readOnly && (
          <button
            type="button"
            onClick={triggerFileSelect}
            className="flex items-center justify-center px-4 py-2 font-semibold rounded-lg 
                       bg-gray-200 text-slate-700 hover:bg-gray-300
                       dark:bg-gray-600 dark:text-slate-200 dark:hover:bg-gray-500
                       transition-colors duration-300 shadow"
          >
            {/* 2. Sử dụng icon <UploadCloud /> từ lucide-react */}
            <UploadCloud className="h-5 w-5 mr-2" />
            Tải ảnh lên
          </button>
        )}
        
        {images.length > 0 && (
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Đã chọn {images.length} ảnh.
          </p>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4 p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-600">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={image instanceof File ? URL.createObjectURL(image) : image}
                alt={`preview ${index}`}
                className="w-full h-full object-cover rounded-md shadow-md"
                onLoad={(e) => { if (image instanceof File) URL.revokeObjectURL(e.target.src) }}
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute -top-2 -right-2 p-0.5 rounded-full flex items-center justify-center
                             bg-red-500 text-white 
                             opacity-0 group-hover:opacity-100 
                             transform group-hover:scale-110 transition-all duration-300"
                  aria-label="Remove image"
                >
                  {/* 3. Sử dụng icon <XCircle /> từ lucide-react */}
                  <XCircle className="h-6 w-6" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VariantImageUpload;