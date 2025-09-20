// Import các thành phần layout chung (header, footer, social bar)
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import SocialBar from "../components/layout/SocialBar";

// 📌 MainLayout là layout chính dùng để bao bọc tất cả các trang (pages)
// Nhận prop { children } → nội dung từng page cụ thể sẽ được hiển thị bên trong
export default function MainLayout({ children }) {
  return (
    // flex-col: sắp xếp các phần tử theo cột
    // min-h-screen: chiều cao tối thiểu = toàn bộ màn hình
    <div className="flex flex-col min-h-screen">
      {/* Header cố định trên cùng */}
      {/* Gồm Navbar (logo, menu, search, cart) */}
      <Header />

      {/* Nội dung chính */}
      {/* flex-1: chiếm hết không gian trống còn lại */}
      {/* mt-20: thêm khoảng cách top (20 * 4px = 80px) để tránh bị Header đè lên */}
      <main className="flex-1 mt-20">{children}</main>

      {/* Footer ở dưới cùng */}
      <Footer />

      {/* Thanh SocialBar (Facebook, Zalo) cố định ở góc phải màn hình */}
      <SocialBar />
    </div>
  );
}
