// MainLayout.jsx
// - Layout chính cho trang public (Header, Footer, SocialBar, Outlet)
// - Mount ProductDetailOverlay ở đây 1 lần để overlay luôn có mặt trên trang public
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import SocialBar from "../components/layout/SocialBar";
import ProductDetailOverlay from "../components/common/ProductDetailOverlay"; // render overlay 1 lần
// MainLayout chỉ nhận children (các trang con sẽ render ở đây)

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 mt-20">{children}</main>
      <Footer />
      <SocialBar />

      {/* ProductDetailOverlay được mount 1 lần trên trang public.
          Khi có event openProductDetail(product) từ bất kỳ component nào,
          overlay sẽ hiển thị. */}
      <ProductDetailOverlay />
    </div>
  );
}
