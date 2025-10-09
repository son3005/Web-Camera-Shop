// Navbar.jsx
// - Thêm: khi click vào sản phẩm trong search suggestions sẽ mở ProductDetailOverlay global
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsByBrand } from "../../data/products";
import { FaShoppingCart, FaSearch, FaTimes, FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { openProductDetail } from "../common/ProductDetailOverlay"; // <-- import event bus

export default function Navbar() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const allProducts = Object.values(productsByBrand).flat();
  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProduct = (product) => {
    setIsSearchOpen(false);
    setSearchTerm("");
    openProductDetail(product); // mở overlay global
  };

  return (
    <>
      <nav className="bg-[#0a192f] text-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div
            className="text-3xl font-bold cursor-pointer hover:text-gray-300 transition"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            CameraShop
          </div>

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

          <div className="flex items-center gap-6">
            <FaSearch
              className="text-2xl cursor-pointer hover:scale-110 hover:text-gray-300 transition"
              onClick={() => setIsSearchOpen(true)}
            />

            <FaShoppingCart className="text-2xl cursor-pointer hover:scale-110 hover:text-gray-300 transition" />

            <FaUser
              className="text-2xl cursor-pointer hover:scale-110 hover:text-gray-300 transition"
              onClick={() => navigate("/dangnhap")}
              title="Đăng nhập / Đăng ký"
            />
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.3 }}
              className="fixed top-28 left-1/2 transform -translate-x-1/2 w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 bg-[#1e293b] rounded-lg shadow-lg z-50 p-5"
            >
              <div className="flex items-center gap-3">
                <FaSearch className="text-gray-300 text-xl" />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 p-3 text-white bg-transparent border-b border-gray-500 focus:outline-none text-lg placeholder-gray-400"
                  autoFocus
                />
                <FaTimes
                  className="text-gray-400 text-2xl cursor-pointer hover:text-red-500 transition"
                  onClick={() => setIsSearchOpen(false)}
                />
              </div>

              {searchTerm && (
                <ul className="mt-4 bg-white rounded-md max-h-60 overflow-y-auto shadow-lg">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-100 transition"
                        onClick={() => handleSelectProduct(product)} // <-- mở overlay global
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded"
                        />
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-medium">
                            {product.name}
                          </span>
                          <span className="text-green-600 font-semibold">
                            {product.price
                              ? Number(product.price).toLocaleString("vi-VN") +
                                "₫"
                              : "Liên hệ"}
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
