// VariantManager.jsx
import React from "react";
import VariantImageUpload from "./VariantImageUpload";

const VariantManager = ({ variants = [], onChange, readOnly = false }) => {
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onChange && onChange(newVariants);
  };

  const handleAddVariant = () => {
    onChange &&
      onChange([
        ...variants,
        { style: "", color: "", price: "", quantity: "", images: [] },
      ]);
  };

  const handleRemoveVariant = (index) => {
    onChange && onChange(variants.filter((_, i) => i !== index));
  };

  // --- Tối ưu hóa class cho các input với Light & Dark mode ---
  const inputBaseStyle =
    "w-full rounded-lg px-3 py-2 focus:outline-none transition-all duration-300";

  const lightInputStyle =
    "bg-white/40 border border-black/20 text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500";

  const darkInputStyle =
    "dark:bg-black/20 dark:border dark:border-white/30 dark:text-white dark:placeholder:text-gray-300 dark:focus:ring-2 dark:focus:ring-cyan-400";
  
  const readOnlyInputStyle = "bg-gray-300/50 dark:bg-gray-500/20 cursor-not-allowed text-gray-500 dark:text-gray-400";


  return (
    <div className="space-y-6 p-4">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white drop-shadow-md">
        Các biến thể sản phẩm
      </h3>
      {variants.map((variant, idx) => (
        <div
          key={idx}
          // --- CORE: Hiệu ứng Glassmorphism cho cả Light & Dark Mode ---
          className="p-6 
                     bg-white/30 dark:bg-black/20  // Nền kính
                     backdrop-blur-lg              // Hiệu ứng mờ
                     border border-black/10 dark:border-white/20 // Viền kính
                     rounded-2xl shadow-lg space-y-4 transition-all duration-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Style (e.g., Body Only)"
              value={variant.style}
              disabled={readOnly}
              onChange={(e) =>
                handleVariantChange(idx, "style", e.target.value)
              }
              className={`${inputBaseStyle} ${lightInputStyle} ${darkInputStyle} ${readOnly ? readOnlyInputStyle : ""}`}
            />
            <input
              type="text"
              placeholder="Color (e.g., Black)"
              value={variant.color}
              disabled={readOnly}
              onChange={(e) =>
                handleVariantChange(idx, "color", e.target.value)
              }
              className={`${inputBaseStyle} ${lightInputStyle} ${darkInputStyle} ${readOnly ? readOnlyInputStyle : ""}`}
            />
            <input
              type="number"
              placeholder="Price"
              value={variant.price}
              disabled={readOnly}
              onChange={(e) =>
                handleVariantChange(idx, "price", e.target.value)
              }
              className={`${inputBaseStyle} ${lightInputStyle} ${darkInputStyle} ${readOnly ? readOnlyInputStyle : ""}`}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={variant.quantity}
              disabled={readOnly}
              onChange={(e) =>
                handleVariantChange(idx, "quantity", e.target.value)
              }
              className={`${inputBaseStyle} ${lightInputStyle} ${darkInputStyle} ${readOnly ? readOnlyInputStyle : ""}`}
            />
          </div>

          <VariantImageUpload
            images={variant.images}
            onChange={(imgs) => handleVariantChange(idx, "images", imgs)}
            readOnly={readOnly}
          />

          {!readOnly && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleRemoveVariant(idx)}
                // --- Nút Remove với style cho cả 2 mode ---
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 dark:bg-red-500/60 dark:hover:bg-red-500/90 transition-colors duration-300 shadow-md"
              >
                Remove Variant
              </button>
            </div>
          )}
        </div>
      ))}
      {!readOnly && (
        <button
          type="button"
          onClick={handleAddVariant}
          // --- Nút Add đã được cập nhật với theme màu Emerald ---
          className="w-full mt-4 px-5 py-2.5 font-bold rounded-lg 
                    text-white
                    bg-gradient-to-br from-emerald-400 to-emerald-600      
                    dark:from-emerald-500 dark:to-emerald-700               
                    shadow-lg hover:shadow-xl
                    hover:shadow-emerald-500/50                              
                    dark:hover:shadow-emerald-500/40                         
                    hover:scale-105
                    transition-all duration-300"
        >
          + Thêm biến thể mới
        </button>
      )}
    </div>
  );
};

export default VariantManager;