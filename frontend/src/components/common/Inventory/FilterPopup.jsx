// src/components/common/Inventory/FilterPopup.jsx
import React, { useRef, useEffect } from "react";
import { X, ArrowDownUp, SlidersHorizontal, Boxes } from "lucide-react";

const SortButton = ({ onClick, isActive, children }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border backdrop-blur-md transition-all duration-300
      ${
        isActive
          ? "bg-gradient-to-r from-emerald-500 to-slate-600 text-white shadow-md shadow-emerald-500/30 border-transparent scale-[1.02]"
          : "bg-white/40 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200 border-slate-200/30 dark:border-slate-600/40 hover:bg-white/60 dark:hover:bg-slate-700/60"
      }`}
  >
    {children}
  </button>
);

const brands = ["canon", "sony", "nikon", "fujifilm", "panasonic"];
const stock_status = ["Còn hàng", "Sắp hết", "Hết hàng"];

const CheckboxOption = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer bg-white/40 dark:bg-slate-700/40 hover:bg-white/60 dark:hover:bg-slate-700/60 transition">
    <input
      type="checkbox"
      className="h-4 w-4 rounded accent-emerald-500"
      checked={checked}
      onChange={onChange}
    />
    <span className="text-slate-700 dark:text-slate-200">{label}</span>
  </label>
);

const FilterPopup = ({
  onClose,
  localFilters,
  handleSortChange,
  handleMultiSelectChange,
  handleRangeChange,
  onApply,
  onReset,
}) => {
  const { sortBy, status, priceRange, brands, stockStatus } = localFilters;
  const popupRef = useRef(null);

  // Chặn click bên trong để không đóng popup
  useEffect(() => {
    const handleClick = (e) => {
      if (popupRef.current && popupRef.current.contains(e.target)) {
        e.stopPropagation();
      }
    };
    document.addEventListener("mousedown", handleClick, true);
    return () => document.removeEventListener("mousedown", handleClick, true);
  }, []);

  return (
    <div
      ref={popupRef}
      className="absolute top-full right-0 mt-2 w-[500px] rounded-2xl border border-white/20 dark:border-slate-700/40
                bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl shadow-2xl shadow-emerald-500/20
                transition-all z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/20 dark:border-slate-700/40 flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <SlidersHorizontal size={20} /> Bộ lọc & Sắp xếp
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-slate-700/60 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
        {/* Trạng thái kinh doanh */}
        <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Trạng thái
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <CheckboxOption
              label="Đang kinh doanh"
              checked={status.includes("active")}
              onChange={() => handleMultiSelectChange("status", "active")}
            />
            <CheckboxOption
              label="Ngừng kinh doanh"
              checked={status.includes("inactive")}
              onChange={() => handleMultiSelectChange("status", "inactive")}
            />
          </div>
        </div>

        {/* Thương hiệu */}
        <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Thương hiệu
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {brandOptions.map((brand) => (
              <CheckboxOption
                key={brand}
                label={brand}
                checked={brands.includes(brand)}
                onChange={() => handleMultiSelectChange("brands", brand)}
              />
            ))}
          </div>
        </div>

        {/* Trạng thái tồn kho */}
        <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Boxes size={16} /> Tồn kho
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {stockStatusOptions.map((state) => (
              <CheckboxOption
                key={state.key}
                label={state.label}
                checked={stockStatus.includes(state.key)}
                onChange={() => handleMultiSelectChange("stockStatus", state.key)}
              />
            ))}
          </div>
        </div>

        {/* Sắp xếp */}
        <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <ArrowDownUp size={16} /> Sắp xếp theo
          </h4>
          <div className="flex gap-3">
            <SortButton
              onClick={() => handleSortChange("name", "asc")}
              isActive={sortBy.name === "asc"}
            >
              Tên A-Z
            </SortButton>
            <SortButton
              onClick={() => handleSortChange("name", "desc")}
              isActive={sortBy.name === "desc"}
            >
              Tên Z-A
            </SortButton>
          </div>
          <div className="flex gap-3 mt-3">
            <SortButton
              onClick={() => handleSortChange("price", "asc")}
              isActive={sortBy.price === "asc"}
            >
              Giá thấp
            </SortButton>
            <SortButton
              onClick={() => handleSortChange("price", "desc")}
              isActive={sortBy.price === "desc"}
            >
              Giá cao
            </SortButton>
          </div>
        </div>

        {/* Khoảng giá */}
        <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Khoảng giá
          </h4>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="Từ"
              value={priceRange.min}
              onChange={(e) =>
                handleRangeChange("priceRange", "min", e.target.value || "")
              }
              className="flex-1 px-4 py-2 rounded-lg border border-white/30 dark:border-slate-600/40
                        bg-white/50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200
                        placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <input
              type="number"
              placeholder="Đến"
              value={priceRange.max}
              onChange={(e) =>
                handleRangeChange("priceRange", "max", e.target.value || "")
              }
              className="flex-1 px-4 py-2 rounded-lg border border-white/30 dark:border-slate-600/40
                        bg-white/50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200
                        placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/20 dark:border-slate-700/40 bg-gradient-to-r from-emerald-500/20 to-slate-600/20 backdrop-blur-lg flex gap-4 rounded-b-2xl">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-2.5 rounded-lg font-semibold bg-white/50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-700/60 transition"
        >
          Xóa lọc
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-emerald-500 to-slate-600 text-white shadow-lg hover:opacity-90 transition"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default FilterPopup;
