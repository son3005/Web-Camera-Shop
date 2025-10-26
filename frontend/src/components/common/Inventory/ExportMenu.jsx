import React, { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';

const ExportMenu = () => {
    // 1. State để quản lý việc bật/tắt popup
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // 2. Hook để xử lý việc click ra ngoài popup
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Nếu click ra ngoài <div ref={menuRef}> thì đóng popup
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        // Thêm event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Dọn dẹp event listener khi component unmount
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // (Giả lập) Hàm xử lý khi nhấn vào các lựa chọn
    const handleExport = (format) => {
        console.log(`Đang export ${format}...`);
        // (Đây là nơi bạn sẽ gọi logic export thật)
        setIsOpen(false); // Đóng popup sau khi chọn
    };

    return (
        // (relative) để popup (absolute) có thể định vị
        <div className="relative w-full sm:w-auto" ref={menuRef}>
            {/* 3. Nút bấm chính */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
                <Download size={18} />
                <span>Export</span>
                <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* 4. Popup (dropdown) */}
            {isOpen && (
                <div 
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10 animate-fade-in-up"
                    style={{ animationDuration: '150ms' }} // Thêm animation cho mượt
                >
                    <ul className="py-1">
                        <li>
                            <button
                                onClick={() => handleExport('PDF')}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <FileText size={16} className="text-red-500" />
                                <span>Export PDF</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleExport('Excel')}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <FileSpreadsheet size={16} className="text-green-500" />
                                <span>Export Excel</span>
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ExportMenu;