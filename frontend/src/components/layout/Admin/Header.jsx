// src/components/layout/Admin/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react"; // Chỉ giữ icon cần dùng
// --- Redux ---
import { useSelector, useDispatch } from "react-redux";
import { dangXuat } from "../../../redux/slices/authSlice";

function Header({ onToggleSidebar }) {
  // Lấy thông tin user từ Redux
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State & ref cho popup dropdown
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý logout
  const handleLogout = () => {
    dispatch(dangXuat());
    setIsPopupOpen(false);
    navigate("/dangnhap");
    alert("Bạn đã đăng xuất.");
  };

  // Thông tin admin fallback nếu Redux chưa có
  const admin = user || {
    ten: "Admin",
    vai_tro: "Administrator",
    anh_dai_dien: "https://via.placeholder.com/150",
  };

  return (
    // Header nền trắng, viền xám nhạt, có shadow nhẹ
    <div className="relative z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-6 h-16 flex items-center justify-between">
        {/* Bên trái: nút mở sidebar + tiêu đề trang */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu size={22} className="text-slate-700" />
          </button>
          <span className="text-sm sm:text-base font-semibold text-slate-800">
            Bảng điều khiển
          </span>
        </div>

        {/* Bên phải: avatar + dropdown Đăng xuất */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={popupRef}>
            <button
              onClick={() => setIsPopupOpen((prev) => !prev)}
              className="flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <img
                src={admin.anh_dai_dien || "https://via.placeholder.com/150"}
                alt="Admin Avatar"
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-800">
                  {admin.ten || "Admin"}
                </p>
                <p className="text-xs text-slate-500">
                  {admin.vai_tro || "Administrator"}
                </p>
              </div>
            </button>

            {/* Dropdown chỉ còn nút Đăng xuất */}
            {isPopupOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-slate-50"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
