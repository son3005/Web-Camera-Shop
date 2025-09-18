// src/components/layout/Admin/Sidebar.jsx

import React, { useState } from "react";
import {
  Settings, LayoutDashboard, Users, ShoppingBag, Box,
  CreditCard, Zap, MessagesSquare, ChevronDown,
} from "lucide-react";

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "inventory", icon: Box, label: "Inventory" },
  {
    id: "ecommerce", icon: ShoppingBag, label: "E-commerce",
    submenu: [
      { id: "products", label: "Products" },
      { id: "orders", label: "Orders" },
      { id: "customers", label: "Customers" },
    ],
  },
  { id: "transactions", icon: CreditCard, label: "Transactions" },
  {
    id: "users", icon: Users, label: "Users", count: "2.4k",
    submenu: [
      { id: "all-users", label: "All Users" },
      { id: "roles", label: "Roles & Permissions" },
    ],
  },
  { id: "messages", icon: MessagesSquare, label: "Messages", badge: "5" },
  { id: "settings", icon: Settings, label: "Settings" },
];


const avatar = "https://i.pinimg.com/736x/18/70/a0/1870a0c007dde45c3055ad5340ad09d3.jpg";

function Sidebar({ collapsed, currentPage, onPageChange }) {
  const [expandedItems, setExpandedItems] = useState(new Set(["ecommerce"]));

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
                 flex flex-col relative z-20`} // Tăng z-index để nổi bật hơn
    >
      {/* --- 1. Logo đã được cập nhật màu sắc --- */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-slate-700 rounded-xl
                        flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Nexus</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {menuItems.map((item) => {
          // Kiểm tra xem trang hiện tại có nằm trong submenu của item này không
          const isParentActive = item.submenu?.some(sub => sub.id === currentPage);
          const isActive = currentPage === item.id || isParentActive;
          const hasSubmenu = !!item.submenu;
          const isExpanded = expandedItems.has(item.id);

          return (
            <div key={item.id}>
              {/* --- 2. Nút chính đã được cập nhật màu sắc và hover effect --- */}
              <button
                className={`w-full flex items-center justify-between p-3 rounded-xl 
                            transition-all duration-200 
                            ${isActive
                              ? "bg-gradient-to-br from-emerald-500 to-slate-800 text-white shadow-lg shadow-emerald-500/30"
                              : "text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                            }`}
                onClick={() => {
                  if (hasSubmenu) {
                    toggleExpanded(item.id);
                  } else {
                    onPageChange(item.id);
                  }
                }}
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
                {!collapsed && hasSubmenu && (<ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />)}
              </button>

              {/* --- 3. Submenu đã được thêm trạng thái "active" --- */}
              {!collapsed && hasSubmenu && isExpanded && (
                <div className="ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 mt-2 space-y-1">
                  {item.submenu.map((sub) => {
                    const isSubActive = currentPage === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => onPageChange(sub.id)}
                        className={`w-full text-left p-2 text-sm rounded-lg transition-all
                                    ${isSubActive
                                      ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold"
                                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                      >
                        {sub.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <img src= {`${avatar}`} alt="user" className="w-10 h-10 rounded-full ring-2 ring-emerald-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">Sci Nguyen</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Administrator</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;