// ProductList.jsx
// - Hiển thị danh sách sản phẩm theo brand + sort + "xem thêm"
// - Khi click sản phẩm -> openProductDetail (global)
import { useState } from "react";
import { productsByBrand } from "../../data/products";
import CardProduct from "../common/CardProduct";
import Button from "../common/Button";
import SortOptions from "../common/SortOptions";
import SectionTitle from "../common/SectionTitle";

// NOTE: Đã bỏ ProductDetailOverlay cục bộ — overlay hiện tại global (ProductDetailOverlay component được mount 1 lần ở MainLayout)
export default function ProductList() {
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const [sortBy, setSortBy] = useState("default");

  const allProducts = Object.values(productsByBrand).flat();
  let filteredProducts =
    selectedBrand === "all"
      ? allProducts
      : productsByBrand[selectedBrand] || [];

  // Sắp xếp client-side (nếu cần nâng cấp nên gọi API)
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "priceLow") return (a.price || 0) - (b.price || 0);
    if (sortBy === "priceHigh") return (b.price || 0) - (a.price || 0);
    if (sortBy === "bestSelling") return Math.random() - 0.5; // placeholder
    return 0;
  });

  return (
    <section className="py-12 bg-gray-50 relative" id="products">
      <SectionTitle>Danh sách sản phẩm</SectionTitle>

      {/* Brand filter */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        <Button
          type={selectedBrand === "all" ? "primary" : "secondary"}
          onClick={() => setSelectedBrand("all")}
        >
          Tất cả
        </Button>

        {Object.keys(productsByBrand).map((brand) => (
          <Button
            key={brand}
            type={selectedBrand === brand ? "primary" : "secondary"}
            onClick={() => setSelectedBrand(brand)}
            className="capitalize"
          >
            {brand}
          </Button>
        ))}
      </div>

      {/* Sort */}
      <SortOptions sortBy={sortBy} setSortBy={setSortBy} />

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6">
        {filteredProducts.slice(0, visibleCount).map((product) => (
          <CardProduct key={product.id} product={product} />
        ))}
      </div>

      {/* View more */}
      {visibleCount < filteredProducts.length && (
        <div className="flex justify-center mt-8">
          <Button
            type="primary"
            onClick={() => setVisibleCount(visibleCount + 6)}
          >
            Xem thêm
          </Button>
        </div>
      )}
    </section>
  );
}
