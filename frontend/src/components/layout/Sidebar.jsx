import React from "react";
import { useState } from "react";
import {
  Settings, LayoutDashboard, BarChart3, Users,
  ShoppingBag, Box, CreditCard, Calendar, FileText,Zap,MessagesSquare,ChevronDown
} from "lucide-react";

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", active: true, badge: "New" },
  {
    id: "analytics", icon: BarChart3, label: "Analytics", submenu: [
      { id: "overview", label: "Overview" },
      { id: "reports", label: "Reports" },
      { id: "insights", label: "Insights" },
    ]
  },
  {
    id: "users", icon: Users, label: "Users", count: "2.4k", submenu: [
      { id: "all-users", label: "All Users" },
      { id: "roles", label: "Roles & Permissions" },
      { id: "activity", label: "User Activity" },
    ]
  },
  {
    id: "ecommerce", icon: ShoppingBag, label: "E-commerce", submenu: [
      { id: "products", label: "Products" },
      { id: "orders", label: "Orders" },
      { id: "customers", label: "Customers" },
    ]
  },
  { id: "inventory", icon: Box, label: "Inventory", count: "847" },
  { id: "transactions", icon: CreditCard, label: "Transactions" },
  {id: "messages", icon: MessagesSquare, label: "Messages", badge: "5"},
  { id: "calendar", icon: Calendar, label: "Calendar" },
  {
    id: "settings", icon: Settings, label: "Settings", submenu: [
      { id: "profile", label: "Profile Settings" },
      { id: "system", label: "System Settings" },
      { id: "billing", label: "Billing & Plans" },
    ]
  },
  {
    id: "reports", icon: FileText, label: "Reports", submenu: [
      { id: "monthly", label: "Monthly Reports" },
      { id: "annual", label: "Annual Reports" },
      { id: "custom", label: "Custom Reports" },
    ]
  },
];

function Sidebar({collapsed,onToggle,currentPage,onPageChange}) {
  const [expandedItems, setExpandedItems] = useState(new Set(["analytics"]));

  const toggleExpanded = (itemid) =>{
    const newExpanded = new Set(expandedItems);

    if (newExpanded.has(itemid)){
      newExpanded.delete(itemid);
    }else{
      newExpanded.add(itemid)
    }

    setExpandedItems(newExpanded);
  }

  return (
    <div className= {`${collapsed? "w-20" : "w-72"}
    transition-all duration-300 ease-in-out bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
      border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col relative z-10`}>

      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-3">
        {/* Logo */}
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl
            flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>

          {/* Conditional Rendering */}
          {!collapsed && (         
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Nexus</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
          </div>
          )}
        </div>
      </div>

     

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button 
            className={`w-full flex items-center justify-between p-3 
            rounded-xl transition-all duration-200 
             ${currentPage === item.id || item.active ? 
             "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25":
             " text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"}`}
             onClick={()=>{
              if(item.submenu)
                {
                  toggleExpanded(item.id)
                }else {
                  onPageChange(item.id)
                }
             }}
             >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />

                {/* Conditional Rendering */}
                <>
                {!collapsed && (
                  <>
                  <span className="font-medium ml-2">
                    {item.label}
                  </span>
                  
                  {item.badge && (<span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">{item.badge}</span>)}
                  {item.count && (<span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full"> {item.count}</span>)}
                  </>
                )}
                  
                 
                </>
              </div>

              {!collapsed && item.submenu && (
                <ChevronDown className={`w-4 h-4 transition-transform`}/>
              )}
            </button>

            {/* Sub Menus */}
            {!collapsed && item.submenu && expandedItems.has(item.id) && (<div clasName="ml-8 mt-2 space-y-1">
              {item.submenu.map((subitem)=>{
                return <button 
                className="w-full text-left p-2 text-sm text-slate-600
                dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200
                hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all">
                  {subitem.label}
                  </button>
              })}
            </div>)}

          </div>
        ))}
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <img
            src="https://i.pinimg.com/736x/18/70/a0/1870a0c007dde45c3055ad5340ad09d3.jpg"
            alt="user"
            className="w-10 h-10 rounded-full ring-2 ring-blue-500"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
              Sci Nguyen
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Administrator
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default Sidebar;
