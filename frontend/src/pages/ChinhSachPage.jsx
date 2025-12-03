// src/pages/ChinhSachPage.jsx
import { Link } from "react-router-dom";

export default function ChinhSachPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl text-slate-800 dark:text-slate-200">

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold mb-6 text-center text-emerald-600 dark:text-emerald-400">
        Chính Sách Mua Hàng
      </h1>

      <p className="text-center text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
        WebCameraShop cam kết mang đến trải nghiệm mua sắm rõ ràng – minh bạch – an toàn.
        Tất cả chính sách dưới đây được áp dụng cho mọi khách hàng trên hệ thống.
      </p>

      {/* WRAPPER CARD */}
      <div className="bg-white dark:bg-slate-900 shadow-md rounded-2xl p-8 border border-slate-200 dark:border-slate-700">

        {/* ============================= */}
        {/* 1. ĐỔI TRẢ & BẢO HÀNH */}
        {/* ============================= */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">
            1. Chính Sách Đổi Trả & Bảo Hành
          </h2>

          <p className="leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
            WebCameraShop luôn nỗ lực đảm bảo quyền lợi khách hàng với chính sách đổi trả và bảo hành rõ ràng.
          </p>

          <h3 className="font-semibold mb-2 text-lg">💡 Điều kiện đổi trả</h3>
          <ul className="list-disc pl-6 space-y-1 mb-5">
            <li>Áp dụng trong <strong>7 ngày</strong> kể từ ngày nhận hàng.</li>
            <li>Sản phẩm còn nguyên hộp, phụ kiện, tem bảo hành và chưa qua sử dụng.</li>
            <li>Không áp dụng cho sản phẩm giảm giá sâu hoặc khuyến mãi đặc biệt.</li>
          </ul>

          <h3 className="font-semibold mb-2 text-lg">💡 Quy trình đổi trả</h3>
          <ol className="list-decimal pl-6 space-y-1 mb-5">
            <li>Liên hệ hotline hỗ trợ: <strong>1900 1234</strong>.</li>
            <li>Gửi mã đơn hàng + hình ảnh sản phẩm để xác nhận tình trạng.</li>
            <li>Sau khi được duyệt → gửi hàng về trung tâm hoặc đổi trực tiếp tại cửa hàng.</li>
          </ol>

          <h3 className="font-semibold mb-2 text-lg">💡 Chính sách bảo hành</h3>
          <p className="leading-relaxed">
            Tất cả sản phẩm được bảo hành chính hãng từ <strong>12 – 24 tháng</strong>,
            tùy theo từng thương hiệu và model.
          </p>
        </section>

        {/* ============================= */}
        {/* 2. GIAO HÀNG & THANH TOÁN */}
        {/* ============================= */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">
            2. Chính Sách Giao Hàng & Thanh Toán
          </h2>

          <h3 className="font-semibold mb-2 text-lg">🚚 Giao hàng</h3>
          <ul className="list-disc pl-6 space-y-1 mb-5">
            <li>Giao hàng toàn quốc nhanh chóng.</li>
            <li>Nội thành: <strong>1 – 3 ngày</strong>, ngoại tỉnh: <strong>3 – 7 ngày</strong>.</li>
            <li>Miễn phí vận chuyển cho đơn hàng trên <strong>1.000.000đ</strong>.</li>
          </ul>

          <h3 className="font-semibold mb-2 text-lg">💰 Thanh toán</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>COD – thanh toán khi nhận hàng.</li>
            <li>Chuyển khoản ngân hàng.</li>
            <li>Ví điện tử (Momo, VNPay… tùy theo tích hợp).</li>
          </ul>
        </section>

        {/* ============================= */}
        {/* 3. BẢO MẬT THÔNG TIN */}
        {/* ============================= */}
        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">
            3. Chính Sách Bảo Mật Thông Tin
          </h2>

          <p className="leading-relaxed mb-4">
            WebCameraShop tuân thủ nghiêm ngặt quy định pháp luật Việt Nam về bảo mật thông tin khách hàng.
          </p>

          <h3 className="font-semibold mb-2 text-lg">🔒 Thu thập thông tin</h3>
          <ul className="list-disc pl-6 space-y-1 mb-5">
            <li>Họ tên, số điện thoại, email.</li>
            <li>Địa chỉ giao hàng, lịch sử đơn hàng.</li>
          </ul>

          <h3 className="font-semibold mb-2 text-lg">🔒 Mục đích sử dụng</h3>
          <ul className="list-disc pl-6 space-y-1 mb-5">
            <li>Xác nhận đơn hàng & giao hàng.</li>
            <li>Chăm sóc khách hàng.</li>
            <li>Gửi chương trình khuyến mãi (nếu khách hàng đồng ý).</li>
          </ul>

          <h3 className="font-semibold mb-2 text-lg">🔒 Bảo vệ thông tin</h3>
          <p className="leading-relaxed">
            Thông tin cá nhân được mã hóa và lưu trữ an toàn, không chia sẻ cho bên thứ ba nếu không được phép.
          </p>
        </section>

      </div>

      {/* NÚT TRỞ VỀ TRANG CHỦ */}
      <div className="mt-10 text-center">
        <Link
          to="/"
          className="text-emerald-600 hover:text-emerald-700 text-lg font-semibold"
        >
          ← Quay lại trang chủ
        </Link>
      </div>

    </div>
  );
}
