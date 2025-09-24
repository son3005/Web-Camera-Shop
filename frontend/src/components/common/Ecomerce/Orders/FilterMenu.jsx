import React, { useState } from "react";
import { X } from "lucide-react";

const ALL_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const FilterMenu = ({ initialFilters, onApplyFilters, onClose }) => {
    
    // State tạm thời (tempFilters) để lưu các thay đổi của người dùng trong menu.
    // Nó được khởi tạo với giá trị của bộ lọc đang hoạt động từ component cha.
    const [tempFilters, setTempFilters] = useState(initialFilters);

    // --- Các hàm bên dưới chỉ cập nhật state `tempFilters` ---

    // Xử lý việc chọn/bỏ chọn trạng thái
    const handleStatusChange = (status) => {
        const currentStatuses = new Set(tempFilters.statuses);
        if (currentStatuses.has(status)) {
            currentStatuses.delete(status);
        } else {
            currentStatuses.add(status);
        }
        setTempFilters(f => ({ ...f, statuses: Array.from(currentStatuses) }));
    };
    
    // Xử lý việc bật/tắt các nút sắp xếp
    const handleSortToggle = (sortType, value) => {
        setTempFilters(prev => ({
            ...prev,
            // Nếu bấm vào nút đang active, nó sẽ được tắt (trở về 'default')
            [sortType]: prev[sortType] === value ? 'default' : value,
        }));
    };

    // Xử lý việc thay đổi giá trị trong các ô input khoảng ngày/giá
    const handleRangeChange = (filterType, field, value) => {
        setTempFilters(prev => ({
            ...prev,
            [filterType]: {
                ...prev[filterType],
                [field]: value
            }
        }));
    };

    // Reset state tạm thời về giá trị mặc định
    const handleReset = () => {
        setTempFilters({
            statuses: [], priceSort: "default", dateSort: "default",
            priceRange: { min: "", max: "" }, dateRange: { start: "", end: "" }
        });
    };

    // Hàm được gọi khi người dùng nhấn "Áp dụng"
    const handleApply = () => {
        onApplyFilters(tempFilters); // Gửi state tạm thời lên component cha để kích hoạt API call
        onClose(); // Đóng menu
    };
    
    return (
        <div className="fixed inset-0 z-[1000] flex justify-end">
            {/* Lớp nền mờ */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
            
            {/* Nội dung Menu */}
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 shadow-2xl p-6 flex flex-col">
                 <div className="flex justify-between items-center pb-4 border-b border-black/10 dark:border-white/10">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Lọc & Sắp xếp</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><X size={20} /></button>
                </div>

                <div className="flex-grow overflow-y-auto space-y-6 py-6 pr-2 -mr-2">
                    {/* Lọc theo Trạng thái */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Trạng thái</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                        {ALL_STATUSES.map(status => (
                            <button key={status} onClick={() => handleStatusChange(status)} className={`px-3 py-2 text-sm rounded-lg border transition-colors ${tempFilters.statuses.includes(status) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                {status}
                            </button>
                        ))}
                        </div>
                    </div>
                    
                    {/* Sắp xếp theo Giá */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sắp xếp theo giá</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <button onClick={() => handleSortToggle('priceSort', 'asc')} className={`px-3 py-2 text-sm rounded-lg border transition-colors ${tempFilters.priceSort === 'asc' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Thấp đến cao</button>
                            <button onClick={() => handleSortToggle('priceSort', 'desc')} className={`px-3 py-2 text-sm rounded-lg border transition-colors ${tempFilters.priceSort === 'desc' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Cao đến thấp</button>
                        </div>
                    </div>
                    
                    {/* Sắp xếp theo Ngày */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sắp xếp theo ngày</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <button onClick={() => handleSortToggle('dateSort', 'desc')} className={`px-3 py-2 text-sm rounded-lg border transition-colors ${tempFilters.dateSort === 'desc' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Mới nhất</button>
                            <button onClick={() => handleSortToggle('dateSort', 'asc')} className={`px-3 py-2 text-sm rounded-lg border transition-colors ${tempFilters.dateSort === 'asc' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Cũ nhất</button>
                        </div>
                    </div>

                    {/* Lọc theo Khoảng ngày */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lọc theo ngày</label>
                        <div className="flex items-center gap-2 mt-2">
                            <input type="date" value={tempFilters.dateRange.start} onChange={(e) => handleRangeChange('dateRange', 'start', e.target.value)} className="w-1/2 p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm" />
                            <input type="date" value={tempFilters.dateRange.end} onChange={(e) => handleRangeChange('dateRange', 'end', e.target.value)} min={tempFilters.dateRange.start} className="w-1/2 p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm" />
                        </div>
                    </div>

                    {/* Lọc theo Khoảng giá */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lọc theo giá</label>
                        <div className="flex items-center gap-2 mt-2">
                            <input type="number" placeholder="Từ" value={tempFilters.priceRange.min} onChange={(e) => handleRangeChange('priceRange', 'min', e.target.value)} className="w-1/2 p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm" />
                            <input type="number" placeholder="Đến" value={tempFilters.priceRange.max} onChange={(e) => handleRangeChange('priceRange', 'max', e.target.value)} min={tempFilters.priceRange.min} className="w-1/2 p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm" />
                        </div>
                    </div>
                </div>

                 {/* Footer với các nút hành động */}
                 <div className="flex gap-2 pt-4 border-t border-black/10 dark:border-white/10">
                    <button onClick={handleReset} className="w-full py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700">Thiết lập lại</button>
                    <button onClick={handleApply} className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white">Áp dụng</button>
                </div>
            </div>
        </div>
    );
};

export default FilterMenu;