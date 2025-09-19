// src/components/common/Orders/FilterMenu.jsx

import React from "react";
import { X, ArrowUpNarrowWide, ArrowDownWideNarrow, Calendar } from "lucide-react";

const ALL_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const FilterMenu = ({ filters, setFilters, onClose }) => {
    const handleStatusChange = (status) => {
        const currentStatuses = new Set(filters.statuses);
        if (currentStatuses.has(status)) {
            currentStatuses.delete(status);
        } else {
            currentStatuses.add(status);
        }
        setFilters(f => ({ ...f, statuses: Array.from(currentStatuses) }));
    };

    const handleReset = () => {
        setFilters({
            statuses: [], priceSort: "default", dateSort: "default",
            priceRange: { min: "", max: "" }, dateRange: { start: "", end: "" }
        });
        onClose();
    };
    
    // --- LOGIC MỚI: Bật/tắt sắp xếp cho từng nút ---
    const handleSortToggle = (sortType, value) => {
        setFilters(prev => ({
            ...prev,
            [sortType]: prev[sortType] === value ? 'default' : value,
        }));
    };
    
    // --- LOGIC MỚI: Ràng buộc input ---
    const handleStartDateChange = (e) => {
        const startDate = e.target.value;
        setFilters(f => ({ ...f, dateRange: { ...f.dateRange, start: startDate, end: (f.dateRange.end && f.dateRange.end < startDate) ? "" : f.dateRange.end } }));
    };
    const handleMinPriceChange = (e) => {
        const minPrice = e.target.value;
        const maxPrice = filters.priceRange.max;
        setFilters(f => ({ ...f, priceRange: { ...f.priceRange, min: minPrice, max: (maxPrice && parseFloat(maxPrice) < parseFloat(minPrice)) ? "" : maxPrice } }));
    };

    // --- Giao diện nút mới ---
    const activeSortClass = "bg-gradient-to-br from-emerald-500 to-slate-700 text-white shadow-md";
    const inactiveSortClass = "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600";

    return (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700 z-20 p-4">
            <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-slate-800 dark:text-slate-100">Bộ lọc & Sắp xếp</h4><button onClick={onClose} className="p-1 rounded-full hover:bg-slate-500/10"><X size={16} /></button></div>
            <div className="space-y-4">
                {/* Lọc trạng thái */}
                <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Trạng thái</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {ALL_STATUSES.map(status => (<label key={status} className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={filters.statuses.includes(status)} onChange={() => handleStatusChange(status)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" /><span className="text-sm text-slate-700 dark:text-slate-300">{status}</span></label>))}
                    </div>
                </div>

                {/* --- Khung sắp xếp theo ngày --- */}
                <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sắp xếp theo ngày</label>
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => handleSortToggle('dateSort', 'desc')} className={`flex-1 p-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${filters.dateSort === 'desc' ? activeSortClass : inactiveSortClass}`}><Calendar size={14}/> Mới nhất</button>
                        <button onClick={() => handleSortToggle('dateSort', 'asc')} className={`flex-1 p-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${filters.dateSort === 'asc' ? activeSortClass : inactiveSortClass}`}><Calendar size={14}/> Cũ nhất</button>
                    </div>
                </div>

                {/* --- Khung sắp xếp theo giá --- */}
                <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sắp xếp theo giá</label>
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => handleSortToggle('priceSort', 'asc')} className={`flex-1 p-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${filters.priceSort === 'asc' ? activeSortClass : inactiveSortClass}`}><ArrowUpNarrowWide size={14}/> Giá thấp</button>
                        <button onClick={() => handleSortToggle('priceSort', 'desc')} className={`flex-1 p-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${filters.priceSort === 'desc' ? activeSortClass : inactiveSortClass}`}><ArrowDownWideNarrow size={14}/> Giá cao</button>
                    </div>
                </div>
                
                {/* Lọc theo ngày */}
                <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Khoảng ngày đặt</label><div className="flex items-center gap-2 mt-1"><input type="date" value={filters.dateRange.start} onChange={handleStartDateChange} className="w-1/2 p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm" /><input type="date" value={filters.dateRange.end} onChange={(e) => setFilters(f => ({...f, dateRange: {...f.dateRange, end: e.target.value}}))} min={filters.dateRange.start} className="w-1/2 p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm" /></div></div>
                {/* Lọc giá */}
                <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Khoảng giá</label><div className="flex items-center gap-2 mt-1"><input type="number" placeholder="Từ" value={filters.priceRange.min} onChange={handleMinPriceChange} className="w-1/2 p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm" /><input type="number" placeholder="Đến" value={filters.priceRange.max} onChange={(e) => setFilters(f => ({...f, priceRange: {...f.priceRange, max: e.target.value}}))} min={filters.priceRange.min} className="w-1/2 p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm" /></div></div>
                
                {/* Hành động */}
                <div className="flex gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700"><button onClick={handleReset} className="flex-1 p-2 text-sm font-semibold rounded-lg bg-slate-200 dark:bg-slate-600">Xóa lọc</button><button onClick={onClose} className="flex-1 p-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white">Áp dụng</button></div>
            </div>
        </div>
    );
};

export default FilterMenu;