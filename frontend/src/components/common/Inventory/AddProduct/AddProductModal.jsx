// src/components/common/Inventory/AddProduct/AddProductModal.jsx

import React, { useState, useEffect } from "react";
import { X, Save, Ban } from "lucide-react";
import DescriptionEditor from "./DescriptionEditor";
import PropertyForm from "./PropertyForm";
import VariantManager from "./VariantManager";

const brandOptions = ["Canon", "Nikon", "Sony", "Fujifilm", "Panasonic", "Olympus"];

const AddProductModal = ({ onClose, mode = "add", product = null, onSave }) => {
  const emptyForm = {
    id: "", name: "", brand: "", description: "", specs: {},
    variants: [{ style: "", color: "", price: "", quantity: "", images: [] }],
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (mode === "add") {
      setFormData(emptyForm);
    } else if (product) {
      setFormData({ ...product });
    }
  }, [mode, product]);

  const isView = mode === "view";

  const saveHandler = () => {
    if (!formData.name || !formData.brand) {
      alert("Vui lòng nhập tên và thương hiệu sản phẩm.");
      return;
    }
    const normalized = {
      ...formData,
      variants: (formData.variants || []).map((v) => ({
        ...v,
        price: Number(v.price) || 0,
        quantity: Number(v.quantity) || 0,
      })),
    };
    onSave && onSave(normalized);
    onClose && onClose();
  };
  
  const baseInputStyle = "w-full px-3 py-2.5 rounded-lg border text-sm transition-colors duration-300 focus:outline-none focus:ring-2";
  const activeInputStyle = "bg-black/5 dark:bg-white/10 border-black/20 dark:border-white/20 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-emerald-500 dark:focus:ring-emerald-500";
  const readOnlyInputStyle = "bg-gray-500/10 dark:bg-gray-700/20 cursor-not-allowed text-slate-500 dark:text-slate-400";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
      <div className="relative max-w-6xl w-full mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-slate-700 z-10 max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === "add" ? "Thêm sản phẩm mới" : mode === "edit" ? "Chỉnh sửa sản phẩm" : "Chi tiết sản phẩm"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-500/10 dark:hover:bg-slate-400/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent dark:scrollbar-thumb-gray-500/50">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-10 gap-4 p-4 bg-white/50 dark:bg-white/5 rounded-xl">
                <div className="sm:col-span-6">
                  <input type="text" placeholder="Tên sản phẩm (ví dụ: Canon EOS R5)" value={formData.name} disabled={isView} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`${baseInputStyle} ${isView ? readOnlyInputStyle : activeInputStyle}`} />
                </div>
                <div className="sm:col-span-4">
                  <select value={formData.brand} disabled={isView} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className={`${baseInputStyle} ${isView ? readOnlyInputStyle : activeInputStyle}`}>
                    <option value="" disabled>Chọn thương hiệu</option>
                    {brandOptions.map((b) => (<option key={b} value={b}>{b}</option>))}
                  </select>
                </div>
              </div>

              <VariantManager variants={formData.variants} onChange={(variants) => setFormData({ ...formData, variants })} readOnly={isView} />

              <div>
                <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">Mô tả sản phẩm</h3>
                <DescriptionEditor value={formData.description} onChange={(val) => setFormData({ ...formData, description: val })} readOnly={isView} />
              </div>
            </div>
            <div className="lg:col-span-4">
              <PropertyForm properties={formData.specs} onChange={(specs) => setFormData({ ...formData, specs })} readOnly={isView} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
          <button onClick={onClose} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            <Ban size={18} />
            {isView ? "Đóng" : "Hủy"}
          </button>
          {!isView && (
            <button onClick={saveHandler} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-bold bg-gradient-to-br from-emerald-600 to-slate-800 hover:from-emerald-500 hover:to-slate-700 dark:from-emerald-500 dark:to-slate-700 dark:hover:from-emerald-400 dark:hover:to-slate-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
              <Save size={18} />
              Lưu thay đổi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;