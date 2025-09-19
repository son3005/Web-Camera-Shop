// src/components/ActionMenu.jsx

import React, { useEffect, useRef } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

// Component con cho từng mục trong menu
const MenuItem = ({ icon, label, color = "dark:text-slate-200", onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 text-sm ${color} hover:bg-black/5 dark:hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg transition-colors`}>
        {icon}
        <span>{label}</span>
    </button>
);

// Component ActionMenu chính
const ActionMenu = ({ onClose, onView, onEdit, onDelete }) => {
    const menuRef = useRef(null);

    // Tự động đóng menu khi click ra ngoài hoặc nhấn phím Escape
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        const handleEscKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        
        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscKey);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscKey);
        };
    }, [onClose]);

    return (
        <div ref={menuRef}
             className="absolute top-full right-0 mt-2 w-36 z-20 
                        rounded-lg shadow-xl border border-white/10
                        bg-slate-200/60 dark:bg-slate-800/80 
                        backdrop-blur-lg
                        animate-fade-in-up"> {/* Thêm class animate */}
            <MenuItem icon={<Eye size={16} />} label="Xem chi tiết" onClick={onView} />
            <MenuItem icon={<Edit size={16} />} label="Chỉnh sửa" color="text-blue-600 dark:text-blue-400" onClick={onEdit} />
            <MenuItem icon={<Trash2 size={16} />} label="Xóa" color="text-red-600 dark:text-red-400" onClick={onDelete} />
        </div>
    );
};

export default ActionMenu;