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
} from "lucide-react";

// =====================================================
// MENU GỐC (đã đưa Phiếu thu ra ngoài)
// =====================================================
const menuItems = [
  {
    id: "dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    label: "Tổng quan",
  },
  { id: "inventory", path: "/admin/inventory", icon: Box, label: "Sản phẩm" },

  // ✅ Phiếu thu đứng cùng cấp
  {
    id: "phieu-thu",
    path: "/admin/phieu-thu",
    icon: CreditCard,
    label: "Phiếu thu",
  },

  {
    id: "ecommerce",
    icon: ShoppingBag,
    label: "Kinh doanh",
    submenu: [
      { id: "orders", path: "/admin/orders", label: "Đặt hàng" },
      { id: "customers", path: "/admin/customers", label: "Khách hàng" },
    ],
  },
  {
    id: "transactions",
    path: "/admin/transactions",
    icon: CreditCard,
    label: "Giao dịch",
  },
  { id: "settings", path: "/admin/settings", icon: Settings, label: "Cài Đặt" },
];

function Sidebar({ collapsed }) {
  const admin = {
    name: "Sci Nguyen",
    role: "Administrator",
    avatar:
      "https://i.pinimg.com/1200x/1e/d0/2f/1ed02f1396fcf5662d0345aaeb408f18.jpg",
  };

  // mở sẵn "Kinh doanh"
  const [expandedItems, setExpandedItems] = useState(new Set(["ecommerce"]));
  const { pathname } = useLocation();

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-72"
      } transition-all duration-300 ease-in-out 
               bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl
               border-r border-slate-200/50 dark:border-slate-800 
               flex flex-col relative z-20`}
    >
      {/* HEADER SIDEBAR */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div
            className="w-14 h-14 bg-white/80 rounded-2xl 
              flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden"
          >
            <img
              src={logo}
              alt="Logo"
              className={`object-contain transition-all duration-300 ${
                collapsed ? "w-10 h-10" : "w-48 h-16"
              }`}
            />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                Bảng điều khiển
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Admin Panel
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {menuItems.map((item) => {
          const hasSubmenu = !!item.submenu;
          const isExpanded = expandedItems.has(item.id);

          // ===== ITEM KHÔNG CÓ SUBMENU =====
          if (!hasSubmenu) {
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between p-3 rounded-xl 
                   transition-all duration-200 
                   ${
                     isActive
                       ? "bg-gradient-to-br from-emerald-500 to-slate-800 text-white shadow-lg shadow-emerald-500/30"
                       : "text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
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

          // ===== ITEM CÓ SUBMENU =====
          const isParentActive = item.submenu.some((sub) =>
            pathname.startsWith(sub.path)
          );

          return (
            <div key={item.id}>
              <button
                className={`w-full flex items-center justify-between p-3 rounded-xl 
                           transition-all duration-200 
                           ${
                             isParentActive
                               ? "bg-gradient-to-br from-emerald-500 to-slate-800 text-white shadow-lg shadow-emerald-500/30"
                               : "text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                           }`}
                onClick={() => toggleExpanded(item.id)}
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
                <div className="ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 mt-2 space-y-1">
                  {item.submenu.map((sub) => (
                    <NavLink
                      key={sub.id}
                      to={sub.path}
                      className={({ isActive }) =>
                        `w-full text-left block p-2 text-sm rounded-lg transition-all
                         ${
                           isActive
                             ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold"
                             : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
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

      {/* FOOTER ADMIN BOX */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <img
              src={admin.avatar}
              alt="admin"
              className="w-10 h-10 rounded-full ring-2 ring-emerald-500"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                {admin.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {admin.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
