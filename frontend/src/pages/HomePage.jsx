// src/pages/HomePage.jsx
// Trang chủ: banner + 2 carousel sản phẩm (nổi bật + mới nhất)

import HeroCarousel from "../components/home/HeroCarousel";
import ProductCarousel from "../components/home/ProductCarousel";

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <section className="container mx-auto px-4 pt-6">
        <div className="surface-panel">
          <div className="p-4 md:p-6">
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* Carousel sản phẩm nổi bật */}
      <section className="container mx-auto px-4 mt-8">
        <div className="surface-panel p-4 md:p-6">
          <ProductCarousel
            title="SẢN PHẨM NỔI BẬT"
            mode="featured"
            carouselId="featured"
            limit={10}
          />
        </div>
      </section>

      {/* Carousel sản phẩm mới nhất */}
      <section className="container mx-auto px-4 mt-8 mb-10">
        <div className="surface-panel p-4 md:p-6">
          <ProductCarousel
            title="SẢN PHẨM MỚI NHẤT"
            mode="newest"
            carouselId="newest"
            limit={10}
          />
        </div>
      </section>
    </div>
  );
}
