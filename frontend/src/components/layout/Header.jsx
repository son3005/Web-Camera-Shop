// src/components/layout/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Phone, Menu, X, LogIn } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import logo from "../../assets/images/Logo.png";

export default function Header() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const cartCount = useSelector((s) => s.gioHang?.tongSoLuong ?? 0);

  const submit = (e) => {
    e.preventDefault();
    setOpen(false);
    nav(`/products?q=${encodeURIComponent(q)}`);
  };

  const scrollToFooterSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      setOpen(false);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="site-header">
      <div className="container mx-auto px-4 h-16 flex items-center gap-3">
        {/* Hamburger (mobile) */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setOpen(true)}
          aria-label="Mở menu"
        >
          <Menu />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 select-none">
          <img
            src={logo}
            alt="WebCameraShop"
            className="h-9 w-auto object-contain"
          />
          <span className="hidden sm:inline text-lg font-extrabold tracking-tight">
            <span className="text-emerald-600 dark:text-emerald-500">Web</span>
            <span>Camera</span>
            <span className="text-emerald-600 dark:text-emerald-500">Shop</span>
          </span>
        </Link>

        {/* NAV (desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium ml-2">
          <button
            onClick={() => scrollToFooterSection("about-section")}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            GIỚI THIỆU
          </button>
          <Link
            to="/products"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            SẢN PHẨM
          </Link>
          <button
            onClick={() => scrollToFooterSection("contact-section")}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            LIÊN HỆ
          </button>
          <button
            onClick={() => scrollToFooterSection("policy-section")}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            CHÍNH SÁCH
          </button>
        </nav>

        {/* Search */}
        <form onSubmit={submit} className="flex-1 max-w-xl">
          <input
            className="ui-input rounded-full"
            placeholder="Tìm kiếm máy ảnh"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href="tel:19001234"
            className="hidden md:flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <Phone size={18} /> 1900 1234
          </a>

          <Link
            to="/cart"
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Giỏ hàng"
            title="Giỏ hàng"
          >
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-emerald-600 text-white text-[11px] grid place-items-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <Link
            to="/dangnhap"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Đăng nhập"
            title="Đăng nhập"
          >
            <User />
          </Link>
        </div>
      </div>

      {/* Drawer Mobile */}
      <div
        className={`md:hidden fixed inset-0 z-[60] transition ${
          open ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-2xl p-4 flex flex-col gap-4 transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-8" />
              <span className="font-bold">WebCameraShop</span>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
            >
              <X />
            </button>
          </div>

          <form onSubmit={submit}>
            <input
              className="ui-input"
              placeholder="Tìm kiếm…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>

          <nav className="flex flex-col gap-2 text-sm font-medium">
            <button
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => scrollToFooterSection("about-section")}
            >
              GIỚI THIỆU
            </button>
            <Link
              to="/products"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              SẢN PHẨM
            </Link>
            <button
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => scrollToFooterSection("contact-section")}
            >
              LIÊN HỆ
            </button>
            <button
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => scrollToFooterSection("policy-section")}
            >
              CHÍNH SÁCH
            </button>
            <Link
              to="/dangnhap"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <LogIn size={18} /> Đăng nhập
            </Link>
          </nav>
        </aside>
      </div>
    </header>
  );
}
