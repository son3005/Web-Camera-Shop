import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Sidebar from '../components/layout/Admin/Sidebar'; 
import Header from '../components/layout/Admin/Header';
import '../assets/styles/AdminLayout.css';

const queryClient = new QueryClient();

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

  // =================== LOGIC DUY NHẤT ĐIỀU KHIỂN THEME ===================
  // State `theme` tại đây là "nguồn sự thật duy nhất".
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // useEffect này sẽ thêm/xóa class 'dark' trên <html>, ảnh hưởng toàn trang.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Hàm này được tạo ra để truyền xuống cho Header.
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };
  // =======================================================================

  return (
    <QueryClientProvider client={queryClient}>
      <div className="admin-layout-container min-h-screen relative overflow-hidden
                      bg-gradient-to-br 
                      from-emerald-900/50 via-emerald-300/80 to-slate-600
                      dark:from-emerald-950 dark:via-emerald-800 dark:to-slate-900 
                      transition-all duration-500">
        
        <GrainyFilter />

        <div className="flex h-screen overflow-hidden relative z-10">
          <Sidebar collapsed={sidebarCollapsed} />

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Truyền state `theme` và hàm `toggleTheme` xuống cho Header */}
            <Header 
              sidebarColapsed={sidebarCollapsed}
              onToggleSidebar={() => setSideBarCollapsed(!sidebarCollapsed)} 
              theme={theme}
              onToggleTheme={toggleTheme}
            />
            <main className="flex-1 overflow-y-auto bg-transparent">
              <div className="p-6 space-y-6">
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