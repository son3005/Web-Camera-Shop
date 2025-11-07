// src/components/layout/Header.jsx
// ====================================================================
// HEADER
// - Hiển thị logo + menu (Sản phẩm, Giới thiệu, Chính sách, Liên hệ)
// - Ô tìm kiếm có gợi ý (gọi quickSearch từ backend của bạn)
// - Hiển thị giỏ hàng (lấy số lượng từ redux.gioHang)
// - QUAN TRỌNG: Nếu đã đăng nhập (redux.auth.user tồn tại) thì
//      + hiện tên user
//      + bấm vào xổ dropdown: "Hồ sơ", "Đăng xuất"
//   Nếu chưa đăng nhập thì hiện nút "Đăng nhập"
// - Có drawer cho mobile
// ====================================================================

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
// action logout từ authSlice của bạn
import { dangXuat } from "../../redux/slices/authSlice";

export default function Header() {
  // hook điều hướng
  const nav = useNavigate();
  // hook để bắn action logout
  const dispatch = useDispatch();

  // ==============================
  // LẤY STATE TỪ REDUX
  // ==============================
  // user sau khi đăng nhập bạn thường lưu ở auth.user
  const user = useSelector((s) => s.auth?.user || null);
  // số lượng giỏ hàng (nếu chưa có thì 0)
  const cartCount = useSelector((s) => s.gioHang?.tongSoLuong ?? 0);

  // ==============================
  // STATE TÌM KIẾM + GỢI Ý
  // ==============================
  const [q, setQ] = useState(""); // nội dung ô search
  const [suggests, setSuggests] = useState([]); // danh sách gợi ý
  const [showSuggest, setShowSuggest] = useState(false); // có bật dropdown không
  const [loadingSuggest, setLoadingSuggest] = useState(false); // đang gọi API
  const [activeIndex, setActiveIndex] = useState(-1); // mục đang được chọn bằng phím ↑↓

  // ref để click ngoài thì đóng dropdown tìm kiếm
  const searchBoxRef = useRef(null);

  // ==============================
  // STATE NAV MOBILE
  // ==============================
  const [open, setOpen] = useState(false); // true → mở drawer mobile

  // ==============================
  // STATE DROPDOWN USER
  // ==============================
  const [userMenuOpen, setUserMenuOpen] = useState(false); // true → mở dropdown user
  const userMenuRef = useRef(null); // ref để click ngoài đóng lại

  // ==============================
  // SUBMIT TÌM KIẾM (enter)
  // ==============================
  const submit = (e) => {
    e?.preventDefault?.();
    // nếu rỗng thì thôi
    if (!q.trim()) return;
    // đóng các popup
    setOpen(false);
    setShowSuggest(false);
    setActiveIndex(-1);
    // điều hướng sang trang sản phẩm với query
    nav(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  // ==============================
  // DEBOUNCE GỌI quickSearch
  // gọi sau 250ms người dùng dừng gõ
  // ==============================
  useEffect(() => {
    let t;
    // nếu input trống thì xóa gợi ý
    if (!q.trim()) {
      setSuggests([]);
      setShowSuggest(false);
      setActiveIndex(-1);
      return;
    }

    setLoadingSuggest(true);

    // gọi thật
    t = setTimeout(async () => {
      try {
        const res = await quickSearch(q.trim(), 6); // gọi /api/san-pham?search=...
        setSuggests(res);
        // chỉ mở dropdown nếu có dữ liệu
        setShowSuggest(res.length > 0);
      } catch (err) {
        // lỗi thì ẩn dropdown
        setSuggests([]);
        setShowSuggest(false);
      } finally {
        setLoadingSuggest(false);
      }
    }, 250);

    // clear timer nếu user gõ tiếp
    return () => clearTimeout(t);
  }, [q]);

  // ==============================
  // CLICK RA NGOÀI → đóng search & user dropdown
  // ==============================
  useEffect(() => {
    const onClick = (e) => {
      // đóng dropdown search
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggest(false);
        setActiveIndex(-1);
      }
      // đóng dropdown user
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ==============================
  // ĐIỀU HƯỚNG BẰNG PHÍM TRONG DROPDOWN TÌM KIẾM
  // ==============================
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
      // nếu đang chọn 1 item trong gợi ý → đi thẳng tới chi tiết
      if (activeIndex >= 0 && suggests[activeIndex]) {
        const item = suggests[activeIndex];
        setShowSuggest(false);
        setActiveIndex(-1);
        setOpen(false);
        nav(`/products/${item.id}`);
      } else {
        // không thì tìm kiếm bình thường
        submit();
      }
    } else if (e.key === "Escape") {
      setShowSuggest(false);
      setActiveIndex(-1);
    }
  };

  // ==============================
  // KHI CLICK CHỌN 1 GỢI Ý
  // ==============================
  const onPick = (item) => {
    setShowSuggest(false);
    setActiveIndex(-1);
    setOpen(false);
    nav(`/products/${item.id}`);
  };

  // format VND cho gợi ý
  const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

  // ==============================
  // ĐĂNG XUẤT
  // ==============================
  const handleLogout = () => {
    dispatch(dangXuat()); // xoá state auth + localStorage token theo logic của bạn
    setUserMenuOpen(false);
    nav("/dangnhap"); // đưa về trang login
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <header className="site-header bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center gap-3">
        {/* nút mở menu trên mobile */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>

        {/* logo + tên web */}
        <Link to="/" className="flex items-center gap-2 select-none">
          <img src={logo} alt="WebCameraShop" className="h-9 w-auto" />
          <span className="hidden sm:inline text-lg font-extrabold tracking-tight">
            <span className="text-emerald-600 dark:text-emerald-500">Web</span>
            <span>Camera</span>
            <span className="text-emerald-600 dark:text-emerald-500">Shop</span>
          </span>
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium ml-2">
          <Link
            to="/products"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            SẢN PHẨM
          </Link>
          <Link
            to="/gioi-thieu"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            GIỚI THIỆU
          </Link>
          <Link
            to="/chinh-sach"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            CHÍNH SÁCH
          </Link>
          <Link
            to="/lien-he"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            LIÊN HỆ
          </Link>
        </nav>

        {/* Ô TÌM KIẾM */}
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

          {/* DROPDOWN GỢI Ý TÌM KIẾM */}
          {showSuggest && (
            <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
              {/* trạng thái đang tải */}
              {loadingSuggest && (
                <div className="px-4 py-3 text-sm text-slate-500">
                  Đang tìm…
                </div>
              )}

              {/* danh sách gợi ý */}
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
                  >
                    {/* ảnh nhỏ bên trái */}
                    <img
                      src={it.primaryImage}
                      alt={it.name}
                      className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    {/* thông tin tên + giá */}
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

              {/* nút xem thêm */}
              {!loadingSuggest && suggests.length > 0 && (
                <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={submit}
                    className="w-full text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    Xem tất cả kết quả cho “{q}”
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CÁC NÚT BÊN PHẢI */}
        <div className="flex items-center gap-2">
          {/* Hotline */}
          <a
            href="tel:19001234"
            className="hidden md:flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <Phone size={18} /> 1900 1234
          </a>

          {/* Giỏ hàng */}
          <Link
            to="/cart"
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-emerald-600 text-white text-[11px] grid place-items-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* ===== Nếu CHƯA đăng nhập → nút đăng nhập ===== */}
          {!user && (
            <Link
              to="/dangnhap"
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
            >
              <LogIn size={16} /> Đăng nhập
            </Link>
          )}

          {/* ===== Nếu ĐÃ đăng nhập → hiện tên + dropdown ===== */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              {/* nút bấm để mở dropdown */}
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
              >
                {/* tên có thể lấy từ nhiều field khác nhau */}
                <span className="max-w-[120px] truncate">
                  {user.ho_ten || user.fullName || user.name || user.email}
                </span>
                <ChevronDown size={14} />
              </button>

              {/* hộp dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
                  <Link
                    to="/tai-khoan"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <User size={16} /> Hồ sơ của tôi
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DRAWER MOBILE */}
      <div
        className={`md:hidden fixed inset-0 z-[60] transition ${
          open ? "" : "pointer-events-none"
        }`}
      >
        {/* lớp tối */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        {/* hộp menu */}
        <aside
          className={`absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-2xl p-4 flex flex-col gap-4 transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* header drawer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-8" />
              <span className="font-bold">WebCameraShop</span>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setOpen(false)}
            >
              <X />
            </button>
          </div>

          {/* ô search nhỏ trong drawer */}
          <form onSubmit={submit}>
            <input
              className="ui-input"
              placeholder="Tìm kiếm…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>

          {/* menu mobile */}
          <nav className="flex flex-col gap-2 text-sm font-medium">
            <Link
              to="/products"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              SẢN PHẨM
            </Link>
            <Link
              to="/gioi-thieu"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              GIỚI THIỆU
            </Link>
            <Link
              to="/chinh-sach"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              CHÍNH SÁCH
            </Link>
            <Link
              to="/lien-he"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              LIÊN HỆ
            </Link>

            {/* nếu chưa login trên mobile */}
            {!user ? (
              <Link
                to="/dangnhap"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
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
