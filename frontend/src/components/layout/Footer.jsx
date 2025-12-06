// frontend/src/components/layout/Footer.jsx
// Footer chia 4 cột: giới thiệu, liên hệ, chính sách, mạng xã hội
export default function Footer() {
  return (
    <footer className="site-footer mt-10">
      <div className="container mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
        {/* === Giới thiệu === */}
        <div id="about-section">
          <h4 className="font-semibold mb-2 text-slate-900">
            Về WebCameraShop
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Cửa hàng máy ảnh &amp; phụ kiện chính hãng. Cam kết giá tốt, bảo
            hành đầy đủ, và dịch vụ hỗ trợ tận tâm.
          </p>
        </div>

        {/* === Liên hệ === */}
        <div id="contact-section">
          <h4 className="font-semibold mb-2 text-slate-900">Liên hệ</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>📞 Hotline: 1900 1234</li>
            <li>✉️ Email: support@webcamerashop.vn</li>
            <li>📍 256 Đ. Nguyễn Văn Cừ, An Hoà, Ninh Kiều, Cần Thơ.</li>
          </ul>
        </div>

        {/* === Chính sách === */}
        <div id="policy-section">
          <h4 className="font-semibold mb-2 text-slate-900">Chính sách</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>🔁 Đổi trả &amp; bảo hành</li>
            <li>🚚 Giao hàng &amp; thanh toán</li>
            <li>🔒 Bảo mật thông tin</li>
          </ul>
        </div>

        {/* === Mạng xã hội === */}
        <div>
          <h4 className="font-semibold mb-2 text-slate-900">
            Kết nối với chúng tôi
          </h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>
              🌐{" "}
              <a href="#" className="hover:text-emerald-600">
                Facebook
              </a>
            </li>
            <li>
              📷{" "}
              <a href="#" className="hover:text-emerald-600">
                Instagram
              </a>
            </li>
            <li>
              ▶️{" "}
              <a href="#" className="hover:text-emerald-600">
                YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* === Copyright === */}
      <div className="text-center text-xs text-slate-500 py-4 border-t border-slate-200">
        © {new Date().getFullYear()} WebCameraShop. All rights reserved.
      </div>
    </footer>
  );
}
