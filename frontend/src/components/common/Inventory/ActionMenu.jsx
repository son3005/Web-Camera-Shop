// ActionMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

/**
 * ActionMenu
 * Props:
 *  - onClose: () => void
 *  - onDelete: () => void
 *  - onView: () => void
 *  - onEdit: () => void
 */
const ActionMenu = ({ onClose, onDelete, onView, onEdit }) => {
  const menuRef = useRef(null);
  const [position, setPosition] = useState("down");
  const [animate, setAnimate] = useState(false);

  // close when click outside or press Escape
  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  // position calc for menu (up/down)
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setPosition(spaceBelow < 150 && spaceAbove > spaceBelow ? "up" : "down");
      // animate in next frame
      requestAnimationFrame(() => setAnimate(true));
    }
  }, []);

  return (
    <div
      ref={menuRef}
      className={`
        absolute right-0 w-44 rounded-xl backdrop-blur-md
        bg-white/90 dark:bg-gray-800/90 border border-white/20 shadow-xl
        transform transition-all duration-150 ease-out z-50
        ${position === "down" ? "top-full mt-2" : "bottom-full mb-2"}
        ${animate
          ? "opacity-100 translate-y-0 scale-100"
          : position === "down"
          ? "opacity-0 -translate-y-2 scale-95"
          : "opacity-0 translate-y-2 scale-95"}
      `}
    >
      <MenuItem
        icon={<Eye size={16} />}
        label="View Details"
        onClick={() => {
          onView && onView();
          onClose && onClose();
        }}
      />
      <MenuItem
        icon={<Edit size={16} />}
        label="Edit"
        color="text-blue-600"
        onClick={() => {
          onEdit && onEdit();
          onClose && onClose();
        }}
      />
      <MenuItem
        icon={<Trash2 size={16} />}
        label="Delete"
        color="text-red-600"
        onClick={() => {
          // optional: confirm before delete
          if (window.confirm("Are you sure you want to delete this product?")) {
            onDelete && onDelete();
          }
          onClose && onClose();
        }}
      />
    </div>
  );
};

const MenuItem = ({ icon, label, color = "text-gray-700 dark:text-gray-200", onClick }) => (
  <button
    onClick={onClick}
    type="button"
    className={`flex items-center gap-2 w-full py-2.5 px-4 text-sm font-medium transition-all duration-150 ${color}
      hover:scale-105 hover:shadow-md rounded-lg text-left`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default ActionMenu;
