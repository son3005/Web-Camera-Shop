// src/pages/ChinhSachPage.jsx
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function ChinhSachPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e9fff5] to-[#d2f5eb] flex flex-col">
      {/* HEADER */}
      <Header />

      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* TITLE */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-emerald-600 drop-shadow-sm">
              Chính Sách Mua Hàng
            </h1>
            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
              WebCameraShop cam kết minh bạch – rõ ràng – uy tín trong mọi giao
              dịch.
            </p>
          </div>

          {/* WRAPPER CARD GLASS */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-10 space-y-12">
            {/* 1. Đổi trả */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-600 mb-4">
                1. Chính Sách Đổi Trả &amp; Bảo Hành
              </h2>

              <p className="text-slate-700 mb-4">
                WebCameraShop luôn nỗ lực đảm bảo quyền lợi khách hàng với chính
                sách đổi trả minh bạch.
              </p>

              <h3 className="font-semibold text-lg mb-2">
                💡 Điều kiện đổi trả
              </h3>
              <ul className="list-disc pl-6 space-y-1 text-slate-700">
                <li>Đổi trả trong 7 ngày từ khi nhận hàng.</li>
                <li>Sản phẩm còn nguyên tem – hộp – phụ kiện.</li>
                <li>Không áp dụng cho sản phẩm giảm giá sốc.</li>
              </ul>

              <h3 className="font-semibold text-lg mt-5 mb-2">
                💡 Quy trình đổi trả
              </h3>
              <ol className="list-decimal pl-6 space-y-1 text-slate-700">
                <li>
                  Liên hệ hotline <strong>1900 1234</strong>.
                </li>
                <li>Cung cấp hình ảnh tình trạng sản phẩm.</li>
                <li>Đổi tại cửa hàng hoặc gửi hàng về trung tâm.</li>
              </ol>
            </section>

            {/* 2. GIAO HÀNG */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-600 mb-4">
                2. Chính Sách Giao Hàng &amp; Thanh Toán
              </h2>

              <h3 className="font-semibold text-lg">🚚 Giao hàng</h3>
              <ul className="list-disc pl-6 space-y-1 text-slate-700 mb-4">
                <li>Giao hàng toàn quốc nhanh chóng.</li>
                <li>Nội thành: 1–3 ngày. Ngoại tỉnh: 3–7 ngày.</li>
                <li>Miễn phí ship cho đơn trên 1.000.000đ.</li>
              </ul>

              <h3 className="font-semibold text-lg">💰 Thanh toán</h3>
              <ul className="list-disc pl-6 space-y-1 text-slate-700">
                <li>COD – thanh toán khi nhận hàng.</li>
                <li>Chuyển khoản ngân hàng.</li>
                <li>Ví điện tử (Momo, VNPay…).</li>
              </ul>
            </section>

            {/* 3. BẢO MẬT */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-600 mb-4">
                3. Chính Sách Bảo Mật Thông Tin
              </h2>

              <p className="text-slate-700 mb-4">
                WebCameraShop tuân thủ nghiêm các tiêu chuẩn bảo mật dữ liệu
                khách hàng.
              </p>

              <h3 className="font-semibold text-lg">🔒 Thu thập thông tin</h3>
              <ul className="list-disc pl-6 space-y-1 text-slate-700 mb-4">
                <li>Họ tên, số điện thoại, email.</li>
                <li>Địa chỉ giao hàng, lịch sử mua hàng.</li>
              </ul>

              <h3 className="font-semibold text-lg">🔒 Bảo vệ thông tin</h3>
              <p className="text-slate-700">
                Dữ liệu được mã hóa và không chia sẻ cho bên thứ ba nếu không
                được phép.
              </p>
            </section>
          </div>

          {/* BACK BUTTON */}
          <div className="text-center mt-10">
            <Link
              to="/"
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition"
            >
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
