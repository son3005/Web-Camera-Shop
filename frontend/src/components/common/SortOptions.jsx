// src/components/common/SortOptions.jsx
// Component dùng để hiển thị "Sort" (sắp xếp sản phẩm) với các lựa chọn:
// - Giá thấp nhất
// - Giá cao nhất
// - Bán chạy nhất
// - Mặc định

import { motion } from "framer-motion";
// Dùng motion để thêm animation khi select box hiện ra

export default function SortOptions({ sortBy, setSortBy }) {
  return (
    // Container bọc select box
    // Trên mobile (màn hình nhỏ) => canh giữa (justify-center)
    // Trên desktop (md:) => canh phải (justify-end)
    <div className="flex justify-center md:justify-end px-6 mb-8">
      {/* Select box có animation nhờ framer-motion */}
      <motion.select
        value={sortBy} // Giá trị hiện tại (state do ProductList truyền vào)
        onChange={(e) => setSortBy(e.target.value)} // Khi user chọn option => setSortBy
        // Style cơ bản
        className="px-4 py-2 border rounded-md shadow-sm 
                   focus:outline-none focus:ring-2 
                   focus:ring-[var(--color-accent-green)]"
        // Animation khi component mount
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Các lựa chọn sort */}
        <option value="default">Mặc định</option>
        <option value="priceLow">Giá thấp nhất</option>
        <option value="priceHigh">Giá cao nhất</option>
        <option value="bestSelling">Bán chạy nhất</option>
      </motion.select>
    </div>
  );
}

/*
📌 Ghi chú cho partner:
- Component này **chỉ hiển thị select box**, không tự xử lý logic sort.
- Logic sort (lọc sản phẩm theo giá, bán chạy) được viết trong ProductList.jsx.
- Thuộc tính "sortBy" và "setSortBy" được truyền từ ProductList xuống.
- Nếu backend sau này có API "bán chạy nhất", chỉ cần sửa logic sort ở ProductList.
- Có thể mở rộng thêm option khác (ví dụ: mới nhất, cũ nhất) bằng cách thêm <option>.
*/
