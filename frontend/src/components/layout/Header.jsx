// src/components/layout/Header.jsx
// Đây là header chính, chứa Navbar cố định trên cùng màn hình
// Mục đích: Giữ Navbar luôn hiện khi user scroll

import Navbar from "./Navbar";
// Import Navbar từ cùng thư mục layout

export default function Header() {
  return (
    // Header được cố định (fixed) trên top
    // bg-white đã bỏ → màu sắc do Navbar quyết định (bg-[#0a192f])
    <header className="fixed top-0 left-0 w-full z-50">
      <Navbar />
    </header>
  );
}

/*
📌 Ghi chú cho partner:
- Header.jsx chỉ là "vỏ" để giữ Navbar cố định.
- Nếu sau này có banner quảng cáo nhỏ trên Navbar (ví dụ free ship),
  thì thêm ở đây (trước <Navbar />).
- Thuộc tính "z-50" đảm bảo Header nổi lên trên tất cả component khác.
- Navbar.jsx quản lý logic: logo, menu, tìm kiếm, giỏ hàng.
*/
