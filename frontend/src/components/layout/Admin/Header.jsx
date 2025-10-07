// src/components/layout/Admin/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, Filter, Sun, Moon, User, LogOut } from "lucide-react";

function Header({ onToggleSidebar, theme, onToggleTheme }) {
  const admin = {
    name: "Sci Nguyen",
    role: "Administrator",
    avatar: "https://i.pinimg.com/1200x/1e/d0/2f/1ed02f1396fcf5662d0345aaeb408f18.jpg",
  };

  // State để quản lý việc mở/đóng popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Ref để tham chiếu đến phần tử DOM của popup container
  const popupRef = useRef(null);

  // Effect để xử lý việc đóng popup khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef]);

  return (
    <div className="relative z-30 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* === Left Section === */}
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, Sci! Here's what's happening today.</p>
          </div>
        </div>

        {/* === Center Section (Search) === */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* === Right Section === */}
        <div className="flex items-center space-x-3">
          <ButtonMode theme={theme} onToggleTheme={onToggleTheme} />

          {/* User Info and Popup Section */}
          <div className="relative" ref={popupRef}>
            <button
              onClick={() => setIsPopupOpen(!isPopupOpen)}
              className="flex items-center space-x-3 pl-3 border-l border-slate-300 dark:border-slate-700 focus:outline-none"
            >
              <img
                src={admin.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-full ring-2 ring-emerald-500"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-300">{admin.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{admin.role}</p>
              </div>
            </button>

            {/* Popup Menu */}
            {isPopupOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl ring-1 ring-emerald-300/5 ring-opacity-5 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{admin.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Welcome!</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/admin/profile"
                    onClick={() => setIsPopupOpen(false)}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <User className="w-4 h-4 mr-3" />
                    <span>View Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      console.log("Logging out...");
                      setIsPopupOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>Logout</span>
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

// Chỉnh sửa lại hàm này một chút cho đúng cú pháp JSX
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