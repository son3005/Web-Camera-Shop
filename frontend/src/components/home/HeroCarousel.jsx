// frontend/src/components/home/HeroCarousel.jsx
// Hero banner: auto-rotate 4s, overlay tối/nhạt, dark mode friendly
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getBanners } from "../../api/publicApi";

export default function HeroCarousel() {
  const { data = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: getBanners,
  });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!data.length) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % data.length);
    }, 4000);
    return () => clearInterval(t);
  }, [data.length]);

  const slide = data[index] ?? {
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600",
    title: "Tuần lễ khuyến mãi máy ảnh",
    href: "/products",
    subtitle: "Hàng chính hãng • Giá tốt • Giao nhanh",
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow">
      <img
        src={slide.image}
        alt={slide.title ?? "banner"}
        className="w-full aspect-[3/1] object-cover"
        loading="eager"
      />

      {/* Overlay text */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent dark:from-black/60 dark:via-black/30" />

      <div className="absolute inset-0 flex flex-col items-start justify-center p-6 md:p-10 text-white">
        <h3 className="text-2xl md:text-3xl font-semibold drop-shadow">
          {slide.title ?? "Săn deal máy ảnh hôm nay"}
        </h3>
        <p className="opacity-90 mt-1">
          {slide.subtitle ?? "Hàng chính hãng • Giá tốt • Giao nhanh"}
        </p>
        {slide.href && (
          <a
            href={slide.href}
            className="mt-4 btn-emerald rounded-full shadow-lg"
          >
            Xem ưu đãi
          </a>
        )}
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {(data.length ? data : [1, 2, 3]).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition ${
              i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
