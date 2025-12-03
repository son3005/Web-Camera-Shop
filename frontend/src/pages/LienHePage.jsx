// src/pages/LienHePage.jsx
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function LienHePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl text-slate-800 dark:text-slate-200">

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold mb-4 text-center text-emerald-600 dark:text-emerald-400">
        Liên Hệ Với WebCameraShop
      </h1>

      <p className="text-center text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12">
        Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 qua các kênh dưới đây.  
        Hãy liên hệ ngay để được tư vấn nhanh chóng.
      </p>

      {/* ====================== GRID 2 CỘT ====================== */}
      <section className="grid md:grid-cols-2 gap-8 mb-12">

        {/* BOX 1 – THÔNG TIN LIÊN HỆ */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-shadow">

          <h2 className="text-2xl font-semibold mb-5 flex items-center gap-2 text-emerald-500">
            Thông Tin Liên Hệ
          </h2>

          <div className="space-y-4 text-sm">
            <p className="flex items-center gap-3">
              <Phone className="text-emerald-500" />
              <span>
                Hotline: <strong>1900 1234</strong>
              </span>
            </p>

            <p className="flex items-center gap-3">
              <Mail className="text-emerald-500" />
              <span>Email: support@webcamerashop.vn</span>
            </p>

            <p className="flex items-center gap-3">
              <MapPin className="text-emerald-500" />
              <span>256 Đ. Nguyễn Văn Cừ, An Hoà, Ninh Kiều, Cần Thơ.</span>
            </p>
          </div>

          {/* SOCIAL */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Kết nối với chúng tôi</h3>
            <div className="flex items-center gap-5 text-emerald-600 dark:text-emerald-400 text-xl">
              <a href="#" className="hover:scale-110 transition">
                <Facebook />
              </a>
              <a href="#" className="hover:scale-110 transition">
                <Instagram />
              </a>
              <a href="#" className="hover:scale-110 transition">
                <MessageCircle />
              </a>
            </div>
          </div>
        </div>

        {/* BOX 2 – LIÊN HỆ NHANH */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-shadow">

          <h2 className="text-2xl font-semibold mb-5 text-blue-600 dark:text-blue-400">
            Liên Hệ Nhanh
          </h2>

          <p className="text-sm mb-5 text-slate-600 dark:text-slate-400">
            Nhấp vào nút bên dưới để nhắn tin trực tiếp qua Messenger hoặc Zalo.
          </p>

          <div className="flex flex-col gap-4">

            {/* NÚT ZALO */}
            <a
              href="https://zalo.me/0963096914"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl 
                         bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md transition"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
                alt="Zalo"
                className="w-6 h-6"
              />
              Nhắn qua Zalo
            </a>

            {/* NÚT MESSENGER */}
            <a
              href="https://m.me/hongha.mai.100"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl 
                         bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-6 h-6"
              >
                <path d="M12 2C6.48 2 2 6.05 2 11.2c0 2.87 1.45 5.45 3.73 7.13v3.67l3.42-1.88c.93.26 1.92.4 2.95.4 5.52 0 10-4.05 10-9.2C22 6.05 17.52 2 12 2zm1.11 12.47-2.72-2.9-5.32 2.9 5.87-6.26 2.72 2.9 5.29-2.9-5.84 6.26z" />
              </svg>
              Nhắn qua Messenger
            </a>

          </div>
        </div>
      </section>

      {/* ====================== GOOGLE MAP ====================== */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Bản đồ cửa hàng</h2>

        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1167.9920682110119!2d105.76663556102878!3d10.0464231861433!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0880f08006ffb%3A0x9a745510330faf4e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBL4bu5IHRodeG6rXQgLSBDw7RuZyBuZ2jhu4cgQ-G6p24gVGjGoQ!5e0!3m2!1svi!2s!4v1764730379165!5m2!1svi!2s"
            className="w-full h-[420px]"
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* ====================== NÚT QUAY LẠI ====================== */}
      <div className="mt-12 text-center">
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
