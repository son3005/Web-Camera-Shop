import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Phone, Moon, Sun } from "lucide-react";
import { useState } from "react";

export default function Header({ theme = "light", onToggleTheme = () => {} }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e) => {
    e.preventDefault();
    nav(`/products?q=${encodeURIComponent(q)}`);
  };

  // 👉 Hàm scroll xuống footer
  const scrollToFooterSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      className="
    fixed top-0 left-0 w-full z-50
    bg-white/90 dark:bg-slate-900/80
    backdrop-blur-md border-b border-gray-200 dark:border-slate-700
    shadow-sm
  "
    >
      <div className="container mx-auto px-4 h-16 flex items-center gap-4">
        {/* LOGO */}
        <Link
          to="/"
          className="font-extrabold text-lg tracking-tight select-none"
        >
          <span className="text-emerald-600">Web</span>
          <span className="text-gray-900 dark:text-white">Camera</span>
          <span className="text-emerald-600">Shop</span>
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700 dark:text-slate-200">
          <button
            onClick={() => scrollToFooterSection("about-section")}
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            GIỚI THIỆU
          </button>
          <Link
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
            to="/products"
          >
            SẢN PHẨM
          </Link>
          <button
            onClick={() => scrollToFooterSection("contact-section")}
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            LIÊN HỆ
          </button>
          <button
            onClick={() => scrollToFooterSection("policy-section")}
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            CHÍNH SÁCH
          </button>
        </nav>

        {/* SEARCH */}
        <form onSubmit={submit} className="flex-1 max-w-xl">
          <input
            className="ui-input rounded-full bg-white/90 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-100"
            placeholder="Tìm máy ảnh, lens, phụ kiện…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        {/* ACTION ICONS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            title={theme === "dark" ? "Chuyển sáng" : "Chuyển tối"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <a
            href="tel:19001234"
            className="hidden md:flex items-center gap-1 text-sm text-gray-700 dark:text-slate-200"
          >
            <Phone size={18} /> 1900 1234
          </a>

          <Link
            to="/cart"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <ShoppingCart />
          </Link>

          <Link
            to="/account"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <User />
          </Link>
        </div>
      </div>
    </header>
  );
}
