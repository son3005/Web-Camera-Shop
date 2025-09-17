import React, { useState } from "react";
import { X } from "lucide-react";
import DescriptionEditor from "./DescriptionEditor";
import PropertyForm from "./PropertyForm";
import VariantManager from "./VariantManager";

const brandOptions = ["Canon", "Nikon", "Sony", "Fujifilm"]; // sau này fetch DB

const AddProductModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    specs: {},
    variants: [{ style: "", color: "", price: "", quantity: "", images: [] }],
  });

  return (
    <div className="max-w-[1200px] mx-auto bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black/50 dark:text-slate-100/90">
          Add Product
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30"
        >
          <X size={22} className="text-black/50 dark:text-black/50" />
        </button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-10 gap-8">
        {/* Left - 6/10 */}
        <div className="col-span-6 space-y-6">
          {/* Row 1: Name + Brand */}
          <div className="grid grid-cols-10 gap-4">
            <div className="col-span-6">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/20 dark:bg-gray-700/30 backdrop-blur-sm text-black/50 dark:text-black/50 placeholder-black/50 focus:ring-2 focus:ring-blue-400 font-semibold"
              />
            </div>
            <div className="col-span-4">
              <select
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/20 dark:bg-gray-700/30 backdrop-blur-sm text-black/50 dark:text-black/50 placeholder-black/50 focus:ring-2 focus:ring-purple-400 font-semibold"
              >
                <option value="">Select Brand</option>
                {brandOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Variants with images */}
          <VariantManager
            variants={formData.variants}
            onChange={(variants) => setFormData({ ...formData, variants })}
          />

          {/* Description */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-slate-200/70 dark:text-slate-100">
              Description
            </h3>
            <DescriptionEditor
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
            />
          </div>
        </div>

        {/* Right - 4/10 */}
        <div className="col-span-4">
          <PropertyForm
            properties={formData.specs}
            onChange={(specs) => setFormData({ ...formData, specs })}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-white/20 dark:bg-gray-700/30 text-black/50 dark:text-black/50 hover:bg-white/30 dark:hover:bg-gray-700/50 font-semibold"
        >
          Cancel
        </button>
        <button className="px-5 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 shadow-md">
          Save
        </button>
      </div>
    </div>
  );
};

export default AddProductModal;
