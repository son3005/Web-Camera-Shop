// src/components/common/Ecomerce/Customers/CustomerFilterMenu.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

// Khớp với mock API hiện tại
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

  // bật/tắt 1 trạng thái
  const toggle = (name) => {
    const set = new Set(temp.statuses);
    set.has(name) ? set.delete(name) : set.add(name);
    setTemp((p) => ({ ...p, statuses: Array.from(set) }));
  };

  // set khoảng (dateRange/priceRange)
  const setRange = (group, field, value) => {
    setTemp((p) => ({ ...p, [group]: { ...p[group], [field]: value } }));
  };

  // bật/tắt sort
  const toggleSort = (key, val) => {
    setTemp((p) => ({ ...p, [key]: p[key] === val ? "default" : val }));
  };

  // Reset về default (ĐÃ đổi spend* -> price*)
  const reset = () =>
    setTemp({
      statuses: [],
      dateSort: "default",
      priceSort: "default",
      priceRange: { min: "", max: "" },
      dateRange: { start: "", end: "" },
    });

  const apply = () => {
    onApply(temp); // truyền đúng keys mà API kỳ vọng
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 shadow-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center pb-4 border-b border-black/10 dark:border-white/10">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Lọc & Sắp xếp
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 py-6 pr-2 -mr-2">
          {/* Trạng thái */}
          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Trạng thái
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggle(s)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    temp.statuses.includes(s)
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sắp xếp theo ngày */}
          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Sắp xếp theo ngày
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => toggleSort("dateSort", "desc")}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  temp.dateSort === "desc"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                Mới nhất
              </button>
              <button
                onClick={() => toggleSort("dateSort", "asc")}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  temp.dateSort === "asc"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                Cũ nhất
              </button>
            </div>
          </div>

          {/* Sắp xếp theo tổng chi */}
          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Sắp xếp theo tổng chi
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => toggleSort("priceSort", "asc")}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  temp.priceSort === "asc"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                Thấp → Cao
              </button>
              <button
                onClick={() => toggleSort("priceSort", "desc")}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  temp.priceSort === "desc"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                Cao → Thấp
              </button>
            </div>
          </div>

          {/* Khoảng ngày tạo */}
          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Khoảng ngày tạo
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="date"
                value={temp.dateRange.start}
                onChange={(e) => setRange("dateRange", "start", e.target.value)}
                className="w-1/2 p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm"
              />
              <input
                type="date"
                value={temp.dateRange.end}
                onChange={(e) => setRange("dateRange", "end", e.target.value)}
                min={temp.dateRange.start}
                className="w-1/2 p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Khoảng chi tiêu */}
          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Khoảng chi tiêu (đ)
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                placeholder="Từ"
                value={temp.priceRange?.min ?? ""}
                onChange={(e) => setRange("priceRange", "min", e.target.value)}
                className="w-1/2 p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="Đến"
                value={temp.priceRange?.max ?? ""}
                min={temp.priceRange?.min ?? ""}
                onChange={(e) => setRange("priceRange", "max", e.target.value)}
                className="w-1/2 p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-4 border-t border-black/10 dark:border-white/10">
          <button
            onClick={reset}
            className="w-1/2 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Thiết lập lại
          </button>
          <button
            onClick={apply}
            className="w-1/2 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
