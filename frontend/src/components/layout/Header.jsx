import React from "react";
import {Menu,Search,Filter,Plus,Sun,Bell,Settings} from "lucide-react";


function Header({ sidebarColapsed, onToggleSidebar }) {
  return (
    <>
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300
           hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
           onClick={onToggleSidebar}
           >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            <h1 className="text-2xl font-black text-salte-800 dark:text-white">
              Dashboard
            </h1>
            <p>Welcome back, Sci! here's what's happening today</p>
          </div>
        </div>

        {/* Center */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-1/2" />
            <input 
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
            rounded-xl text-slate-800 dark:text-white placehover-slate-500 forcus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            <button className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">      
            <Filter/>
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Quic Action */}
          <button className="hidden md:flex items-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer">
            <Plus className="w-4 h-4"/>
            <span className="text-sm font-medium">New</span>
          </button>
          {/* Toggle */}
          <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Sun className="w-5 h-5"/>
          </button>

          {/* Notification */}
          <button className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300
          hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5"/>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white 
            text-xs font-bold rounded-full flex items-center justify-center">
              3
              </span>
          </button>

          {/* Settings */}
          <div className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300
          hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Settings className="w-5 h-5"/>
          </div>
          {/* User profile */}
          <div className="flex items-center space-x-3 pl-3 border-1 border-slate-300
          dark:border-slate-700">
            <img 
            src="https://i.pinimg.com/1200x/1e/d0/2f/1ed02f1396fcf5662d0345aaeb408f18.jpg" 
            alt="Avatar"
            className="w-8 h-8 rounded-full ring-2 ring-blue-500" 
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Sci Nguyen
              </p>
              <p className="text-xs">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
   
  );
}
export default Header