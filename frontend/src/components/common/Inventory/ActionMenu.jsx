// src/components/common/Inventory/ActionMenu.jsx

import React, { useState, useEffect, useRef } from "react";
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
    const [openUp, setOpenUp] = useState(false);
    // 1. Thêm state để quản lý trạng thái hiển thị (cho animation)
    const [isVisible, setIsVisible] = useState(false);

    // Bắt sự kiện click ra ngoài để đóng menu
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

    // Kiểm tra vị trí của menu và kích hoạt animation
    useEffect(() => {
        // Kích hoạt animation ngay sau khi component được mount
        setIsVisible(true);

        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const isNearBottom = window.innerHeight - rect.bottom < 150; 
            if (isNearBottom) {
                setOpenUp(true);
            }
        }
    }, []);

    // Class CSS cho vị trí của menu
    const menuPositionClass = openUp 
        ? 'bottom-full mb-2' // Mở lên trên
        : 'top-full mt-2';   // Mở xuống dưới (mặc định)

    // 2. Class CSS cho hiệu ứng animation
    const animationClass = isVisible 
        ? 'opacity-100 translate-y-0' // Trạng thái cuối: Hiện rõ, đúng vị trí
        : `opacity-0 ${openUp ? 'translate-y-2' : '-translate-y-2'}`; // Trạng thái đầu: Mờ, lệch vị trí

    return (
        <div 
            ref={menuRef}
            // 3. Áp dụng các class animation và transition
            className={`absolute right-0 ${menuPositionClass} w-36 z-20 
                       rounded-lg shadow-xl border border-white/10
                       bg-slate-200/60 dark:bg-slate-800/80 
                       backdrop-blur-lg
                       transition-all duration-200 ease-out ${animationClass}`}
        >
            <MenuItem icon={<Eye size={16} />} label="Xem chi tiết" onClick={onView} />
            <MenuItem icon={<Edit size={16} />} label="Chỉnh sửa" color="text-blue-600 dark:text-blue-400" onClick={onEdit} />
            <MenuItem icon={<Trash2 size={16} />} label="Xóa" color="text-red-600 dark:text-red-400" onClick={onDelete} />
        </div>
    );
};

export default ActionMenu;