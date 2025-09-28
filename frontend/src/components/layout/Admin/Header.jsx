// src/components/layout/Admin/Header.jsx
import React from "react";
import { Menu, Search, Filter, Sun, Moon } from "lucide-react";

/**
 * Header component đã được sửa lại.
 * Nó không còn tự quản lý state 'theme' nữa.
 * Thay vào đó, nó nhận 'theme' và hàm 'onToggleTheme' từ props
 * do component cha (AdminLayout) truyền xuống.
 */
function Header({ sidebarCollapsed, onToggleSidebar, theme, onToggleTheme }) {
  
  // TOÀN BỘ LOGIC QUẢN LÝ THEME (useState, useEffect) ĐÃ BỊ XÓA BỎ KHỎI ĐÂY.

  return (
    <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
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
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Welcome back, Sci! Here's what's happening today.
            </p>
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
          {ButtonMode(theme,onToggleTheme)}

          {/* Thông tin người dùng */}
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-300 dark:border-slate-700">
            <img
              src="https://i.pinimg.com/1200x/1e/d0/2f/1ed02f1396fcf5662d0345aaeb408f18.jpg"
              alt="Avatar"
              className="w-8 h-8 rounded-full ring-2 ring-emerald-500"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-300">Sci Nguyen</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Header;


function ButtonMode(theme,onToggleTheme){
{/* Nút chuyển đổi theme */}
          <button
            // Gọi hàm onToggleTheme được truyền từ AdminLayout (bây giờ là dispatch)
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {/* Hiển thị icon Sun hoặc Moon dựa trên prop 'theme' */}
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
}