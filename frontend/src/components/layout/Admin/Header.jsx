// src/components/layout/Admin/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { Menu, Search, Filter, Sun, Moon, User, LogOut } from "lucide-react";
// --- (1) Import hook và action từ Redux ---
import { useSelector, useDispatch } from 'react-redux';
import { dangXuat } from '../../../redux/slices/authSlice'; // Import action logout

function Header({ onToggleSidebar, theme, onToggleTheme }) {
  // --- (2) Lấy thông tin user từ Redux store ---
  const { user } = useSelector((state) => state.auth); // Giả sử state lưu ở state.auth.user
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- State popup giữ nguyên ---
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
  }, [popupRef]);

  // --- (3) Hàm xử lý logout ---
  const handleLogout = () => {
      dispatch(dangXuat()); // Gọi action logout (xóa user/token)
      setIsPopupOpen(false); // Đóng popup
      navigate('/dangnhap'); // Chuyển hướng về trang đăng nhập
      alert("Bạn đã đăng xuất.");
  };

  // Lấy thông tin admin từ Redux hoặc dùng placeholder nếu chưa có
  const admin = user || {
    ten: "Admin", // Tên mặc định
    vai_tro: "Administrator",
    anh_dai_dien: "https://via.placeholder.com/150", // Ảnh mặc định
  };

  return (
    <div className="relative z-30 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
      <div className="px-6 h-16 flex items-center justify-between">
        {/* Left Side: Toggle Sidebar & Search */}
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Menu size={22} />
          </button>
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 w-64 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Right Side: Theme Toggle & Admin Menu */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <ButtonMode theme={theme} onToggleTheme={onToggleTheme} />

          {/* Admin Menu */}
          <div className="relative" ref={popupRef}>
            <button onClick={() => setIsPopupOpen(!isPopupOpen)} className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <img
                src={admin.anh_dai_dien || 'https://via.placeholder.com/150'} // Sử dụng ảnh đại diện từ Redux
                alt="Admin Avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-slate-300 dark:border-slate-600"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{admin.ten || 'Admin'}</p> {/* Sử dụng tên từ Redux */}
                <p className="text-xs text-slate-500 dark:text-slate-400">{admin.vai_tro || 'Administrator'}</p> {/* Sử dụng vai trò từ Redux */}
              </div>
            </button>

            {/* Admin Popup */}
            {isPopupOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up" style={{ animationDuration: '150ms' }}>
                <div className="py-1">
                  <Link
                    to="/admin/profile" // Giả sử có trang profile
                    onClick={() => setIsPopupOpen(false)}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <User className="w-4 h-4 mr-3" />
                    <span>Xem hồ sơ</span>
                  </Link>
                  {/* --- (4) Nút Logout gọi hàm handleLogout --- */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ButtonMode giữ nguyên
function ButtonMode({ theme, onToggleTheme }) {
  return (
    <button
      onClick={onToggleTheme}
      className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

export default Header;