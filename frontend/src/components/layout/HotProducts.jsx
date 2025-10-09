// HotProducts.jsx
// - Swiper slider hiển thị sản phẩm nổi bật (hotProducts)
// - Khi click một sản phẩm -> openProductDetail(product)
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { hotProducts } from "../../data/products";
import CardProduct from "../common/CardProduct";
import SectionTitle from "../common/SectionTitle";

export default function HotProducts() {
  return (
    <section className="container mx-auto px-4 mt-16" id="hot">
      <SectionTitle>Sản phẩm nổi bật</SectionTitle>

      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={{
          prevEl: ".custom-prev",
          nextEl: ".custom-next",
        }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        grabCursor={true}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
      >
        {/* Nhân đôi mảng để slider dài hơn; dùng index trong key để tránh Math.random */}
        {hotProducts.concat(hotProducts).map((p, index) => (
          <SwiperSlide key={`${p.id}-${index}`}>
            {/* CardProduct đã có onClick mở overlay global */}
            <CardProduct product={p} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom nav buttons */}
      <div className="flex justify-between mt-4">
        <button className="custom-prev text-3xl text-[var(--color-navy-800)] hover:text-[var(--color-accent-green)]">
          ❮
        </button>
        <button className="custom-next text-3xl text-[var(--color-navy-800)] hover:text-[var(--color-accent-green)]">
          ❯
        </button>
      </div>
    </section>
  );
}
