// Import các section (thành phần lớn của trang chủ)
import HotProducts from "../components/layout/HotProducts"; // Section sản phẩm nổi bật (carousel)
import ProductList from "../components/layout/ProductList"; // Section danh sách sản phẩm

// Component Home → đại diện cho trang chủ
export default function Home() {
  return (
    <div>
      <section className="h-[400px] bg-gray-200 flex items-center justify-center">
        <img
          src="/src/assets/images/banner.jpg" // ảnh banner trong thư mục assets/images
          alt="Banner"
          className="h-full w-full object-cover" // ảnh co dãn, che phủ toàn bộ section
        />
      </section>

      <HotProducts />
      <ProductList />
    </div>
  );
}
