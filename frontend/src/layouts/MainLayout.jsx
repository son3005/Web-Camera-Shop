// frontend/src/layouts/MainLayout.jsx
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useEffect } from "react";
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
  // Theo dõi theme hệ thống và gắn class .dark lên <html>
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const root = document.documentElement;

    const apply = () => {
      if (mq.matches) root.classList.add("dark");
      else root.classList.remove("dark");
    };
    apply(); // áp dụng ngay khi load

    // lắng nghe khi người dùng đổi theme hệ thống
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden app-bg grain-overlay transition-all duration-500">
      <GrainyFilter />
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header KHÔNG cần prop theme/toggle nữa */}
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
