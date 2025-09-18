// AdminLayout.jsx
import { useState } from "react";
import React from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Dashboard from "../components/common/Dashboard/Dashboard";
import Inventory from "../components/common/Inventory/Inventory";
import '../assets/styles/AdminLayout.css';

const GrainyFilter = () => (
  <svg style={{ display: 'none' }}>
    <filter id="noiseFilter">
      <feTurbulence 
        type="fractalNoise" 
        baseFrequency="0.8" 
        numOctaves="3" 
        stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
      <feComposite operator="in" in2="SourceGraphic" result="monoNoise"/>
      <feComposite operator="atop" in="SourceGraphic" in2="monoNoise" />
    </filter>
  </svg>
);

function AdminLayout() {
  const [sidebarCollapsed, setSideBarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState("inventory");

  return (
    <>
      {/* 3. THÊM className "admin-layout-container" vào div ngoài cùng */}
      <div className="admin-layout-container min-h-screen relative overflow-hidden
                     bg-gradient-to-br 
                     from-emerald-100 via-emerald-300 to-slate-300
                     dark:from-emerald-950 dark:via-emerald-800 dark:to-slate-900 
                     transition-all duration-500">
        
        {/* 4. GỌI component SVG filter để nó được render ra DOM */}
        <GrainyFilter />

        {/* Nội dung còn lại giữ nguyên */}
        <div className="flex h-screen overflow-hidden relative z-10">
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => { setSideBarCollapsed(!sidebarCollapsed) }} 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              sidebarColapsed={sidebarCollapsed}
              onToggleSidebar={() => { setSideBarCollapsed(!sidebarCollapsed) }} 
            />
            <main className="flex-1 overflow-y-auto bg-transparent">
              <div className="p-6 space-y-6">
                {currentPage === "dashboard" && <Dashboard />}
                {currentPage === "inventory" && <Inventory />}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminLayout;