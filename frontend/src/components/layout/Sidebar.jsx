import React from "react";
import {Zap} from "lucide-react";

function Sidebar() {
  return (
    <>
        <div className="transition duration-300 ease-in-out bg-white/80 dark:bg-slate-900/80 background-blur-xl
        border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col realtive z-10">
            {/* Logo */}
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl
                flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Conditional Rendering */}
            <div>
                <h1 className="text-lx front font-bold text-slate-800 dark:text-white">
                    Nexus
                </h1>
                <p className="text-xs text-shadow-slate-500 dark:text-slate-400">
                    Admin Panel
                </p>
            </div>
            {/* Navigation I will display Dynamic Menus */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto"></nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <img src="https://i.pinimg.com/736x/18/70/a0/1870a0c007dde45c3055ad5340ad09d3.jpg" 
                    alt="user"
                    className="w-10 h-10 rounded-full ring-2 ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm- font-medium text-slate-800 dark:text-white truncate">Sci Nguyen</p>
                            <p className="text-xs text-salte-500 dark:text-salte-400 truncate">
                                Administrator
                            </p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </>
  );
}
export default Sidebar