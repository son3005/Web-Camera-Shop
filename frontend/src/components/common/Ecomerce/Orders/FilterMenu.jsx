// src/components/common/Ecomerce/Orders/FilterMenu.jsx (Đã sửa)
import React, { useState, useRef, useEffect } from "react";
import { X, ArrowUp, ArrowDown, Calendar } from "lucide-react";
// Giả sử bạn dùng react-datepicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns'; // Để định dạng ngày gửi lên API

// Nhận thêm trangThaiMap và allStatusKeys từ props
const FilterMenu = ({ initialFilters, onApplyFilters, onClose, trangThaiMap, allStatusKeys }) => {
  const popupRef = useRef();

  // State tạm thời (tempFilters)
  const [tempFilters, setTempFilters] = useState({
      ...initialFilters,
      // Chuyển đổi start_date, end_date từ string 'YYYY-MM-DD' sang Date object
      start_date: initialFilters.start_date ? new Date(initialFilters.start_date + 'T00:00:00') : null,
      end_date: initialFilters.end_date ? new Date(initialFilters.end_date + 'T23:59:59') : null,
  });

  // Hook đóng khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Xử lý việc chọn/bỏ chọn trạng thái (dùng Set cho dễ)
  const handleStatusChange = (statusKey) => {
    setTempFilters(prev => {
        const currentStatuses = new Set(prev.trang_thai);
        if (currentStatuses.has(statusKey)) {
            currentStatuses.delete(statusKey);
        } else {
            currentStatuses.add(statusKey);
        }
        return { ...prev, trang_thai: Array.from(currentStatuses) };
    });
  };

  // Xử lý sort (Giữ nguyên logic)
  const handleSortToggle = (sortKey) => {
    const currentSort = tempFilters.sort_by;
    const currentOrder = tempFilters.sort_order;
    let newSort = sortKey;
    let newOrder = 'desc';
    if (currentSort === sortKey) {
        newOrder = (currentOrder === 'desc') ? 'asc' : 'desc';
    }
    setTempFilters(prev => ({ ...prev, sort_by: newSort, sort_order: newOrder }));
  };

  // Xử lý thay đổi ngày
  const handleDateChange = (field, date) => {
      setTempFilters(prev => ({...prev, [field]: date}));
  };


  // Hàm "Áp dụng"
  const handleApply = () => {
    // Chuyển đổi Date object về string 'YYYY-MM-DD' trước khi gửi
    const filtersToApply = {
        ...tempFilters,
        start_date: tempFilters.start_date ? format(tempFilters.start_date, 'yyyy-MM-dd') : null,
        end_date: tempFilters.end_date ? format(tempFilters.end_date, 'yyyy-MM-dd') : null,
    };
    onApplyFilters(filtersToApply);
    onClose(); // Đóng popup sau khi áp dụng
  };

  // Hàm "Reset"
  const handleReset = () => {
    const defaultFilters = {
      trang_thai: [],
      sort_by: "date",
      sort_order: "desc",
      start_date: null,
      end_date: null,
    };
    setTempFilters(defaultFilters); // Reset state tạm thời
    // Gửi state mặc định về cho cha
    onApplyFilters({
        ...defaultFilters,
        start_date: null, // Đảm bảo gửi null
        end_date: null,
    });
    // Không đóng popup để user xem kết quả
  };

  return (
    // Phần JSX container giữ nguyên
    <div ref={popupRef} className="absolute top-full right-0 mt-2 w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700 rounded-2xl shadow-2xl z-20">
      {/* Header (Giữ nguyên) */}
      <div className="flex justify-between items-center p-4 border-b border-black/10 dark:border-white/10">
        <h3 className="font-semibold text-slate-800 dark:text-white">Bộ lọc & Sắp xếp</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">

        {/* Lọc theo Trạng thái */}
        <div>
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Trạng thái đơn hàng</label>
          <div className="grid grid-cols-2 gap-2">
            {allStatusKeys.map((statusKey) => (
              <label key={statusKey} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${tempFilters.trang_thai.includes(statusKey) ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-black/5 dark:bg-white/10 border-slate-300/50 dark:border-slate-700'}`}>
                <input
                  type="checkbox"
                  checked={tempFilters.trang_thai.includes(statusKey)}
                  onChange={() => handleStatusChange(statusKey)}
                  className="h-4 w-4 rounded border-gray-400 text-cyan-600 focus:ring-cyan-500"
                />
                <span className={`text-sm font-medium ${tempFilters.trang_thai.includes(statusKey) ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-700 dark:text-slate-200'}`}>
                  {trangThaiMap[statusKey]?.text || statusKey}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sắp xếp (Giữ nguyên JSX, logic đã sửa ở handleSortToggle) */}
        <div>
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Sắp xếp theo</label>
          <div className="flex items-center gap-2 mt-2">
            <SortButton
              label="Ngày đặt"
              active={tempFilters.sort_by === 'date'}
              order={tempFilters.sort_by === 'date' ? tempFilters.sort_order : null}
              onClick={() => handleSortToggle('date')}
            />
            <SortButton
              label="Tổng tiền"
              active={tempFilters.sort_by === 'price'}
              order={tempFilters.sort_by === 'price' ? tempFilters.sort_order : null}
              onClick={() => handleSortToggle('price')}
            />
          </div>
        </div>

        {/* Lọc theo Ngày */}
        <div>
           <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Lọc theo ngày đặt hàng</label>
           <div className="flex items-center gap-2">
               {/* Date Picker cho Ngày bắt đầu */}
               <div className="relative flex-1">
                   <DatePicker
                       selected={tempFilters.start_date}
                       onChange={(date) => handleDateChange('start_date', date)}
                       selectsStart
                       startDate={tempFilters.start_date}
                       endDate={tempFilters.end_date}
                       dateFormat="dd/MM/yyyy"
                       placeholderText="Từ ngày"
                       isClearable
                       className="w-full p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm pl-8"
                   />
                   <Calendar size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/>
               </div>
                <span className="text-slate-500">-</span>
               {/* Date Picker cho Ngày kết thúc */}
                <div className="relative flex-1">
                   <DatePicker
                       selected={tempFilters.end_date}
                       onChange={(date) => handleDateChange('end_date', date)}
                       selectsEnd
                       startDate={tempFilters.start_date}
                       endDate={tempFilters.end_date}
                       minDate={tempFilters.start_date} // Ngày kết thúc không nhỏ hơn ngày bắt đầu
                       dateFormat="dd/MM/yyyy"
                       placeholderText="Đến ngày"
                       isClearable
                       className="w-full p-2 bg-black/5 dark:bg-white/10 border border-slate-300/50 dark:border-slate-700 rounded-lg text-sm pl-8"
                   />
                    <Calendar size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/>
               </div>
           </div>
        </div>

      </div>

      {/* Footer (Giữ nguyên JSX, logic đã sửa ở handleReset, handleApply) */}
      <div className="flex gap-2 p-4 border-t border-black/10 dark:border-white/10">
        <button onClick={handleReset} className="w-full py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700">Thiết lập lại</button>
        <button onClick={handleApply} className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-700">Áp dụng</button>
      </div>
    </div>
  );
};

// Component phụ SortButton (Giữ nguyên)
const SortButton = ({ label, active, order, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg border transition-colors ${
      active
        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-600 dark:text-cyan-400'
        : 'bg-black/5 dark:bg-white/10 border-slate-300/50 dark:border-slate-700 hover:bg-black/10'
    }`}
  >
    <span className="text-sm font-semibold">{label}</span>
    {active && (
      order === 'asc'
        ? <ArrowUp size={16} />
        : <ArrowDown size={16} />
    )}
  </button>
);

export default FilterMenu;