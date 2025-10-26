// src/components/common/Inventory/FilterPopup.jsx

import React, { useRef, useEffect, useState } from "react";
import { X, ArrowDownUp, SlidersHorizontal, Boxes } from "lucide-react";

// (Component SortButton của bạn - Giữ nguyên)
const SortButton = ({ onClick, isActive, children }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`w-full py-2 px-3 text-sm font-medium rounded-lg border backdrop-blur-md transition-all duration-300
      ${
        isActive
          ? "bg-gradient-to-r from-emerald-500 to-slate-600 text-white shadow-md shadow-emerald-500/30 border-transparent scale-[1.02]"
          : "bg-white/50 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200 border-slate-200/30 dark:border-slate-600/40 hover:bg-white/70 dark:hover:bg-slate-700/60"
      }`}
  >
    {children}
  </button>
);

// (Các hằng số của bạn - Giữ nguyên)
const brandOptions = ["canon", "sony", "nikon", "fujifilm", "panasonic"];
const stockStatusOptions = [
  { key: "in_stock", label: "Còn hàng" },
  { key: "low_stock", label: "Sắp hết" },
  { key: "out_of_stock", label: "Hết hàng" },
];

// (Component CheckboxOption của bạn - Giữ nguyên)
const CheckboxOption = ({ id, label, checked, onChange }) => (
  <label
    htmlFor={id}
    className="flex items-center gap-3 px-3 py-2.5 rounded-lg 
             bg-white/50 dark:bg-slate-700/40
               border border-transparent 
               has-[:checked]:bg-emerald-500/20 dark:has-[:checked]:bg-emerald-500/30
               has-[:checked]:border-emerald-500/50
               cursor-pointer transition-all"
  >
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-400 text-emerald-600 focus:ring-emerald-500"
    />
    <span className="text-sm font-medium text-slate-800 dark:text-slate-100 capitalize">
      {label}
    </span>
  </label>
);


// --- (1) SỬA LẠI PROPS CỦA COMPONENT ---
const FilterPopup = ({ 
    onClose, 
    filters, // State từ cha
    setFilters, // Hàm set state của cha (cho sort, checkbox)
    onApplyFilters, // (MỚI) Hàm áp dụng filter (cho price)
    onResetFilters  // (MỚI) Hàm reset toàn bộ
}) => {
  const popupRef = useRef();

  // --- (2) TẠO LOCAL STATE CHO GIÁ ---
  // Đồng bộ state từ cha vào local state khi component mount
  const [localPriceRange, setLocalPriceRange] = useState({
      min: filters.priceRange[0] || "",
      max: filters.priceRange[1] || ""
  });

  // (Hook để đóng khi click ra ngoài - Giữ nguyên)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);


  // --- (3) CÁC HÀM HANDLER ---
  const handleSortChange = (sortKey) => {
      setFilters(prev => ({ ...prev, sort: sortKey }));
  };

  const handleCheckboxChange = (key, value) => {
      setFilters(prev => ({
          ...prev,
          [key]: prev[key].includes(value)
              ? prev[key].filter(item => item !== value)
              : [...prev[key], value]
      }));
  };

  const handleRangeChange = (subKey, value) => {
      // Chỉ cập nhật local state, không gọi setFilters
      setLocalPriceRange(prev => ({ ...prev, [subKey]: value ? parseInt(value) : "" }));
  };

  // --- (4) HÀM ÁP DỤNG VÀ RESET (Kết nối với props) ---
  const handleApply = (e) => {
      e.stopPropagation();
      // Báo cho cha (Inventory) cập nhật state
      onApplyFilters({ 
          priceRange: [localPriceRange.min, localPriceRange.max] 
      }); 
      onClose(); // Đóng popup
  };

  const handleReset = (e) => {
      e.stopPropagation();
      setLocalPriceRange({ min: "", max: "" }); // Reset local state
      onResetFilters(); // Báo cho cha reset state chính
      // (Không đóng popup để user xem kết quả)
  };


  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div
        ref={popupRef}
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col 
                   rounded-2xl shadow-2xl bg-slate-200/80 dark:bg-slate-800/80 
                   border border-white/20 dark:border-slate-700/50"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/20 dark:border-slate-700/40">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Bộ lọc & Sắp xếp
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Sắp xếp */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
              <ArrowDownUp size={16} /> Sắp xếp theo
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* (SỬA) Dùng `filters.sort` để check active */}
              <SortButton onClick={() => handleSortChange("new")} isActive={filters.sort === "new"}>Mới nhất</SortButton>
              <SortButton onClick={() => handleSortChange("price_asc")} isActive={filters.sort === "price_asc"}>Giá tăng dần</SortButton>
              <SortButton onClick={() => handleSortChange("price_desc")} isActive={filters.sort === "price_desc"}>Giá giảm dần</SortButton>
              <SortButton onClick={() => handleSortChange("name_asc")} isActive={filters.sort === "name_asc"}>Tên A-Z</SortButton>
            </div>
          </div>

          {/* Thương hiệu */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
              <SlidersHorizontal size={16} /> Thương hiệu
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {brandOptions.map((brand) => (
                <CheckboxOption
                  key={brand}
                  id={`brand-${brand}`}
                  label={brand}
                  // (SỬA) Dùng `filters.brands` để check
                  checked={filters.brands.includes(brand)}
                  onChange={() => handleCheckboxChange("brands", brand)}
                />
              ))}
            </div>
          </div>

          {/* Tồn kho (File gốc của bạn gọi là "stockStatusOptions" nhưng lại dùng "status" -> tôi sửa lại) */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
              <Boxes size={16} /> Tình trạng kho
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stockStatusOptions.map((status) => (
                <CheckboxOption
                  key={status.key}
                  id={`status-${status.key}`}
                  label={status.label}
                  // (SỬA) Dùng `filters.stockStatus`
                  checked={filters.stockStatus.includes(status.key)}
                  onChange={() => handleCheckboxChange("stockStatus", status.key)}
                />
              ))}
            </div>
          </div>

          {/* Khoảng giá */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-slate-500 dark:text-slate-400 uppercase">
              Khoảng giá
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Từ"
                // (SỬA) Dùng `localPriceRange`
                value={localPriceRange.min}
                onChange={(e) => handleRangeChange("min", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/30 dark:border-slate-600/40
                          bg-white/50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200
                          placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                placeholder="Đến"
                // (SỬA) Dùng `localPriceRange`
                value={localPriceRange.max}
                onChange={(e) => handleRangeChange("max", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/30 dark:border-slate-600/40
                          bg-white/50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200
                          placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/20 dark:border-slate-700/40 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-lg flex gap-3 rounded-b-2xl">
          <button
            type="button"
            // (SỬA) Gọi hàm `handleReset`
            onClick={handleReset}
            className="flex-1 py-2 rounded-lg font-medium bg-white/50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-700/60 transition"
          >
            Xóa lọc
          </button>
          <button
            type="button"
            // (SỬA) Gọi hàm `handleApply`
            onClick={handleApply}
            className="flex-1 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:shadow-lg hover:shadow-emerald-500/20 transition"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;