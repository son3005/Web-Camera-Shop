// src/components/layout/HotProducts.jsx
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
        autoplay={{ delay: 3000 }}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
      >
        {hotProducts.concat(hotProducts).map(
          (
            p // thêm cho nhiều slide
          ) => (
            <SwiperSlide key={p.id + Math.random()}>
              <CardProduct product={p} />
            </SwiperSlide>
          )
        )}
      </Swiper>

      {/* Nút điều hướng custom */}
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
