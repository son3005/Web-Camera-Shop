// frontend/src/pages/ProductDetailPage.jsx
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../api/publicApi";
import PriceTag from "../components/common/priceTag";
import RatingStars from "../components/common/RatingStars";
import ProductTabs from "../components/product/ProductTabs";
import { useState } from "react";

export default function ProductDetailPage() {
  const { productId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(String(productId)),
    enabled: !!productId,
  });

  const [active, setActive] = useState(0);
  const [vIdx, setVIdx] = useState(0);

  if (isLoading || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="skeleton h-[480px]" />
      </div>
    );
  }

  const v = data.variants?.[vIdx];
  const price = v?.price ?? v?.sale_price ?? data.price ?? data.price_from;
  const compareAt = v?.compareAt ?? v?.selling_price ?? data.compareAt;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="surface-panel p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* === Gallery === */}
          <div>
            <div className="aspect-square bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 overflow-hidden">
              <img
                src={data.images?.[active] || data.primaryImage}
                className="w-full h-full object-cover"
                alt={data.name}
              />
            </div>

            <div className="mt-3 grid grid-cols-5 gap-2">
              {(data.images?.length ? data.images : [data.primaryImage]).map(
                (src, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`aspect-square rounded border dark:border-slate-700 ${
                      i === active
                        ? "ring-2 ring-black dark:ring-emerald-400"
                        : ""
                    }`}
                  >
                    <img
                      src={src}
                      className="w-full h-full object-cover rounded"
                      alt={`thumb-${i}`}
                    />
                  </button>
                )
              )}
            </div>
          </div>

          {/* === Info === */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {data.name}
            </h1>
            <div className="mt-1 text-sm text-gray-500 dark:text-slate-300">
              {data.brand}
            </div>

            <div className="mt-2">
              <RatingStars
                value={data.rating ?? 0}
                count={data.reviewCount ?? 0}
              />
            </div>

            <div className="mt-3">
              <PriceTag price={price} compareAt={compareAt} />
            </div>

            {data.promoText && (
              <div className="mt-2 badge">{data.promoText}</div>
            )}

            {!!data.variants?.length && (
              <div className="mt-6">
                <div className="text-sm font-medium mb-2">Chọn biến thể</div>
                <div className="flex flex-wrap gap-2">
                  {data.variants.map((x, i) => (
                    <button
                      key={x.id ?? i}
                      onClick={() => setVIdx(i)}
                      className={`px-3 py-1.5 rounded border dark:border-slate-600 ${
                        i === vIdx
                          ? "bg-black text-white dark:bg-emerald-600"
                          : "bg-white dark:bg-slate-700 dark:text-slate-100"
                      }`}
                    >
                      {x.color ?? x.sku ?? `#${i + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button className="btn-emerald">Mua ngay</button>
              <button className="btn-outline">Thêm vào giỏ</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Tổng quan / Specs / Đánh giá */}
      <ProductTabs
        productId={String(productId)}
        description={data.description}
        specs={data.specs}
      />
    </div>
  );
}
