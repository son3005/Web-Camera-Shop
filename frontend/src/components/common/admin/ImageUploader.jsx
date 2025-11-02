// src/components/admin/inventory/ImageUploader.jsx
import React, { useState } from 'react';
import { useLaySignature } from '../../../hooks/use_upload';
import { toast } from 'react-hot-toast';

export default function ImageUploader({ onUploadSuccess, existingImages = [], onDelete, onSetDaiDien }) {
  const [uploading, setUploading] = useState(false);
  const { mutate: laySignature } = useLaySignature();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      // Lấy chữ ký một lần cho tất cả (giả sử signature dùng chung)
      const { signature, timestamp, api_key, folder } = await new Promise((resolve, reject) => {
        laySignature(folder, {
          onSuccess: resolve,
          onError: reject,
        });
      });

      // Upload từng file
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', api_key);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', folder);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Upload thất bại');

        // Trả về từng ảnh
        onUploadSuccess({
          url: data.secure_url,
          public_id: data.public_id,
          alt_text: file.name.split('.').slice(0, -1).join('.'),
          la_anh_dai_dien: existingImages.length + files.indexOf(file) === 0, // Đầu tiên làm đại diện mặc định
        });
      }

      toast.success(`Upload ${files.length} ảnh thành công!`);
    } catch (err) {
      toast.error(err.message || 'Lỗi upload ảnh');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium mb-1">Hình ảnh (chọn nhiều file)</label>
      <input
        type="file"
        accept="image/*"
        multiple // Cho phép chọn nhiều file
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {uploading && <p className="text-sm text-blue-600 mt-1">Đang upload...</p>}

      {/* Danh sách ảnh */}
      <div className="flex flex-wrap gap-3 mt-3">
        {existingImages.map((img, idx) => (
          <div key={img.public_id || idx} className="relative group w-24">
            <img
              src={img.url}
              alt={img.alt_text || 'Product'}
              className="w-24 h-24 object-cover rounded border"
            />
            <div className="absolute bottom-1 left-1 flex items-center">
              <input
                type="radio"
                name="dai_dien"
                checked={img.la_anh_dai_dien}
                onChange={() => onSetDaiDien(idx)}
                className="mr-1"
              />
              <span className="text-xs text-gray-700">Đại diện</span>
            </div>
            <button
              type="button"
              onClick={() => onDelete(img)}
              className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}