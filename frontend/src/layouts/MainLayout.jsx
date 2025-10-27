// frontend/src/layouts/MainLayout.jsx
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useEffect, useState } from "react";
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
  // Dark/Light toggle giống Admin
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  useEffect(() => {
    const root = document.documentElement;
    theme === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="relative min-h-screen overflow-hidden app-bg transition-all duration-500">
      <GrainyFilter />
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{ filter: "url(#noiseFilter)" }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-1 mt-16">
          <Outlet />
        </main>
        <Footer />
      </div>

      <ScrollRestoration />
    </div>
  );
}
