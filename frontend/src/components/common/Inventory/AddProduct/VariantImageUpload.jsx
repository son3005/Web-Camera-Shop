import React, { useRef } from "react";
import { X, Plus } from "lucide-react";

const VariantImageUpload = ({ images = [], onChange }) => {
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    const updated = [...images, ...newFiles];
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-3">
          {images.map((file, idx) => {
            const url = URL.createObjectURL(file);
            return (
              <div
                key={idx}
                className="relative rounded-lg overflow-hidden shadow-md bg-white/30 backdrop-blur-sm border border-white/20"
              >
                <img
                  src={url}
                  alt={`variant-${idx}`}
                  className="w-full h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload button */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 shadow-md"
        >
          <Plus size={18} /> Add Images
        </button>
        {images.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {images.length} image(s)
          </p>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

export default VariantImageUpload;
