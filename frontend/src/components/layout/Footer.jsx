// src/components/layout/Footer.jsx
// Chứa thông tin cửa hàng + liên kết

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-[var(--color-navy-800)] text-white py-10 mt-20"
    >
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột 1 */}
        <div>
          <h3 className="font-bold text-lg mb-3">CameraShop</h3>
          <p>Địa chỉ: 123 Nguyễn Trãi, Hà Nội</p>
          <p>Email: support@camerashop.vn</p>
          <p>Điện thoại: 0123 456 789</p>
        </div>

        {/* Cột 2 */}
        <div>
          <h3 className="font-bold text-lg mb-3">Liên kết</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:text-[var(--color-accent-green)]">
                Trang chủ
              </a>
            </li>
            <li>
              <a
                href="#products"
                className="hover:text-[var(--color-accent-green)]"
              >
                Sản phẩm
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="hover:text-[var(--color-accent-green)]"
              >
                Giới thiệu
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 3 */}
        <div id="about">
          <h3 className="font-bold text-lg mb-3">Về chúng tôi</h3>
          <p className="text-sm leading-relaxed">
            CameraShop chuyên cung cấp máy ảnh, phụ kiện chính hãng Canon,
            Nikon, Sony, Fujifilm... Cam kết sản phẩm chất lượng, bảo hành đầy
            đủ.
          </p>
        </div>
      </div>
      <div className="text-center text-xs mt-10 opacity-75">
        © 2025 CameraShop. All rights reserved.
      </div>
    </footer>
  );
}
