// src/components/layout/Admin/Sidebar.jsx

import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../../assets/images/Logo.png";
import {
  Settings, LayoutDashboard, Users, ShoppingBag, Box,
  CreditCard, Zap, MessagesSquare, ChevronDown,
} from "lucide-react";



// Dữ liệu menu không thay đổi
const menuItems = [
  { id: "dashboard", path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { id: "inventory", path: "/admin/inventory", icon: Box, label: "Inventory" },
  {
    id: "ecommerce", icon: ShoppingBag, label: "E-commerce",
    submenu: [
      { id: "orders", path: "/admin/orders", label: "Orders" },
      { id: "customers", path: "/admin/customers", label: "Customers" },
    ],
  },
  { id: "transactions", path: "/admin/transactions", icon: CreditCard, label: "Transactions" },
  // {
  //   id: "users", icon: Users, label: "Users", count: "2.4k",
  //   submenu: [
  //     { id: "all-users", path: "/admin/users/all", label: "All Users" },
  //     { id: "roles", path: "/admin/users/roles", label: "Roles & Permissions" },
  //   ],
  // },
  // { id: "messages", path: "/admin/messages", icon: MessagesSquare, label: "Messages", badge: "5" },
  { id: "settings", path: "/admin/settings", icon: Settings, label: "Settings" },
];



function Sidebar({ collapsed }) {
  // --- KHÔI PHỤC LẠI LOGIC GỐC: cho phép mở nhiều submenu ---
  const admin = {
    name: "Sci Nguyen",
    role: "Administrator",
    avatar: "https://i.pinimg.com/1200x/1e/d0/2f/1ed02f1396fcf5662d0345aaeb408f18.jpg",
  };
  
  const [expandedItems, setExpandedItems] = useState(new Set(["ecommerce"]));
  const { pathname } = useLocation();

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      return newExpanded;
    });
  };

  return (
    <div
      className={`${collapsed ? "w-20" : "w-72"} transition-all duration-300 ease-in-out 
               bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl
               border-r border-slate-200/50 dark:border-slate-800 
               flex flex-col relative z-20`}
    >
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 bg-white/80 rounded-2xl 
              flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden">
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
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Bảng điều khiển</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {menuItems.map((item) => {
          const hasSubmenu = !!item.submenu;
          // Khôi phục lại logic kiểm tra isExpanded gốc
          const isExpanded = expandedItems.has(item.id);

          if (!hasSubmenu) {
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between p-3 rounded-xl 
                   transition-all duration-200 
                   ${isActive
                    ? "bg-gradient-to-br from-emerald-500 to-slate-800 text-white shadow-lg shadow-emerald-500/30"
                    : "text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                   }`
                }
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  {!collapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (<span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{item.badge}</span>)}
                      {item.count && (<span className="px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">{item.count}</span>)}
                    </>
                  )}
                </div>
              </NavLink>
            );
          }

          const isParentActive = item.submenu.some(sub => pathname.startsWith(sub.path));

          return (
            <div key={item.id}>
              <button
                className={`w-full flex items-center justify-between p-3 rounded-xl 
                           transition-all duration-200 
                           ${isParentActive
                            ? "bg-gradient-to-br from-emerald-500 to-slate-800 text-white shadow-lg shadow-emerald-500/30"
                            : "text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                           }`}
                onClick={() => toggleExpanded(item.id)}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  {!collapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (<span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{item.badge}</span>)}
                      {item.count && (<span className="px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">{item.count}</span>)}
                    </>
                  )}
                </div>
                {!collapsed && <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />}
              </button>

              {!collapsed && isExpanded && (
                <div className="ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 mt-2 space-y-1">
                  {item.submenu.map((sub) => (
                    <NavLink
                      key={sub.id}
                      to={sub.path}
                      className={({ isActive }) =>
                        // --- THAY ĐỔI DUY NHẤT: Thêm class `block` để mỗi mục xuống hàng ---
                        `w-full text-left block p-2 text-sm rounded-lg transition-all
                         ${isActive
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

      {!collapsed && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <img src={`${admin.avatar}`} alt="admin" className="w-10 h-10 rounded-full ring-2 ring-emerald-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{admin.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{admin.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;