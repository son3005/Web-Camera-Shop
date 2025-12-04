// src/layouts/MainLayout.jsx
// Layout chính: Header + Footer + Outlet (chỉ dùng giao diện sáng)

import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../assets/styles/MainLayout.css";

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

export default function MainLayout() {
  // Không còn auto dark theo hệ điều hành – luôn là light

  return (
    <div className="relative min-h-screen overflow-hidden app-bg grain-overlay transition-all duration-500">
      <GrainyFilter />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 mt-16">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ScrollRestoration />
    </div>
  );
}
