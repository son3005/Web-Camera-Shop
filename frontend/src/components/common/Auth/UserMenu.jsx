// src/components/common/auth/UserMenu.jsx
// Hiển thị avatar + tên + dropdown
// "Đổi mật khẩu" → /quenmatkhau  ✅

import React, { useEffect, useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { dangXuat } from "../../../redux/slices/authSlice";

export default function UserMenu() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goLogin = () => {
    navigate("/dangnhap", {
      state: { from: location.pathname },
    });
  };

  const handleLogout = () => {
    dispatch(dangXuat());
    setOpen(false);
    navigate("/", { replace: true });
  };

  // Chưa login
  if (!token) {
    return (
      <button
        onClick={goLogin}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        <FaUserCircle className="text-2xl text-emerald-600 dark:text-emerald-300" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-100 hidden xl:inline">
          Đăng nhập
        </span>
      </button>
    );
  }

  // Đã login
  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        <FaUserCircle className="text-2xl text-emerald-600 dark:text-emerald-300" />
        <div className="hidden lg:flex flex-col items-start leading-tight max-w-[140px]">
          <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-400">
            TÀI KHOẢN
          </span>
          <span className="text-sm font-semibold text-slate-800 dark:text-white truncate w-full">
            {user?.ho_ten || user?.email || "Người dùng"}
          </span>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-slate-900 text-slate-50 rounded-2xl shadow-lg border border-slate-700 z-50 overflow-hidden">
          <button
            onClick={() => {
              setOpen(false);
              navigate("/tai-khoan");
            }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800"
          >
            Quản lý thông tin
          </button>

          {/* 👇 đi đúng flow có sẵn */}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/quenmatkhau");
            }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800"
          >
            Đổi mật khẩu
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 text-red-300"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
