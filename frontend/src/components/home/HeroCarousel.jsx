// src/components/home/HeroCarousel.jsx
// Banner đơn giản, nếu chưa có API banner thì hiện mặc định

export default function HeroCarousel() {
  const slide = {
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
        <a
          href={slide.href}
          className="mt-4 btn-emerald rounded-full shadow-lg"
        >
          Xem ưu đãi
        </a>
      </div>
    </div>
  );
}
