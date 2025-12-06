// src/components/layout/Admin/Sidebar.jsx
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../../assets/images/Logo.png";
import {
  Settings,
  LayoutDashboard,
  ShoppingBag,
  Box,
  CreditCard,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

// ======================= MENU STRUCTURE =======================
const menuItems = [
  {
    id: "dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    label: "Tổng quan",
  },
  { id: "inventory", path: "/admin/inventory", icon: Box, label: "Sản phẩm" },

  {
    id: "phieu-nhap",
    path: "/admin/phieu-nhap",
    icon: CreditCard,
    label: "Phiếu nhập",
  },

  {
    id: "ecommerce",
    icon: ShoppingBag,
    label: "Kinh doanh",
    submenu: [
      { id: "orders", path: "/admin/orders", label: "Đặt hàng" },
      { id: "customers", path: "/admin/customers", label: "Khách hàng" },
      { id: "suppliers", path: "/admin/suppliers", label: "Nhà cung cấp" },
      { id: "reviews", path: "/admin/reviews", label: "Đánh giá sản phẩm" },
    ],
  },

  {
    id: "settings",
    icon: Settings,
    label: "Tùy biến",
    submenu: [
      {
        id: "settings-brands",
        path: "/admin/settings/brands",
        label: "Thương hiệu",
      },
      {
        id: "settings-categories",
        path: "/admin/settings/categories",
        label: "Danh mục",
      },
      {
        id: "settings-levels",
        path: "/admin/settings/levels",
        label: "Cấp độ",
      },
      {
        id: "settings-slideshow",
        path: "/admin/settings/slideshow",
        label: "Ảnh trình chiếu",
      },
    ],
  },
];

function Sidebar({ collapsed, onToggleCollapsed }) {
  const { pathname } = useLocation();

  // mở sẵn "Kinh doanh"; mở thêm "Cài đặt" nếu đang ở /admin/settings/*
  const defaultExpanded = new Set(["ecommerce"]);
  if (pathname.startsWith("/admin/settings")) defaultExpanded.add("settings");
  const [expandedItems, setExpandedItems] = useState(defaultExpanded);

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-72"
      } transition-all duration-300 ease-in-out
         bg-white/80 backdrop-blur-xl
         border-r border-slate-200
         flex flex-col relative z-20`}
    >
      {/* Header + nút hamburger */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden border border-slate-100">
              <img
                src={logo}
                alt="Logo"
                className={`object-contain transition-all duration-300 ${
                  collapsed ? "w-9 h-9" : "w-11 h-11"
                }`}
              />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Bảng điều khiển
                </h1>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            )}
          </div>

          {/* nút thu gọn / mở rộng – gọi callback của layout */}
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-400 text-slate-600 hover:text-emerald-700 shadow-sm transition"
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        {menuItems.map((item) => {
          const hasSubmenu = !!item.submenu;
          const isExpanded = expandedItems.has(item.id);

          if (!hasSubmenu) {
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[var(--auth-emerald)] to-[var(--auth-emerald-dark)] text-white shadow-md shadow-emerald-500/30"
                      : "text-slate-700 hover:bg-emerald-50 hover:text-[var(--auth-emerald-dark)]"
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </div>
              </NavLink>
            );
          }

          const isParentActive =
            item.submenu.some((sub) => pathname.startsWith(sub.path)) ||
            (item.id === "settings" && pathname === "/admin/settings");

          return (
            <div key={item.id}>
              <button
                onClick={() => toggleExpanded(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  isParentActive
                    ? "bg-gradient-to-r from-[var(--auth-emerald)] to-[var(--auth-emerald-dark)] text-white shadow-md shadow-emerald-500/30"
                    : "text-slate-700 hover:bg-emerald-50 hover:text-[var(--auth-emerald-dark)]"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </div>
                {!collapsed && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {!collapsed && isExpanded && (
                <div className="ml-4 pl-4 border-l-2 border-slate-200 mt-2 space-y-1">
                  {item.submenu.map((sub) => (
                    <NavLink
                      key={sub.id}
                      to={sub.path}
                      className={({ isActive }) =>
                        `w-full text-left block p-2 text-sm rounded-lg transition-all ${
                          isActive
                            ? "bg-emerald-50 text-[var(--auth-emerald-dark)] font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
