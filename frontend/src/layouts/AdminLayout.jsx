// src/layouts/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Admin/Sidebar";
import Header from "../components/layout/Admin/Header";
import "../assets/styles/AdminLayout.css";

// Noise filter giữ nguyên
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

  return (
    <div className="admin-layout-container min-h-screen relative overflow-hidden">
      <GrainyFilter />

      <div className="flex h-screen overflow-hidden relative z-10">
        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} />

        {/* Nội dung */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            sidebarColapsed={sidebarCollapsed}
            onToggleSidebar={() => setSideBarCollapsed(!sidebarCollapsed)}
          />

          <main className="flex-1 overflow-y-auto bg-transparent">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
