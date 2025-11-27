// src/components/common/Inventory/ActionMenu.jsx

import React, { useState, useEffect, useRef } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

const MenuItem = ({
  icon,
  label,
  color = "text-slate-700 dark:text-slate-200",
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 text-sm ${color} hover:bg-slate-50 dark:hover:bg-slate-800 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ActionMenu = ({ onClose, onView, onEdit, onDelete }) => {
  const menuRef = useRef(null);
  const [openUp, setOpenUp] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

  useEffect(() => {
    setIsVisible(true);

    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const isNearBottom = window.innerHeight - rect.bottom < 150;
      if (isNearBottom) {
        setOpenUp(true);
      }
    }
  }, []);

  const menuPositionClass = openUp ? "bottom-full mb-2" : "top-full mt-2";

  const animationClass = isVisible
    ? "opacity-100 translate-y-0"
    : `opacity-0 ${openUp ? "translate-y-2" : "-translate-y-2"}`;

  return (
    <div
      ref={menuRef}
      className={`absolute right-0 ${menuPositionClass} w-36 z-20 
                       rounded-lg shadow-xl border border-slate-200/60 dark:border-slate-700/60
                       bg-white/90 dark:bg-slate-900/95 
                       backdrop-blur-lg
                       transition-all duration-200 ease-out ${animationClass}`}
    >
      <MenuItem
        icon={<Eye size={16} />}
        label="Xem chi tiết"
        onClick={onView}
      />
      <MenuItem
        icon={<Edit size={16} />}
        label="Chỉnh sửa"
        color="text-blue-600 dark:text-blue-400"
        onClick={onEdit}
      />
      <MenuItem
        icon={<Trash2 size={16} />}
        label="Xóa"
        color="text-red-600 dark:text-red-400"
        onClick={onDelete}
      />
    </div>
  );
};

export default ActionMenu;
