// src/components/home/HeroCarousel.jsx
// Banner slideshow dùng API ảnh trình chiếu (public) – chỉ dùng banner từ admin

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import { getPublicSlides } from "../../api/slideshowApi";

export default function HeroCarousel() {
  const {
    data: slides = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: getPublicSlides,
  });

  const activeSlides = Array.isArray(slides) ? slides : [];

  // =============== Đang tải ===============
  if (isLoading) {
    return (
      <div className="relative rounded-3xl overflow-hidden shadow-xl h-40 md:h-64 lg:h-72 bg-slate-200 dark:bg-slate-800 animate-pulse" />
    );
  }

  // =============== Lỗi API ===============
  if (isError) {
    return (
      <div className="relative rounded-3xl overflow-hidden shadow-xl flex items-center justify-center h-40 md:h-64 lg:h-72 bg-slate-900/80">
        <p className="text-sm md:text-base text-slate-300">
          Không tải được banner. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  // =============== Không có banner nào trong DB ===============
  if (activeSlides.length === 0) {
    return (
      <div className="relative rounded-3xl overflow-hidden shadow-xl flex flex-col items-center justify-center h-40 md:h-64 lg:h-72 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <p className="text-base md:text-lg font-semibold text-slate-100">
          Chưa có banner nào được cấu hình.
        </p>
        <p className="mt-1 text-xs md:text-sm text-slate-400">
          Hãy vào Admin &gt; Cài đặt &gt; Ảnh trình chiếu để thêm banner.
        </p>
      </div>
    );
  }

  // =============== Carousel chính dùng dữ liệu thật ===============
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        loop={activeSlides.length > 1}
        pagination={{
          clickable: true,
        }}
        className="w-full"
      >
        {activeSlides.map((slide, idx) => {
          const image = slide.hinh_anh_url || "";
          const title = slide.tieu_de || "";
          const href = slide.lien_ket || "";
          const subtitle = "Hàng chính hãng • Giá tốt • Giao nhanh";

          const content = (
            <>
              <img
                src={image}
                alt={title || `Banner ${idx + 1}`}
                className="w-full aspect-[3/1] object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-start justify-center px-6 md:px-10 lg:px-14 py-6 text-white">
                {title && (
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold drop-shadow max-w-xl">
                    {title}
                  </h3>
                )}
                <p className="opacity-90 mt-2 text-sm md:text-base">
                  {subtitle}
                </p>
                {href && (
                  <span className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-sm md:text-base font-medium shadow-lg shadow-emerald-500/40 transition">
                    Khám phá ngay
                  </span>
                )}
              </div>
            </>
          );

          return (
            <SwiperSlide key={slide.id ?? idx}>
              {href ? (
                <Link to={href} className="block relative">
                  {content}
                </Link>
              ) : (
                <div className="relative">{content}</div>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
