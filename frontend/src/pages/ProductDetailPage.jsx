// src/pages/ProductDetailPage.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react"; // 🆕 dùng useEffect để set state mặc định
import { useDispatch } from "react-redux";
import { getProduct } from "../api/publicApi";
import { themVaoGio } from "../redux/slices/gioHangSlice";
import RatingStars from "../components/common/RatingStars";
import PriceTag from "../components/common/PriceTag";
import ProductTabs from "../components/product/ProductTabs";

/**
 * Ghi chú về dữ liệu:
 * - Hiện tại FE đang lấy từ publicApi (mock). Field cấp độ có tên `level`.
 * - Khi nối backend thật, backend có thể trả về:
 *      + `level` (khuyến nghị) HOẶC
 *      + `cap_do` (VN) → đã được map sang `level` trong hàm normalizeProduct() của publicApi.
 *   => Vì vậy ở đây chỉ đọc `p.level` là đủ, không cần đổi thêm gì khi switch backend.
 *
 * - Variants:
 *   Hiện mock có mảng `variants`, mỗi biến thể có `color` + `image`.
 *   Backend thật có thể trả `bien_the` (name, color, sku, stock...) → đã chuẩn hoá thành `variants` ở publicApi.
 *   Nếu sau này variant không chỉ có màu, bạn có thể hiển thị label theo `v.name || v.color`.
 */

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

  // Giá hiển thị: đồng bộ với publicApi (ưu tiên price_from)
  const price = p?.price_from ?? p?.sale_price ?? p?.selling_price ?? 0;
  const compareAt = p?.compareAt ?? p?.original_price ?? null;

  // ---- Cấp độ chuyên nghiệp (level) → badge text & style
  const levelLabel = {
    beginner: "Dễ sử dụng (Entry-level)",
    enthusiast: "Bán chuyên (Enthusiast)",
    professional: "Chuyên nghiệp (Professional)",
  };
  const levelStyle = {
    beginner:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    enthusiast: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    professional:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  };

  // Lấy danh sách màu từ variants (nếu backend trả khác key, đã map ở publicApi)
  const colors = useMemo(
    () => (p?.variants || []).map((v) => v?.color).filter(Boolean),
    [p?.variants]
  );

  // 🛠 Không dùng useMemo để set state. Dùng useEffect để set màu mặc định khi colors thay đổi.
  useEffect(() => {
    if (!color && colors.length) setColor(colors[0]);
  }, [colors, color]);

  // Nếu số lượng ảnh thay đổi khiến activeImg vượt bounds → reset về 0 để tránh lỗi
  useEffect(() => {
    const len = p?.images?.length ?? 0;
    if (len > 0 && activeImg >= len) setActiveImg(0);
  }, [p?.images, activeImg]);

  const chosenImage =
    p?.images?.[activeImg] || p?.primaryImage || p?.image || "";

  // ====== Thêm vào giỏ hàng ======
  const addToCart = () => {
    if (!p) return;
    // Nếu có biến thể màu nhưng chưa chọn
    if (!color && colors.length) {
      alert("Vui lòng chọn biến thể màu.");
      return;
    }
    // Gửi dữ liệu tối thiểu để hiển thị giỏ hàng
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

    /**
     * 🔗 Backend thật:
     *  - Thao tác "thêm vào giỏ" thường sẽ gọi API POST /cart/items
     *    với { product_id / variant_id, quantity } để đồng bộ giỏ server-side.
     *  - Ở dự án này bạn đang quản lý giỏ ở Redux → vẫn ổn cho khách vãng lai.
     *  - Khi user đăng nhập, bạn có thể đồng bộ Redux cart lên server:
     *      POST /cart/sync { items: [{variant_id, qty}, ...] }
     */
  };

  // Nút “Mua ngay”: thêm vào giỏ rồi điều hướng tới trang thanh toán
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
                  aria-label={`Xem ảnh ${i + 1}`}
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

              {/* 🆕 badge cấp độ chuyên nghiệp (nếu có) */}
              {p.level && (
                <div className="mt-2">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      levelStyle[p.level] ||
                      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                    title="Cấp độ sản phẩm"
                  >
                    {levelLabel[p.level] || p.level}
                  </span>
                </div>
              )}

              {p.brand && (
                <div className="mt-2 text-slate-600 dark:text-slate-300">
                  {p.brand}
                </div>
              )}

              <div className="mt-2">
                <RatingStars value={p.rating ?? 0} count={p.reviewCount ?? 0} />
              </div>

              <div className="mt-3">
                <PriceTag price={price} compareAt={compareAt} />
              </div>

              {/* trạng thái nhanh (mock UI) */}
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
                          aria-pressed={active}
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

              {/* bullet nhanh (mock) */}
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
