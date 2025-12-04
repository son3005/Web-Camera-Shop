// src/components/home/ProductCarousel.jsx
// Carousel sản phẩm dùng Swiper, map thẳng API backend

import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import {
  getProducts,
  getFeaturedProducts,
  getNewestProducts,
} from "../../api/productApi";
import ProductCard from "../common/ProductCard";

export default function ProductCarousel({
  title = "Sản phẩm",
  sort = "",
  carouselId = "default",
  mode = "list", // "list" | "featured" | "newest"
  limit = 12,
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["products-carousel", { mode, sort, limit }],
    queryFn: () => {
      if (mode === "featured") {
        return getFeaturedProducts(limit);
      }
      if (mode === "newest") {
        return getNewestProducts(limit);
      }
      return getProducts({ sort, limit });
    },
  });

  const products =
    mode === "list" ? data?.items || [] : Array.isArray(data) ? data : [];

  const prevId = `carousel-prev-${carouselId}`;
  const nextId = `carousel-next-${carouselId}`;

  return (
    <section className="relative py-6">
      <div className="flex items-end justify-between mb-5 px-2">
        <h2 className="text-lg md:text-xl font-semibold uppercase tracking-wide text-slate-900">
          {title}
        </h2>
      </div>

      <div className="relative group">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-64" />
            ))}
          </div>
        ) : (
          <>
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation={{
                nextEl: `#${nextId}`,
                prevEl: `#${prevId}`,
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              grabCursor={true}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
              className="pb-6 px-1"
            >
              {products.map((p) => (
                <SwiperSlide key={p.id}>
                  <ProductCard p={p} />
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              id={prevId}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 p-3 rounded-full bg-white/90 border border-slate-200 text-slate-600 hover:bg-emerald-500 hover:text-white shadow-md transition"
            >
              ❮
            </button>

            <button
              id={nextId}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 p-3 rounded-full bg-white/90 border border-slate-200 text-slate-600 hover:bg-emerald-500 hover:text-white shadow-md transition"
            >
              ❯
            </button>
          </>
        )}
      </div>
    </section>
  );
}
