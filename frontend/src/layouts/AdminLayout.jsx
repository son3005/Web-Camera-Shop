// AdminLayout.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; // <<< Chỉ import thêm Outlet
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import các component và CSS của bạn
import Sidebar from '../components/layout/Admin/Sidebar'; 
import Header from '../components/layout/Admin/Header';
import '../assets/styles/AdminLayout.css';

const queryClient = new QueryClient();

// Component GrainyFilter của bạn được giữ nguyên
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
  // State quản lý sidebar được giữ nguyên
  const [sidebarCollapsed, setSideBarCollapsed] = useState(false);

  // --- THAY ĐỔI DUY NHẤT: BỎ STATE `currentPage` ---
  // const [currentPage, setCurrentPage] = useState("dashboard");
  // React Router sẽ quản lý trang nào được hiển thị thông qua URL.

  return (
    // Bọc tất cả bằng QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <div className="admin-layout-container min-h-screen relative overflow-hidden
                       bg-gradient-to-br 
                       from-emerald-900/50 via-emerald-300/80 to-slate-600
                       dark:from-emerald-950 dark:via-emerald-800 dark:to-slate-900 
                       transition-all duration-500">
        
        <GrainyFilter />

        <div className="flex h-screen overflow-hidden relative z-10">
          
          {/* Truyền props cho Sidebar, bỏ `currentPage` và `onPageChange` */}
          <Sidebar 
            collapsed={sidebarCollapsed} 
            // onToggle không có trong file gốc của bạn, nhưng tôi thêm lại logic này cho Header
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              sidebarColapsed={sidebarCollapsed}
              onToggleSidebar={() => { setSideBarCollapsed(!sidebarCollapsed) }} 
            />
            <main className="flex-1 overflow-y-auto bg-transparent">
              <div className="p-6 space-y-6">

                {/* --- THAY ĐỔI DUY NHẤT: THAY THẾ LOGIC RENDER BẰNG <Outlet /> --- */}
                {/* Thay vì kiểm tra state `currentPage`, chúng ta để <Outlet /> ở đây. */}
                {/* React Router sẽ tự động render component đúng (Dashboard, Inventory,...) */}
                {/* vào vị trí này dựa trên URL. */}
                <Outlet />
                
              </div>
            </main>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default AdminLayout;