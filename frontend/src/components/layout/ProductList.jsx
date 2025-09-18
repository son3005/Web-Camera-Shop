import { useState } from "react";
import { productsByBrand } from "../../data/products"; // import đúng named export
import CardProduct from "../common/CardProduct";

export default function ProductList() {
  // Trạng thái: thương hiệu đang chọn
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6); // số sản phẩm hiển thị ban đầu

  // Gom tất cả sản phẩm từ nhiều thương hiệu
  const allProducts = Object.values(productsByBrand).flat();

  // Xác định danh sách sản phẩm cần hiển thị
  const filteredProducts =
    selectedBrand === "all"
      ? allProducts
      : productsByBrand[selectedBrand] || []; // đảm bảo luôn là array

  return (
    <section className="py-12 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8">
        Danh sách sản phẩm
      </h2>

      {/* Nút chọn thương hiệu */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        <button
          onClick={() => setSelectedBrand("all")}
          className={`px-4 py-2 rounded ${
            selectedBrand === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-blue-100"
          }`}
        >
          Tất cả
        </button>
        {Object.keys(productsByBrand).map((brand) => (
          <button
            key={brand}
            onClick={() => setSelectedBrand(brand)}
            className={`px-4 py-2 rounded capitalize ${
              selectedBrand === brand
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-blue-100"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6">
        {filteredProducts.slice(0, visibleCount).map((product) => (
          <CardProduct key={product.id} product={product} />
        ))}
      </div>

      {/* Nút xem thêm */}
      {visibleCount < filteredProducts.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount(visibleCount + 6)}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Xem thêm
          </button>
        </div>
      )}
    </section>
  );
}
