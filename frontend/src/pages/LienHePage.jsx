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

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function LienHePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e9fff5] to-[#d2f5eb] flex flex-col">
      {/* HEADER cố định */}
      <Header />

      {/* Nội dung chính – chừa khoảng cho header fixed */}
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* TITLE */}
          <h1 className="text-4xl font-extrabold text-center text-emerald-600 mb-4">
            Liên Hệ Với WebCameraShop
          </h1>

          <p className="text-center text-slate-600 max-w-2xl mx-auto mb-12">
            Chúng tôi luôn sẵn sàng hỗ trợ 24/7. Hãy liên hệ ngay để được tư vấn
            nhanh nhất.
          </p>

          {/* GRID */}
          <section className="grid md:grid-cols-2 gap-8 mb-12">
            {/* BOX 1 */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg hover:shadow-xl rounded-3xl p-8 transition">
              <h2 className="text-2xl font-semibold text-emerald-600 mb-6 flex items-center gap-2">
                Thông Tin Liên Hệ
              </h2>

              <div className="space-y-4 text-slate-700">
                <p className="flex items-center gap-3">
                  <Phone className="text-emerald-600" />
                  <span>
                    Hotline: <strong>1900 1234</strong>
                  </span>
                </p>

                <p className="flex items-center gap-3">
                  <Mail className="text-emerald-600" />
                  <span>Email: support@webcamerashop.vn</span>
                </p>

                <p className="flex items-center gap-3">
                  <MapPin className="text-emerald-600" />
                  <span>256 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ</span>
                </p>
              </div>

              {/* SOCIAL */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3 text-slate-700">
                  Kết nối với chúng tôi
                </h3>
                <div className="flex items-center gap-5 text-emerald-600 text-xl">
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

            {/* BOX 2 */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg hover:shadow-xl rounded-3xl p-8 transition">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-600">
                Liên Hệ Nhanh
              </h2>

              <p className="text-sm text-slate-600 mb-6">
                Nhấn vào nút bên dưới để nhắn tin trực tiếp qua Zalo hoặc
                Messenger.
              </p>

              <div className="space-y-4">
                {/* ZALO */}
                <a
                  href="https://zalo.me/0963096914"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl 
                  bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
                    alt="Zalo"
                    className="w-6 h-6"
                  />
                  Nhắn qua Zalo
                </a>

                {/* MESSENGER */}
                <a
                  href="https://m.me/hongha.mai.100"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl 
                  bg-blue-600 hover:bg-blue-500 text-white shadow-md transition"
                >
                  <MessageCircle className="w-6 h-6" />
                  Nhắn qua Messenger
                </a>
              </div>
            </div>
          </section>

          {/* MAP */}
          <section>
            <h2 className="text-2xl font-bold text-slate-700 mb-4">
              Bản đồ cửa hàng
            </h2>
            <div className="rounded-3xl overflow-hidden shadow-xl border border-white/60 backdrop-blur-xl">
              <iframe
                title="map"
                src="https://www.google.com/maps/embed?pb=!1m18..."
                className="w-full h-[420px]"
              ></iframe>
            </div>
          </section>

          {/* BACK */}
          <div className="text-center mt-12">
            <Link
              to="/"
              className="text-emerald-600 font-semibold text-lg hover:text-emerald-700"
            >
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER chung */}
      <Footer />
    </div>
  );
}
