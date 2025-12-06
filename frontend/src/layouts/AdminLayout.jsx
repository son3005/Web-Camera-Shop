// src/layouts/AdminLayout.jsx
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/layout/Admin/Sidebar";
import "../assets/styles/AdminLayout.css";

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

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-layout-container">
      <GrainyFilter />

      <div className="relative z-10 min-h-screen flex">
        {/* Sidebar cố định bên trái, width điều khiển bằng prop */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
        />

        {/* Nội dung admin – luôn chiếm phần còn lại, không chồng lên sidebar */}
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full px-4 py-6 md:px-6">
            <Outlet />
          </div>
        </main>
      </div>

      <ScrollRestoration />
    </div>
  );
}
