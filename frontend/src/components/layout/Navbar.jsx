import { useState } from "react";
import { productsByBrand } from "../../data/products"; // Import dữ liệu sản phẩm
import { FaShoppingCart, FaSearch } from "react-icons/fa"; // Icon giỏ hàng và tìm kiếm

export default function Navbar() {
  // Trạng thái cho tìm kiếm
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Gộp tất cả sản phẩm từ nhiều thương hiệu thành 1 mảng
  const allProducts = Object.values(productsByBrand).flat();

  // Lọc sản phẩm dựa trên từ khóa
  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <nav className="bg-[#0a192f] text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between relative">
        {/* Logo */}
        <div
          className="text-2xl font-bold cursor-pointer hover:text-gray-300 transition"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          CameraShop
        </div>

        {/* Menu */}
        <ul className="hidden md:flex gap-8 text-lg font-medium">
          {["Trang chủ", "Sản phẩm", "Liên hệ", "Giới thiệu"].map((item) => (
            <li
              key={item}
              className="cursor-pointer hover:font-bold transition"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* Icon giỏ hàng + tìm kiếm */}
        <div className="flex items-center gap-6">
          {/* Icon tìm kiếm */}
          <FaSearch
            className="text-xl cursor-pointer hover:scale-110 hover:text-gray-300 transition"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          />
          {/* Icon giỏ hàng */}
          <FaShoppingCart className="text-xl cursor-pointer hover:scale-110 hover:text-gray-300 transition" />
        </div>

        {/* Ô tìm kiếm (hiện khi click vào icon) */}
        {isSearchOpen && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-2/3 max-w-lg bg-[#1e293b] p-4 rounded-lg shadow-lg z-50">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-md text-black outline-none"
            />

            {/* Danh sách gợi ý */}
            {searchTerm && (
              <ul className="mt-3 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 transition"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span className="text-black">{product.name}</span>
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-500">Không tìm thấy sản phẩm</li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
