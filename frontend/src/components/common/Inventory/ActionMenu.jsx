import React, { useEffect, useRef, useState } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

/**
 * ActionMenu
 * Dropdown cho từng sản phẩm (View, Edit, Delete)
 * ✅ Glassmorphism style + hover animation
 */
const ActionMenu = ({ onClose }) => {
  const menuRef = useRef(null);
  const [position, setPosition] = useState("down");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 150 && spaceAbove > spaceBelow) {
        setPosition("up");
      } else {
        setPosition("down");
      }

      requestAnimationFrame(() => setAnimate(true));
    }
  }, []);

  return (
    <div
      ref={menuRef}
      className={`
        absolute right-0 w-44 rounded-xl backdrop-blur-md 
        bg-white/70 dark:bg-gray-800/70 border border-white/20 shadow-xl
        transform transition-all duration-200 ease-out z-50
        ${position === "down" ? "top-full mt-2" : "bottom-full mb-2"}
        ${animate 
          ? "opacity-100 translate-y-0 scale-100" 
          : position === "down" 
            ? "opacity-0 -translate-y-2 scale-95" 
            : "opacity-0 translate-y-2 scale-95"}
      `}
    >
      {/* Option Item */}
      <MenuItem icon={<Eye size={16} />} label="View Details" onClick={onClose} />
      <MenuItem icon={<Edit size={16} />} label="Edit" color="text-blue-600" onClick={onClose} />
      <MenuItem icon={<Trash2 size={16} />} label="Delete" color="text-red-600" onClick={onClose} />
    </div>
  );
};

/**
 * MenuItem Component
 * ✅ Tái sử dụng dễ dàng
 */
const MenuItem = ({ icon, label, color = "text-gray-700 dark:text-gray-200", onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-medium
      transition-all duration-200 ${color}
      hover:scale-105 hover:shadow-md hover:shadow-blue-400/40
      rounded-lg
    `}
  >
    {icon}
    {label}
  </button>
);

export default ActionMenu;
