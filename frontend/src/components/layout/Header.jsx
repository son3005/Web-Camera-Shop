import Navbar from "./Navbar";
// Import Navbar từ cùng thư mục layout

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <Navbar />
    </header>
  );
}

/*
Ghi chú 
- Header.jsx chỉ là "vỏ" để giữ Navbar cố định.
- Nếu sau này có banner quảng cáo nhỏ trên Navbar (ví dụ free ship),
  thì thêm ở đây (trước <Navbar />).
- Thuộc tính "z-50" đảm bảo Header nổi lên trên tất cả component khác.
- Navbar.jsx quản lý logic: logo, menu, tìm kiếm, giỏ hàng.
*/
