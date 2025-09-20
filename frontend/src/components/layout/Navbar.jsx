// src/components/layout/Navbar.jsx
// Thanh điều hướng chính của website + Tìm kiếm sản phẩm

import { useState } from "react";
// Hook useState để quản lý trạng thái (mở/đóng search, từ khóa nhập)

import { productsByBrand } from "../../data/products";
// Import dữ liệu sản phẩm (được chia theo brand trong products.js)

import { FaShoppingCart, FaSearch, FaTimes } from "react-icons/fa";
// Icon giỏ hàng, tìm kiếm, đóng

import { motion, AnimatePresence } from "framer-motion";
// Dùng để tạo animation khi hiển thị/ẩn ô tìm kiếm và overlay

export default function Navbar() {
  // Trạng thái hiển thị thanh tìm kiếm (true = mở, false = đóng)
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Trạng thái lưu text người dùng nhập vào ô tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // Gom toàn bộ sản phẩm từ nhiều brand thành 1 mảng duy nhất
  const allProducts = Object.values(productsByBrand).flat();

  // Lọc danh sách sản phẩm theo từ khóa nhập vào
  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Navbar chính (luôn hiển thị trên cùng - fixed) */}
      <nav className="bg-[#0a192f] text-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          {/* Logo */}
          <div
            className="text-3xl font-bold cursor-pointer hover:text-gray-300 transition"
            // Khi click → scroll lên đầu trang
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            CameraShop
          </div>

          {/* Menu (ẩn trên mobile, chỉ hiện trên md↑) */}
          <ul className="hidden md:flex gap-10 text-lg font-medium">
            {["Trang chủ", "Sản phẩm", "Liên hệ", "Giới thiệu"].map((item) => (
              <li
                key={item}
                className="cursor-pointer hover:font-bold transition"
              >
                {item}
              </li>
            ))}
          </ul>

          {/* Nhóm icon: tìm kiếm + giỏ hàng */}
          <div className="flex items-center gap-6">
            {/* Icon tìm kiếm */}
            <FaSearch
              className="text-2xl cursor-pointer hover:scale-110 hover:text-gray-300 transition"
              onClick={() => setIsSearchOpen(true)} // Khi click mở hộp search
            />
            {/* Icon giỏ hàng */}
            <FaShoppingCart className="text-2xl cursor-pointer hover:scale-110 hover:text-gray-300 transition" />
          </div>
        </div>
      </nav>

      {/* Overlay + Hộp tìm kiếm (chỉ hiển thị khi isSearchOpen = true) */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Overlay nền mờ */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }} // lúc bắt đầu → mờ hẳn
              animate={{ opacity: 1 }} // khi hiện → mờ dần lên
              exit={{ opacity: 0 }} // khi tắt → mờ dần đi
              onClick={() => setIsSearchOpen(false)} // click overlay → đóng
            />

            {/* Hộp tìm kiếm */}
            <motion.div
              initial={{ opacity: 0, y: -40 }} // animation lúc đầu: mờ + dịch lên
              animate={{ opacity: 1, y: 0 }} // animation khi hiện: trượt xuống
              exit={{ opacity: 0, y: -40 }} // animation khi tắt: mờ + trượt lên
              transition={{ duration: 0.3 }}
              className="fixed top-28 left-1/2 transform -translate-x-1/2 w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 bg-[#1e293b] rounded-lg shadow-lg z-50 p-5"
            >
              <div className="flex items-center gap-3">
                <FaSearch className="text-gray-300 text-xl" />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} // cập nhật searchTerm
                  className="flex-1 p-3 text-white bg-transparent border-b border-gray-500 focus:outline-none text-lg placeholder-gray-400"
                  autoFocus // Tự động focus khi mở hộp
                />
                {/* Nút đóng (icon X) */}
                <FaTimes
                  className="text-gray-400 text-2xl cursor-pointer hover:text-red-500 transition"
                  onClick={() => setIsSearchOpen(false)}
                />
              </div>

              {/* Danh sách gợi ý (hiện khi searchTerm có giá trị) */}
              {searchTerm && (
                <ul className="mt-4 bg-white rounded-md max-h-60 overflow-y-auto shadow-lg">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-100 transition"
                      >
                        {/* Ảnh sản phẩm */}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded"
                        />

                        {/* Tên + Giá */}
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-medium">
                            {product.name}
                          </span>
                          <span className="text-green-600 font-semibold">
                            {product.price.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="p-2 text-gray-500">
                      Không tìm thấy sản phẩm
                    </li>
                  )}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/*
Ghi chú 
- allProducts lấy từ src/data/products.js (gom tất cả brand).
- Khi click icon search → mở modal search.
- Overlay (bg đen mờ) đóng vai trò disable phần UI phía sau.
- filteredProducts đang lọc theo product.name → có thể mở rộng tìm theo brand hoặc price.
- Nếu muốn click vào gợi ý để chuyển sang trang ProductDetail:
  + Thêm useNavigate (react-router-dom).
  + Gắn sự kiện onClick cho từng <li>.
- Giỏ hàng hiện mới có icon, có thể kết hợp với CartContext sau này để hiển thị số lượng.
*/
