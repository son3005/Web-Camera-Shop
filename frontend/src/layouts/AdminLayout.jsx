// src/layouts/AdminLayout.jsx (Đã sửa)
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
// --- (XÓA) Dòng import QueryClientProvider và QueryClient ---
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Sidebar from "../components/layout/Admin/Sidebar";
import Header from "../components/layout/Admin/Header";
import "../assets/styles/AdminLayout.css";

// --- (XÓA) Dòng khởi tạo queryClient ---
// const queryClient = new QueryClient();

// GrainyFilter giữ nguyên
const GrainyFilter = () => (
  <svg style={{ display: "none" }}>
    <filter id="noiseFilter">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.8"
        numOctaves="3"
        stitchTiles="stitch"
      />
      <feColorMatrix type="saturate" values="0" />
      <feComposite operator="in" in2="SourceGraphic" result="monoNoise" />
      <feComposite operator="atop" in="SourceGraphic" in2="monoNoise" />
    </filter>
  </svg>
);

function AdminLayout() {
  const [sidebarCollapsed, setSideBarCollapsed] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  // --- (XÓA) Bỏ thẻ QueryClientProvider bao ngoài ---
  // return (
  //   <QueryClientProvider client={queryClient}>
  return (
    <div
      className="admin-layout-container min-h-screen relative overflow-hidden
                    bg-gradient-to-br
                    from-emerald-900/50 via-emerald-300/80 to-slate-600
                    dark:from-emerald-950 dark:via-emerald-800 dark:to-slate-900
                    transition-all duration-500"
    >
      <GrainyFilter />

      <div className="flex h-screen overflow-hidden relative z-10">
        <Sidebar collapsed={sidebarCollapsed} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            sidebarColapsed={sidebarCollapsed} // Sửa typo: collapsed
            onToggleSidebar={() => setSideBarCollapsed(!sidebarCollapsed)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
          <main className="flex-1 overflow-y-auto bg-transparent">
            {/* Đặt padding trực tiếp ở đây hoặc trong các trang con */}
            <div className="p-6">
              {" "}
              {/* Ví dụ thêm padding */}
              <Outlet /> {/* Nội dung trang con sẽ render ở đây */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
  //   </QueryClientProvider>
  // );
}

export default AdminLayout;
