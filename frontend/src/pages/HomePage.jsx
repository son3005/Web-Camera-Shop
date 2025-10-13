// frontend/src/pages/HomePage.jsx
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

      <section className="container mx-auto px-4 mt-8">
        <div className="surface-panel p-4 md:p-6">
          <ProductCarousel
            title="SẢN PHẨM KHUYẾN MÃI"
            sort="price_asc"
            carouselId="promo"
          />
        </div>
      </section>

      <section className="container mx-auto px-4 mt-8 mb-10">
        <div className="surface-panel p-4 md:p-6">
          <ProductCarousel title="SẢN PHẨM MỚI" sort="new" carouselId="new" />
        </div>
      </section>
    </div>
  );
}
