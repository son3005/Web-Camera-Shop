// src/components/home/HeroCarousel.jsx
// Banner dùng API ảnh trình chiếu; fallback nếu chưa có dữ liệu

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getPublicSlides } from "../../api/slideshowApi";

const FALLBACK_SLIDE = {
  image:
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600",
  title: "Tuần lễ khuyến mãi máy ảnh",
  href: "/products",
  subtitle: "Hàng chính hãng • Giá tốt • Giao nhanh",
};

export default function HeroCarousel() {
  const {
    data: slides,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: getPublicSlides,
  });

  const activeSlides = (slides || []).filter((s) => s.da_kich_hoat !== false);
  const slideRaw = activeSlides[0] || slides?.[0];

  const slide = slideRaw
    ? {
        image: slideRaw.duong_dan_anh || FALLBACK_SLIDE.image,
        title: slideRaw.tieu_de || FALLBACK_SLIDE.title,
        subtitle: slideRaw.mo_ta || FALLBACK_SLIDE.subtitle,
        href: slideRaw.lien_ket || FALLBACK_SLIDE.href,
      }
    : FALLBACK_SLIDE;

  if (isLoading) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow h-40 md:h-64 bg-slate-200 dark:bg-slate-800 animate-pulse" />
    );
  }

  if (isError) {
    // fallback dùng banner mặc định
    return (
      <div className="relative rounded-2xl overflow-hidden shadow">
        <img
          src={FALLBACK_SLIDE.image}
          alt={FALLBACK_SLIDE.title}
          className="w-full aspect-[3/1] object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent dark:from-black/60 dark:via-black/30" />
        <div className="absolute inset-0 flex flex-col items-start justify-center p-6 md:p-10 text-white">
          <h3 className="text-2xl md:text-3xl font-semibold drop-shadow">
            {FALLBACK_SLIDE.title}
          </h3>
          <p className="opacity-90 mt-1">{FALLBACK_SLIDE.subtitle}</p>
          <Link
            to={FALLBACK_SLIDE.href}
            className="mt-4 btn-emerald rounded-full shadow-lg"
          >
            Xem ưu đãi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow">
      <img
        src={slide.image}
        alt={slide.title}
        className="w-full aspect-[3/1] object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent dark:from-black/60 dark:via-black/30" />
      <div className="absolute inset-0 flex flex-col items-start justify-center p-6 md:p-10 text-white">
        <h3 className="text-2xl md:text-3xl font-semibold drop-shadow">
          {slide.title}
        </h3>
        <p className="opacity-90 mt-1">{slide.subtitle}</p>
        <Link
          to={slide.href}
          className="mt-4 btn-emerald rounded-full shadow-lg"
        >
          Xem ưu đãi
        </Link>
      </div>
    </div>
  );
}
