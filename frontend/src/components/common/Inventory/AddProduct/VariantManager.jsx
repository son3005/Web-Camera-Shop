import React from "react";
import { Plus, Trash2 } from "lucide-react";
import VariantImageUpload from "./VariantImageUpload";

const VariantManager = ({ variants, onChange }) => {
  const updateVariant = (index, key, value) => {
    const updated = [...variants];
    updated[index][key] = value;
    onChange(updated);
  };

  const addVariant = () => {
    onChange([
      ...variants,
      { style: "", color: "", price: "", quantity: "", images: [] },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) return;
    const updated = variants.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Variants
      </h3>

      {variants.map((variant, idx) => (
        <div
          key={idx}
          className="relative rounded-xl p-5 space-y-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md shadow-md border border-white/20 dark:border-gray-700/20"
        >
          {/* Style + Color */}
          <div className="grid grid-cols-10 gap-4">
            <div className="col-span-7">
              <input
                type="text"
                placeholder="Style"
                value={variant.style}
                onChange={(e) => updateVariant(idx, "style", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/20 dark:bg-gray-700/30 backdrop-blur-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="col-span-3">
              <input
                type="text"
                placeholder="Color"
                value={variant.color}
                onChange={(e) => updateVariant(idx, "color", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/20 dark:bg-gray-700/30 backdrop-blur-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Price + Quantity */}
          <div className="grid grid-cols-10 gap-4">
            <div className="col-span-7">
              <input
                type="number"
                placeholder="Price"
                value={variant.price}
                onChange={(e) => updateVariant(idx, "price", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/20 dark:bg-gray-700/30 backdrop-blur-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                placeholder="Quantity"
                value={variant.quantity}
                onChange={(e) => updateVariant(idx, "quantity", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/20 dark:bg-gray-700/30 backdrop-blur-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Upload images */}
          <VariantImageUpload
            images={variant.images}
            onChange={(imgs) => updateVariant(idx, "images", imgs)}
          />

          {/* Delete button */}
          {variants.length > 1 && (
            <button
              type="button"
              onClick={() => removeVariant(idx)}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      ))}

      {/* Add Variant Button */}
      <button
        type="button"
        onClick={addVariant}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 shadow-md"
      >
        <Plus size={18} /> Add Variant
      </button>
    </div>
  );
};

export default VariantManager;
