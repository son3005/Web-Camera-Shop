// src/pages/ProductDetailPage.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { getProduct } from "../api/publicApi";
import { themVaoGio } from "../redux/slices/gioHangSlice";
import RatingStars from "../components/common/RatingStars";
import PriceTag from "../components/common/PriceTag";
import ProductTabs from "../components/product/ProductTabs";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const nav = useNavigate();
  const dispatch = useDispatch();

  const { data: p, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
  });

  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);

  const price = p?.price_from ?? p?.sale_price ?? p?.selling_price ?? 0;
  const compareAt = p?.compareAt ?? p?.original_price ?? null;

  const colors = useMemo(
    () => (p?.variants || []).map((v) => v.color).filter(Boolean),
    [p?.variants]
  );

  useMemo(() => {
    if (!color && colors.length) setColor(colors[0]);
  }, [colors, color]);

  const chosenImage =
    p?.images?.[activeImg] || p?.primaryImage || p?.image || "";

  // ====== Xử lý giỏ hàng ======
  const addToCart = () => {
    if (!p) return;
    if (!color && colors.length) return alert("Vui lòng chọn biến thể màu.");
    dispatch(
      themVaoGio({
        productId: p.id,
        name: p.name,
        image: chosenImage,
        price: price,
        color: color || "default",
        quantity: qty,
      })
    );
  };

  // Nút “Mua ngay”: thêm vào giỏ rồi sang /checkout
  const buyNow = () => {
    addToCart();
    nav("/checkout");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="skeleton h-72 mb-6" />
        <div className="skeleton h-40" />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        Không tìm thấy sản phẩm.
        <div className="mt-3">
          <Link to="/products" className="btn-emerald rounded-xl px-4 py-2">
            Về trang sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <div className="container mx-auto px-4 py-6">
        {/* breadcrumb */}
        <nav className="text-sm text-gray-700 dark:text-slate-200 mb-4">
          <Link to="/" className="hover:underline">
            Trang chủ
          </Link>{" "}
          /{" "}
          <Link to="/products" className="hover:underline">
            Sản phẩm
          </Link>{" "}
          / <span>{p.name}</span>
        </nav>

        <div className="grid grid-cols-12 gap-6">
          {/* Hình lớn + thumbnails */}
          <div className="col-span-12 md:col-span-6">
            <div className="surface-panel overflow-hidden">
              <img
                src={chosenImage}
                alt={p.name}
                className="w-full object-cover md:aspect-square aspect-[4/3]"
              />
            </div>
            <div className="flex gap-3 mt-3">
              {(p.images || []).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 rounded-xl overflow-hidden border transition
                    ${
                      i === activeImg
                        ? "border-emerald-500"
                        : "border-black/10 dark:border-white/10 opacity-80 hover:opacity-100"
                    }`}
                >
                  <img
                    src={img}
                    alt={`thumb-${i}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Thông tin bên phải */}
          <div className="col-span-12 md:col-span-6">
            <div className="surface-panel p-4 md:p-6">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {p.name}
              </h1>
              {p.brand && (
                <div className="mt-1 text-slate-600 dark:text-slate-300">
                  {p.brand}
                </div>
              )}
              <div className="mt-2">
                <RatingStars value={p.rating ?? 0} count={p.reviewCount ?? 0} />
              </div>

              <div className="mt-3">
                <PriceTag price={price} compareAt={compareAt} />
              </div>

              {/* trạng thái nhanh */}
              <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm">
                <div className="ui-input bg-transparent">
                  Tình trạng: <span className="font-semibold">Còn hàng</span>
                </div>
                <div className="ui-input bg-transparent">
                  Bảo hành: <span className="font-semibold">24 tháng</span>
                </div>
                <div className="ui-input bg-transparent">
                  Giao nhanh: <span className="font-semibold">2–4 giờ</span>
                </div>
                <div className="ui-input bg-transparent">
                  Đổi trả: <span className="font-semibold">15 ngày</span>
                </div>
              </div>

              {/* chọn biến thể */}
              {colors.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-semibold mb-2">
                    Chọn biến thể
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => {
                      const active = c === color;
                      return (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={`px-4 py-2 rounded-xl border text-sm font-medium transition
                            ${
                              active
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white text-slate-900 border-black/15 hover:bg-black/5 dark:bg-slate-800 dark:text-slate-100 dark:border-white/15 dark:hover:bg-white/10"
                            }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* số lượng + nút */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center border rounded-xl overflow-hidden dark:border-white/15">
                  <button
                    className="px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Giảm số lượng"
                  >
                    –
                  </button>
                  <div className="px-5 py-2 min-w-10 text-center select-none">
                    {qty}
                  </div>
                  <button
                    className="px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => setQty((q) => q + 1)}
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={addToCart}
                  className="px-5 py-2 rounded-xl border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white transition font-semibold"
                >
                  Thêm vào giỏ
                </button>

                <button
                  onClick={buyNow}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
                >
                  Mua ngay
                </button>
              </div>

              {/* bullet nhanh */}
              <ul className="mt-4 list-disc pl-6 text-slate-800 dark:text-slate-200 space-y-1">
                <li>Cảm biến Full-Frame, chống rung 5 trục.</li>
                <li>Quay 4K UHD, lấy nét nhanh, theo dõi mắt.</li>
                <li>Wi-Fi/Bluetooth, 2 khe thẻ SD (UHS-II).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs: mô tả / thông số / đánh giá */}
        <ProductTabs
          productId={p.id}
          description={p.description}
          specs={p.specs}
        />
      </div>
    </div>
  );
}
