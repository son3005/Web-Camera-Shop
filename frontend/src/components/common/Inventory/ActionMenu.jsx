// src/components/common/Inventory/ActionMenu.jsx

// Import React và các hook cần dùng
import React, { useState, useEffect, useRef } from "react";
// Import icon từ thư viện lucide-react
import { Eye, Edit, Trash2 } from "lucide-react";

/**
 * Component MenuItem: đại diện cho 1 dòng trong menu (Xem / Sửa / Xóa)
 *
 * props:
 * - icon: JSX icon hiển thị bên trái
 * - label: text hiển thị
 * - color: class Tailwind để đổi màu chữ (mặc định là text-slate-700)
 * - onClick: hàm được gọi khi bấm vào item
 */
const MenuItem = ({ icon, label, color = "text-slate-700", onClick }) => (
  <button
    // Khi click, gọi hàm onClick từ props
    onClick={onClick}
    // className:
    // - w-full: chiếm cả chiều ngang
    // - flex items-center gap-3: dùng flex để icon + text nằm ngang, cách nhau 12px
    // - px-3 py-2: padding trong
    // - text-sm: kích thước chữ nhỏ
    // - ${color}: màu chữ truyền từ props
    // - hover:bg-slate-50: hover đổi nền xám rất nhạt
    // - first:rounded-t-lg last:rounded-b-lg: bo tròn item đầu và cuối
    // - transition-colors: hiệu ứng đổi màu mượt
    // - cursor-pointer: cursor dạng pointer
    className={`w-full flex items-center gap-3 px-3 py-2 text-sm ${color} hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer`}
  >
    {/* icon truyền từ ngoài vào */}
    {icon}
    {/* text label */}
    <span>{label}</span>
  </button>
);

/**
 * Component ActionMenu: menu 3 chấm trong bảng (Xem chi tiết / Chỉnh sửa / Xóa)
 *
 * props:
 * - onClose: hàm đóng menu
 * - onView: xử lý khi chọn "Xem chi tiết"
 * - onEdit: xử lý khi chọn "Chỉnh sửa"
 * - onDelete: xử lý khi chọn "Xóa"
 */
const ActionMenu = ({ onClose, onView, onEdit, onDelete }) => {
  // menuRef dùng để biết được click có nằm ngoài menu hay không
  const menuRef = useRef(null);

  // openUp = true => menu bung lên trên; false => bung xuống dưới
  const [openUp, setOpenUp] = useState(false);

  // isVisible dùng cho animation fade-in (opacity, translate)
  const [isVisible, setIsVisible] = useState(false);

  /**
   * useEffect 1:
   * - Lắng nghe click ngoài menu => đóng menu
   * - Lắng nghe phím ESC => đóng menu
   */
  useEffect(() => {
    // Nếu click vào phần tử không nằm trong menuRef => đóng
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    // Nếu bấm phím ESC => đóng
    const handleEscKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    // Đăng ký event
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscKey);

    // Cleanup khi component unmount
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]); // phụ thuộc onClose

  /**
   * useEffect 2:
   * - Khi menu mount lên:
   *   + setIsVisible(true) để chạy animation xuất hiện
   *   + kiểm tra vị trí => nếu gần đáy màn hình thì đổi sang bung lên
   */
  useEffect(() => {
    // Bật cờ visible để thêm class animation
    setIsVisible(true);

    // Tính toán vị trí
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      // Khoảng cách từ bottom của menu tới đáy màn hình
      const isNearBottom = window.innerHeight - rect.bottom < 150;
      if (isNearBottom) {
        // Nếu quá gần đáy => đổi menu bung lên trên
        setOpenUp(true);
      }
    }
  }, []);

  // Nếu openUp = true => menu nằm trên button; ngược lại nằm dưới
  const menuPositionClass = openUp ? "bottom-full mb-2" : "top-full mt-2";

  // Class animation: fade + slide lên/xuống
  const animationClass = isVisible
    ? "opacity-100 translate-y-0"
    : `opacity-0 ${openUp ? "translate-y-2" : "-translate-y-2"}`;

  return (
    <div
      // ref để useEffect biết vùng menu
      ref={menuRef}
      // className:
      // - absolute right-0: đặt menu tương đối với nút 3 chấm (cha có position: relative)
      // - ${menuPositionClass}: top-full/ bottom-full + margin
      // - w-36: chiều rộng cố định
      // - z-20: nằm trên các phần tử khác
      // - rounded-lg: bo góc
      // - shadow-xl: đổ bóng
      // - border-slate-200/70: viền xám nhẹ
      // - bg-white/95: nền trắng hơi trong suốt
      // - backdrop-blur-lg: blur nền phía sau
      // - transition-all duration-200 ease-out: animation mượt
      // - ${animationClass}: áp dụng fade/translate
      className={`absolute right-0 ${menuPositionClass} w-36 z-20 
        rounded-lg shadow-xl border border-slate-200/70
        bg-white/95 backdrop-blur-lg
        transition-all duration-200 ease-out ${animationClass}`}
    >
      {/* Item Xem chi tiết */}
      <MenuItem
        icon={<Eye size={16} />} // icon con mắt
        label="Xem chi tiết" // text
        onClick={onView} // callback khi click
      />
      {/* Item Chỉnh sửa */}
      <MenuItem
        icon={<Edit size={16} />}
        label="Chỉnh sửa"
        color="text-blue-600" // màu xanh cho hành động edit
        onClick={onEdit}
      />
      {/* Item Xóa */}
      <MenuItem
        icon={<Trash2 size={16} />}
        label="Xóa"
        color="text-red-600" // màu đỏ cho hành động xóa
        onClick={onDelete}
      />
    </div>
  );
};

// Export component để dùng nơi khác
export default ActionMenu;
