// src/components/common/ProductCard.jsx
// Card sản phẩm dùng chung cho list, carousel

import { Link } from "react-router-dom";
import PriceTag from "./PriceTag";
import RatingStars from "./RatingStars";

export default function ProductCard({ p, compact = false }) {
  // ====== ẢNH SẢN PHẨM ======
  const img =
    p?.primaryImage ||
    p?.image_url ||
    p?.image ||
    p?.images?.[0] ||
    // fallback theo cấu trúc backend mới: cac_bien_the[0].hinh_anhs[..].url
    p?.cac_bien_the?.[0]?.hinh_anhs?.find((h) => h.la_anh_dai_dien)?.url ||
    p?.cac_bien_the?.[0]?.hinh_anhs?.[0]?.url ||
    "";

  // ====== GIÁ ======
  const rawPriceFrom =
    p?.price_from ??
    p?.price ??
    p?.gia_ban ??
    p?.cac_bien_the?.[0]?.gia_ban ??
    0;

  const price = Number(rawPriceFrom) || 0;
  const compareAt = p?.compareAt ?? p?.original_price ?? p?.list_price ?? null;

  // ====== TÊN / THƯƠNG HIỆU ======
  const brand = p?.brand || p?.thuong_hieu?.ten_thuong_hieu || "";
  const name = p?.name || p?.ten_san_pham || "";

  // ====== RATING & SỐ LƯỢT ĐÁNH GIÁ ======
  const ratingValueRaw =
    p?.rating ??
    p?.avg_rating ??
    p?.average_rating ??
    p?.so_sao_trung_binh ?? // từ SanPham
    0;

  const ratingCountRaw =
    p?.reviewCount ??
    p?.review_count ??
    p?.so_luong_danh_gia ?? // từ SanPham
    0;

  const ratingValue = Number(ratingValueRaw) || 0; // ví dụ "5.0" -> 5
  const ratingCount = Number(ratingCountRaw) || 0;

  // ====== CLASS TÊN SẢN PHẨM ======
  const titleClass = compact
    ? "text-sm font-semibold leading-snug line-clamp-2 min-h-[32px] text-slate-900 group-hover:text-emerald-600 transition-colors"
    : "text-base font-semibold leading-snug line-clamp-2 min-h-[40px] text-slate-900 group-hover:text-emerald-600 transition-colors";

  return (
    <Link
      to={`/products/${p?.id}`}
      className="group block focus:outline-none"
      aria-label={name || "Xem chi tiết sản phẩm"}
    >
      <article
        className={`surface-card overflow-hidden flex flex-col h-full transition-transform duration-300 focus-within:ring-2 focus-within:ring-emerald-500 hover:-translate-y-0.5 ${
          compact ? "rounded-2xl" : "rounded-[22px]"
        }`}
      >
        {/* Ảnh */}
        <div
          className={
            compact
              ? "ui-card-thumb aspect-[4/3]"
              : "ui-card-thumb md:aspect-square aspect-[4/3]"
          }
        >
          {img ? (
            <img
              src={img}
              alt={name || "product"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-slate-400 text-xs">
              No image
            </div>
          )}
        </div>

        {/* Nội dung */}
        <div
          className={`flex flex-col justify-between flex-1 ${
            compact ? "p-3" : "p-4"
          }`}
        >
          <div>
            {brand && (
              <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1 line-clamp-1">
                {brand}
              </div>
            )}
            <h3 className={titleClass} title={name}>
              {name}
            </h3>
          </div>

          <div className="mt-2 space-y-1">
            <PriceTag price={price} compareAt={compareAt} />

            {/* ⭐ Sao + số lượt đánh giá */}
            <RatingStars value={ratingValue} count={ratingCount} />

            {/* placeholder để chiều cao đều nhau */}
            <div className="h-5" />
          </div>
        </div>
      </article>
    </Link>
  );
}
