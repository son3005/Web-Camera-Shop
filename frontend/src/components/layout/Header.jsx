// src/components/layout/Header.jsx
// HEADER storefront — chỉ dùng theme sáng, màu giống màn đăng nhập

import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Phone,
  Menu,
  X,
  LogIn,
  Search,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import logo from "../../assets/images/Logo.png";
import { quickSearch } from "../../api/productApi";
import { dangXuat } from "../../redux/slices/authSlice";
import { useCart } from "../../hooks/useCart";

export default function Header() {
  const nav = useNavigate();
  const dispatch = useDispatch();

  // ======= AUTH =======
  const user = useSelector((s) => s.auth?.user || null);

  // ======= CART: ưu tiên số từ server =======
  const { useGetCart } = useCart();
  const { data: cartData } = useGetCart();
  const cartCountFromServer = cartData?.tong_so_luong ?? 0;

  // fallback từ redux
  const cartCountFromRedux = useSelector((s) => s.gioHang?.tongSoLuong ?? 0);

  const cartCount =
    cartCountFromServer && cartCountFromServer > 0
      ? cartCountFromServer
      : cartCountFromRedux;

  // ======= SEARCH STATES =======
  const [q, setQ] = useState("");
  const [suggests, setSuggests] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchBoxRef = useRef(null);

  // ======= MOBILE NAV =======
  const [open, setOpen] = useState(false);

  // ======= USER DROPDOWN =======
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // submit tìm kiếm
  const submit = (e) => {
    e?.preventDefault?.();
    if (!q.trim()) return;
    setOpen(false);
    setShowSuggest(false);
    setActiveIndex(-1);
    nav(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  // debounce quickSearch
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
      } catch (err) {
        setSuggests([]);
        setShowSuggest(false);
      } finally {
        setLoadingSuggest(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [q]);

  // click ra ngoài để đóng suggest + user menu
  useEffect(() => {
    const onClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggest(false);
        setActiveIndex(-1);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // điều hướng trong dropdown search
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

  // click chọn 1 gợi ý
  const onPick = (item) => {
    setShowSuggest(false);
    setActiveIndex(-1);
    setOpen(false);
    nav(`/products/${item.id}`);
  };

  // helper format tiền
  const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

  // ✅ HÀM ĐĂNG XUẤT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("admin_token");
    dispatch(dangXuat());
    setUserMenuOpen(false);
    nav("/dangnhap");
  };

  return (
    <header className="site-header bg-white/90 backdrop-blur-md border-b border-slate-200 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center gap-3">
        {/* mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>

        {/* logo */}
        <Link to="/" className="flex items-center gap-2 select-none">
          <img src={logo} alt="WebCameraShop" className="h-9 w-auto" />
          <span className="hidden sm:inline text-lg font-extrabold tracking-tight text-[var(--auth-text)]">
            <span className="text-[var(--auth-emerald)]">Web</span>
            <span>Camera</span>
            <span className="text-[var(--auth-emerald)]">Shop</span>
          </span>
        </Link>

        {/* menu desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium ml-2 text-slate-700">
          <Link to="/products" className="hover:text-emerald-600 transition">
            SẢN PHẨM
          </Link>
          <a
            href="#about-section"
            className="hover:text-emerald-600 transition"
          >
            GIỚI THIỆU
          </a>
          <Link to="/chinh-sach" className="hover:text-emerald-600 transition">
            CHÍNH SÁCH
          </Link>
          <Link to="/lien-he" className="hover:text-emerald-600 transition">
            LIÊN HỆ
          </Link>
        </nav>

        {/* search box */}
        <div ref={searchBoxRef} className="relative flex-1 max-w-xl">
          <form onSubmit={submit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
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
            <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              {loadingSuggest && (
                <div className="px-4 py-3 text-sm text-slate-500">
                  Đang tìm…
                </div>
              )}

              {!loadingSuggest &&
                suggests.map((it, idx) => (
                  <button
                    key={it.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onPick(it)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 transition ${
                      idx === activeIndex ? "bg-slate-100" : ""
                    }`}
                  >
                    <img
                      src={it.primaryImage}
                      alt={it.name}
                      className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {it.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {it.brand} · {vnd(it.price_from)}
                      </div>
                    </div>
                  </button>
                ))}

              {!loadingSuggest && suggests.length > 0 && (
                <div className="px-3 py-2 border-t border-slate-200 bg-slate-50/60">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={submit}
                    className="w-full text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Xem tất cả kết quả cho “{q}”
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* right actions */}
        <div className="flex items-center gap-2">
          <a
            href="tel:19001234"
            className="hidden md:flex items-center gap-1 text-sm text-slate-600 hover:text-emerald-600"
          >
            <Phone size={18} /> 1900 1234
          </a>

          {/* GIỎ HÀNG */}
          <Link
            to="/cart"
            className="relative p-2 rounded-lg hover:bg-slate-100"
          >
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[var(--auth-emerald)] text-white text-[11px] grid place-items-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {!user && (
            <Link
              to="/dangnhap"
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg btn-emerald text-sm"
            >
              <LogIn size={16} /> Đăng nhập
            </Link>
          )}

          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-sm text-slate-900"
              >
                <span className="max-w-[120px] truncate">
                  {user.ho_ten || user.fullName || user.name || user.email}
                </span>
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
                  <Link
                    to="/tai-khoan"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <User size={16} /> Hồ sơ của tôi
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-slate-100"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* drawer mobile */}
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
          className={`absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white border-r border-slate-200 shadow-2xl p-4 flex flex-col gap-4 transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-8" />
              <span className="font-bold text-slate-900">WebCameraShop</span>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setOpen(false)}
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

          <nav className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            <Link
              to="/products"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              SẢN PHẨM
            </Link>
            <Link
              to="/gioi-thieu"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              GIỚI THIỆU
            </Link>
            <Link
              to="/chinh-sach"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              CHÍNH SÁCH
            </Link>
            <Link
              to="/lien-he"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              LIÊN HỆ
            </Link>

            {!user ? (
              <Link
                to="/dangnhap"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg btn-emerald text-white"
              >
                <LogIn size={18} /> Đăng nhập
              </Link>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            )}
          </nav>
        </aside>
      </div>
    </header>
  );
}
