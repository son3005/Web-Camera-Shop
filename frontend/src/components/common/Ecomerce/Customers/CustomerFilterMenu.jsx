// src/components/common/Ecomerce/Customers/CustomerFilterMenu.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

// Danh sách trạng thái có trong hệ thống
const ALL_STATUSES = ["Active", "Returning", "Blocked"];

/**
 * Menu bên phải: Lọc & Sắp xếp (khớp API getCustomers)
 * - statuses: string[]
 * - priceRange: { min,max }
 * - dateRange:  { start,end }
 * - dateSort: "default" | "asc" | "desc"
 * - priceSort: "default" | "asc" | "desc"
 */
export default function CustomerFilterMenu({
  initialFilters,
  onApply,
  onClose,
}) {
  const [temp, setTemp] = useState(initialFilters);

  // Bật/tắt 1 trạng thái
  const toggle = (name) => {
    const set = new Set(temp.statuses);
    set.has(name) ? set.delete(name) : set.add(name);
    setTemp((p) => ({ ...p, statuses: Array.from(set) }));
  };

  // Cập nhật range (dateRange / priceRange)
  const setRange = (group, field, value) => {
    setTemp((p) => ({ ...p, [group]: { ...p[group], [field]: value } }));
  };

  // Bật/tắt sort: nếu đang chọn thì trả về "default"
  const toggleSort = (key, val) => {
    setTemp((p) => ({ ...p, [key]: p[key] === val ? "default" : val }));
  };

  // Reset về giá trị mặc định
  const reset = () =>
    setTemp({
      statuses: [],
      dateSort: "default",
      priceSort: "default",
      priceRange: { min: "", max: "" },
      dateRange: { start: "", end: "" },
    });

  // Áp dụng filter tạm => filter chính
  const apply = () => {
    onApply(temp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* Overlay mờ */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel lọc bên phải */}
      <div className="relative w-full max-w-sm bg-white shadow-2xl p-6 flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200/80">
          <h3 className="text-lg font-bold text-slate-900">Lọc & Sắp xếp</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nội dung filter */}
        <div className="flex-1 overflow-y-auto space-y-6 py-6 pr-2 -mr-2">
          {/* Trạng thái */}
          <div>
            <div className="text-sm font-semibold text-slate-700">
              Trạng thái
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggle(s)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    temp.statuses.includes(s)
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-sm"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sắp xếp theo ngày */}
          <div>
            <div className="text-sm font-semibold text-slate-700">
              Sắp xếp theo ngày
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => toggleSort("dateSort", "desc")}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  temp.dateSort === "desc"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                Mới nhất
              </button>
              <button
                onClick={() => toggleSort("dateSort", "asc")}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  temp.dateSort === "asc"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                Cũ nhất
              </button>
            </div>
          </div>

          {/* Sắp xếp theo tổng chi */}
          <div>
            <div className="text-sm font-semibold text-slate-700">
              Sắp xếp theo tổng chi
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => toggleSort("priceSort", "asc")}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  temp.priceSort === "asc"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                Thấp → Cao
              </button>
              <button
                onClick={() => toggleSort("priceSort", "desc")}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  temp.priceSort === "desc"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                Cao → Thấp
              </button>
            </div>
          </div>

          {/* Khoảng ngày tạo */}
          <div>
            <div className="text-sm font-semibold text-slate-700">
              Khoảng ngày tạo
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="date"
                value={temp.dateRange.start}
                onChange={(e) => setRange("dateRange", "start", e.target.value)}
                className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
              />
              <input
                type="date"
                value={temp.dateRange.end}
                onChange={(e) => setRange("dateRange", "end", e.target.value)}
                min={temp.dateRange.start}
                className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
              />
            </div>
          </div>

          {/* Khoảng chi tiêu */}
          <div>
            <div className="text-sm font-semibold text-slate-700">
              Khoảng chi tiêu (đ)
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                placeholder="Từ"
                value={temp.priceRange?.min ?? ""}
                onChange={(e) => setRange("priceRange", "min", e.target.value)}
                className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
              />
              <input
                type="number"
                placeholder="Đến"
                value={temp.priceRange?.max ?? ""}
                min={temp.priceRange?.min ?? ""}
                onChange={(e) => setRange("priceRange", "max", e.target.value)}
                className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
              />
            </div>
          </div>
        </div>

        {/* Footer nút hành động */}
        <div className="flex gap-2 pt-4 border-t border-slate-200/80">
          <button
            onClick={reset}
            className="w-1/2 py-2.5 rounded-lg border border-slate-300 bg-white font-semibold text-sm text-slate-700 hover:bg-slate-50 transition"
          >
            Thiết lập lại
          </button>
          <button
            onClick={apply}
            className="w-1/2 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:from-emerald-600 hover:to-teal-600 shadow-md transition"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
