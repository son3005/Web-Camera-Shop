// src/layouts/MainLayout.jsx
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import SocialBar from "../components/layout/SocialBar";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header cố định trên cùng */}
      <Header />

      {/* Nội dung chính */}
      <main className="flex-1 mt-20">{children}</main>

      {/* Footer */}
      <Footer />

      {/* Social bar (Facebook, Zalo) */}
      <SocialBar />
    </div>
  );
}
