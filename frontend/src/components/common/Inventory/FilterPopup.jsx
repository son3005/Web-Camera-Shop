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

const CheckboxOption = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer bg-white/40 dark:bg-slate-700/40 hover:bg-white/80 dark:hover:bg-slate-700/80 transition">
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
  danhMucList = [],
  thuongHieuList = [],
}) => {
  // luôn có object để destructure
  const {
    sortBy = { name: null, price: null },
    status = [],
    stockStatus = [],
    priceRange = { min: "", max: "" },
    danh_muc_ids = [],
    thuong_hieu_ids = [],
  } = localFilters || {};

  const popupRef = useRef(null);

  // chặn click bên trong để không đóng popup
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
      className="absolute top-full right-0 mt-2 w-[320px] rounded-2xl border border-white/20 dark:border-slate-700/40
                bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl shadow-emerald-500/10
                transition-all z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/20 dark:border-slate-700/40 flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <SlidersHorizontal size={18} /> Bộ lọc & Sắp xếp
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-slate-700/60 transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5 max-h-[60vh] overflow-y-auto scrollbar-thin">
        {/* Trạng thái kinh doanh */}
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
            Trạng thái
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <CheckboxOption
              label="Đang kinh doanh"
              checked={status.includes("dang_ban")}
              onChange={() => handleMultiSelectChange("status", "dang_ban")}
            />
            <CheckboxOption
              label="Ngừng kinh doanh"
              checked={status.includes("ngung_ban")}
              onChange={() => handleMultiSelectChange("status", "ngung_ban")}
            />
          </div>
        </div>

        {/* Danh mục */}
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
            Danh mục
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {danhMucList.length > 0 ? (
              danhMucList.map((danhMuc) => (
                <CheckboxOption
                  key={danhMuc.id}
                  label={danhMuc.ten_danh_muc}
                  checked={danh_muc_ids.includes(danhMuc.id)}
                  onChange={() =>
                    handleMultiSelectChange("danh_muc_ids", danhMuc.id)
                  }
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-2">
                Không có danh mục
              </p>
            )}
          </div>
        </div>

        {/* Thương hiệu */}
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
            Thương hiệu
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {thuongHieuList.length > 0 ? (
              thuongHieuList.map((thuongHieu) => (
                <CheckboxOption
                  key={thuongHieu.id}
                  label={thuongHieu.ten_thuong_hieu}
                  checked={thuong_hieu_ids.includes(thuongHieu.id)}
                  onChange={() =>
                    handleMultiSelectChange("thuong_hieu_ids", thuongHieu.id)
                  }
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-2">
                Không có thương hiệu
              </p>
            )}
          </div>
        </div>

        {/* Trạng thái tồn kho */}
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Boxes size={16} /> Tồn kho
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <CheckboxOption
              label="Còn hàng"
              checked={stockStatus.includes("in_stock")}
              onChange={() =>
                handleMultiSelectChange("stockStatus", "in_stock")
              }
            />
            <CheckboxOption
              label="Sắp hết"
              checked={stockStatus.includes("low_stock")}
              onChange={() =>
                handleMultiSelectChange("stockStatus", "low_stock")
              }
            />
            <CheckboxOption
              label="Hết hàng"
              checked={stockStatus.includes("out_of_stock")}
              onChange={() =>
                handleMultiSelectChange("stockStatus", "out_of_stock")
              }
            />
          </div>
        </div>

        {/* Sắp xếp */}
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <ArrowDownUp size={16} /> Sắp xếp theo
          </h4>
          <div className="grid grid-cols-2 gap-2">
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
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
            Khoảng giá (VNĐ)
          </h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Từ"
              value={priceRange.min}
              onChange={(e) =>
                handleRangeChange("priceRange", "min", e.target.value || "")
              }
              className="w-[100px] px-2 py-1.5 rounded-lg border border-white/30 dark:border-slate-600/40
                        bg-white/50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200
                        placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <span className="text-slate-500">-</span>
            <input
              type="number"
              placeholder="Đến"
              value={priceRange.max}
              onChange={(e) =>
                handleRangeChange("priceRange", "max", e.target.value || "")
              }
              className="w-[100px] px-2 py-1.5 rounded-lg border border-white/30 dark:border-slate-600/40
                        bg-white/50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200
                        placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/20 dark:border-slate-700/40 bg-gradient-to-r from-emerald-500/20 to-slate-600/20 backdrop-blur-lg flex gap-3 rounded-b-2xl">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-2 rounded-lg font-medium bg-white/50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-700/60 transition"
        >
          Xóa lọc
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 py-2 rounded-lg font-medium bg-gradient-to-r from-emerald-500 to-slate-600 text-white shadow-lg hover:scale-110 hover:shadow-emerald-500/30 transition"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default FilterPopup;
