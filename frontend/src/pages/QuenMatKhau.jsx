// QuenMatKhau.jsx
import React from "react";
import { Link } from "react-router-dom";
import loginImg from "../assets/images/Login.jpg"; // ảnh bên trái

function QuenMatKhau() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Cột trái */}
      <div className="hidden md:block w-1/2 animate-fadeIn">
        <img
          src={loginImg}
          alt="forgot"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Cột phải */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 animate-slideIn">
        <div className="bg-slate-800/90 p-8 rounded-2xl w-96 shadow-2xl hover:-translate-y-1 hover:shadow-3xl transition-all duration-300 animate-zoomIn">
          <h2 className="text-white text-center text-2xl font-bold mb-2 tracking-wide animate-fadeInDown">
            Quên mật khẩu
          </h2>
          <p className="text-center text-slate-300 text-sm mb-4">
            Nhớ mật khẩu rồi?{" "}
            <Link
              to="/"
              className="text-blue-500 hover:text-blue-400 hover:underline"
            >
              Đăng nhập
            </Link>
          </p>

          <form>
            <label className="block text-slate-200 text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="cavoi@gmail.com"
              className="w-full p-3 mb-6 rounded-lg bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-white bg-yellow-500 hover:bg-yellow-600 transform hover:scale-105 transition-all"
            >
              GỬI LIÊN KẾT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default QuenMatKhau;
