// frontend/src/components/layout/Footer.jsx
// Footer chia 4 cột: giới thiệu, liên hệ, chính sách, mạng xã hội
export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 mt-10">
      <div className="container mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
        {/* === Giới thiệu === */}
        <div id="about-section">
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Về WebCameraShop
          </h4>
          <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
            Cửa hàng máy ảnh & phụ kiện chính hãng. Cam kết giá tốt, bảo hành
            đầy đủ, và dịch vụ hỗ trợ tận tâm.
          </p>
        </div>

        {/* === Liên hệ === */}
        <div id="contact-section">
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Liên hệ
          </h4>
          <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
            <li>📞 Hotline: 1900 1234</li>
            <li>✉️ Email: support@webcamerashop.vn</li>
            <li>📍 Địa chỉ: 123 Lê Lợi, Q1, TP.HCM</li>
          </ul>
        </div>

        {/* === Chính sách === */}
        <div id="policy-section">
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Chính sách
          </h4>
          <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
            <li>🔁 Đổi trả & bảo hành</li>
            <li>🚚 Giao hàng & thanh toán</li>
            <li>🔒 Bảo mật thông tin</li>
          </ul>
        </div>

        {/* === Mạng xã hội === */}
        <div>
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Kết nối với chúng tôi
          </h4>
          <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
            <li>
              🌐{" "}
              <a
                href="#"
                className="hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Facebook
              </a>
            </li>
            <li>
              📷{" "}
              <a
                href="#"
                className="hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Instagram
              </a>
            </li>
            <li>
              ▶️{" "}
              <a
                href="#"
                className="hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* === Copyright === */}
      <div className="text-center text-xs text-gray-500 dark:text-slate-500 py-4 border-t border-gray-200 dark:border-slate-700">
        © {new Date().getFullYear()} WebCameraShop. All rights reserved.
      </div>
    </footer>
  );
}
