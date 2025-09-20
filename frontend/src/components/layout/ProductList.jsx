// Danh sách sản phẩm + filter theo thương hiệu + sort + "Xem thêm"

import { useState } from "react";
// Hook useState để quản lý trạng thái (brand đang chọn, số sản phẩm hiển thị, kiểu sort)

import { productsByBrand } from "../../data/products";
// Import dữ liệu sản phẩm được chia theo brand (canon, sony,...)

import CardProduct from "../common/CardProduct";
// Component card sản phẩm

import Button from "../common/Button";
// Nút tái sử dụng (primary = xanh lá, secondary = xám)

import SortOptions from "../common/SortOptions";
// Component dropdown sắp xếp sản phẩm

import SectionTitle from "../common/SectionTitle";
// Component tiêu đề section (hiển thị ở giữa, chữ to)

export default function ProductList() {
  // Trạng thái: brand đang chọn
  const [selectedBrand, setSelectedBrand] = useState("all");

  // Trạng thái: số sản phẩm hiển thị
  const [visibleCount, setVisibleCount] = useState(6);

  // Trạng thái: kiểu sort
  const [sortBy, setSortBy] = useState("default");

  // Gom toàn bộ sản phẩm từ nhiều brand thành 1 mảng
  const allProducts = Object.values(productsByBrand).flat();

  // Nếu chọn "all" → hiển thị tất cả, ngược lại chỉ hiển thị brand đang chọn
  let filteredProducts =
    selectedBrand === "all"
      ? allProducts
      : productsByBrand[selectedBrand] || [];

  // Áp dụng sort (dựa trên state sortBy)
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "priceLow") return a.price - b.price; // giá thấp → cao
    if (sortBy === "priceHigh") return b.price - a.price; // giá cao → thấp
    if (sortBy === "bestSelling") {
      // 🚧 hiện tại sort random, sau này backend trả về dữ liệu "bestSelling"
      return Math.random() - 0.5;
    }
    return 0; // giữ nguyên (mặc định)
  });

  return (
    <section className="py-12 bg-gray-50" id="products">
      {/* Tiêu đề section */}
      <SectionTitle>Danh sách sản phẩm</SectionTitle>

      {/* Nút chọn thương hiệu */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {/* Nút "Tất cả" */}
        <Button
          type={selectedBrand === "all" ? "primary" : "secondary"}
          onClick={() => setSelectedBrand("all")}
        >
          Tất cả
        </Button>

        {/* Các brand khác */}
        {Object.keys(productsByBrand).map((brand) => (
          <Button
            key={brand}
            type={selectedBrand === brand ? "primary" : "secondary"}
            onClick={() => setSelectedBrand(brand)}
            className="capitalize" // Viết hoa chữ cái đầu
          >
            {brand}
          </Button>
        ))}
      </div>

      {/* Dropdown sort */}
      <SortOptions sortBy={sortBy} setSortBy={setSortBy} />

      {/* Lưới sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6">
        {filteredProducts.slice(0, visibleCount).map((product) => (
          <CardProduct key={product.id} product={product} />
        ))}
      </div>

      {/* Nút "Xem thêm" (chỉ hiện khi còn sản phẩm chưa hiển thị) */}
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
