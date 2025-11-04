// src/components/layout/Header.jsx
// Header chứa logo, nav, giỏ hàng, ô tìm kiếm và user menu.
// ✅ Có dropdown gợi ý tìm kiếm (autocomplete)
// ✅ Đã thay nút user cũ bằng <UserMenu /> để hiện tên + dropdown

import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Phone, Menu, X, LogIn, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import logo from "../../assets/images/Logo.png";
import { quickSearch } from "../../api/publicApi";
import UserMenu from "../common/Auth/UserMenu"; // 👈 THÊM

export default function Header() {
  const nav = useNavigate();

  // --- STATE CHO SEARCH & DROPDOWN GỢI Ý ---
  const [q, setQ] = useState("");
  const [suggests, setSuggests] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  // --- STATE NAV MOBILE ---
  const [open, setOpen] = useState(false);

  // --- SỐ LƯỢNG GIỎ HÀNG ---
  const cartCount = useSelector((s) => s.gioHang?.tongSoLuong ?? 0);

  // submit search
  const submit = (e) => {
    e?.preventDefault?.();
    if (!q.trim()) return;
    setOpen(false);
    setShowSuggest(false);
    setActiveIndex(-1);
    nav(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  // scroll tới section footer
  const scrollToFooterSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      setOpen(false);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // debounce gợi ý
  useEffect(() => {
    let t;
    if (!q.trim()) {
      setSuggests([]);
      setShowSuggest(false);
      setActiveIndex(-1);
      return;
    }
    setLoadingSuggest(true);
    t = setTimeout(async () => {
      try {
        const res = await quickSearch(q.trim(), 6);
        setSuggests(res);
        setShowSuggest(res.length > 0);
      } catch {
        setSuggests([]);
        setShowSuggest(false);
      } finally {
        setLoadingSuggest(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // click ngoài để đóng dropdown
  useEffect(() => {
    const onClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) {
        setShowSuggest(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // điều hướng bằng phím
  const onKeyDown = (e) => {
    if (!showSuggest || suggests.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggests.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggests.length) % suggests.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggests[activeIndex]) {
        const item = suggests[activeIndex];
        setShowSuggest(false);
        setActiveIndex(-1);
        setOpen(false);
        nav(`/products/${item.id}`);
      } else {
        submit();
      }
    } else if (e.key === "Escape") {
      setShowSuggest(false);
      setActiveIndex(-1);
    }
  };

  // click chọn gợi ý
  const onPick = (item) => {
    setShowSuggest(false);
    setActiveIndex(-1);
    setOpen(false);
    nav(`/products/${item.id}`);
  };

  const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

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

        {/* NAV desktop */}
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

        {/* Search + Suggest */}
        <div ref={boxRef} className="relative flex-1 max-w-xl">
          <form onSubmit={submit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                className="ui-input rounded-full pl-9"
                placeholder="Tìm kiếm máy ảnh"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setShowSuggest(suggests.length > 0)}
                onKeyDown={onKeyDown}
              />
            </div>
          </form>

          {showSuggest && (
            <div
              className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
              role="listbox"
            >
              {loadingSuggest && (
                <div className="px-4 py-3 text-sm text-slate-500">
                  Đang tìm…
                </div>
              )}
              {!loadingSuggest && suggests.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-500">
                  Không có kết quả
                </div>
              )}
              {!loadingSuggest &&
                suggests.map((it, idx) => (
                  <button
                    key={it.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onPick(it)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                      idx === activeIndex
                        ? "bg-slate-100 dark:bg-slate-800"
                        : ""
                    }`}
                    role="option"
                    aria-selected={idx === activeIndex}
                  >
                    <img
                      src={it.primaryImage}
                      alt={it.name}
                      className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {it.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {it.brand} · {vnd(it.price_from)}
                      </div>
                    </div>
                  </button>
                ))}
              <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={submit}
                  className="w-full text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  Xem tất cả kết quả cho “{q}”
                </button>
              </div>
            </div>
          )}
        </div>

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

          {/* 👇 Thay vì <Link to="/dangnhap">..., dùng UserMenu để hiện dropdown */}
          <UserMenu />
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
            {/* nút login cho mobile vẫn giữ */}
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
