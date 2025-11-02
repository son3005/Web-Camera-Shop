// frontend/src/components/common/ProductCard.jsx
import { Link } from "react-router-dom";
import PriceTag from "./PriceTag";
import RatingStars from "./RatingStars";

export default function ProductCard({ p }) {
  const img =
    p?.primaryImage || p?.image_url || p?.image || p?.images?.[0] || "";

  // Giá hiển thị: ưu tiên price_from (khớp publicApi), fallback price
  const price = p?.price_from ?? p?.price ?? 0;
  const compareAt = p?.compareAt ?? p?.original_price ?? p?.list_price ?? null;

  return (
    <Link
      to={`/products/${p?.id}`}
      className="group block focus:outline-none"
      aria-label={p?.name || "Xem chi tiết sản phẩm"}
    >
      <article
        className="
          surface-card overflow-hidden flex flex-col h-full
          transition-transform duration-300
          focus-within:ring-2 focus-within:ring-emerald-500
          hover:-translate-y-0.5
        "
      >
        {/* Ảnh */}
        <div className="ui-card-thumb md:aspect-square aspect-[4/3]">
          {img ? (
            <img
              src={img}
              alt={p?.name || "product"}
              className="
                w-full h-full object-cover
                transition-transform duration-300
                group-hover:scale-105
              "
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-400 dark:text-slate-500">
              No image
            </div>
          )}
        </div>

        {/* Nội dung */}
        <div className="flex flex-col justify-between p-3 flex-1">
          <div>
            {p?.brand && (
              <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-1">
                {p.brand}
              </div>
            )}
            <h3
              className="
                text-base font-semibold leading-snug line-clamp-2 min-h-[40px]
                text-gray-900 dark:text-white
                group-hover:text-emerald-600 dark:group-hover:text-emerald-400
                transition-colors
              "
              title={p?.name}
            >
              {p?.name}
            </h3>
          </div>

          <div className="mt-2 space-y-1">
            <PriceTag price={price} compareAt={compareAt} />
            <RatingStars value={p?.rating ?? 0} count={p?.reviewCount ?? 0} />
            {/* Giữ chiều cao đồng đều cho hàng badge */}
            <div className="h-6 flex items-center">
              {p?.promoText ? (
                <div className="badge">{p.promoText}</div>
              ) : (
                <div className="opacity-0 badge">placeholder</div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
