// src/pages/Home.jsx
// Trang chủ ngắn gọn: chỉ gọi các component

import HotProducts from "../components/layout/HotProducts";
import ProductList from "../components/layout/ProductList";

export default function Home() {
  return (
    <div>
      {/* Banner */}
      <section className="h-[400px] bg-gray-200 flex items-center justify-center">
        <img
          src="/src/assets/images/banner.jpg"
          alt="Banner"
          className="h-full w-full object-cover"
        />
      </section>

      {/* Sản phẩm nổi bật */}
      <HotProducts />

      {/* Danh sách sản phẩm */}
      <ProductList />
    </div>
  );
}
