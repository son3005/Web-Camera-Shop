import React from "react";
import { Link } from "react-router-dom";
import loginImg from "../assets/images/Login.jpg";

function DangNhap() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Cột trái */}
      <div className="hidden md:block w-1/2 animate-fadeIn">
        <img
          src={loginImg}
          alt="login"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Cột phải */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 animate-slideIn">
        <div className="bg-slate-800/90 p-8 rounded-2xl w-96 shadow-2xl hover:-translate-y-1 hover:shadow-3xl transition-all duration-300 animate-zoomIn">
          <h2 className="text-white text-center text-2xl font-bold mb-2 tracking-wide animate-fadeInDown">
            Đăng nhập
          </h2>
          <p className="text-center text-slate-300 text-sm mb-4">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-500 hover:text-blue-400 hover:underline"
            >
              Đăng ký
            </Link>
          </p>

          <form>
            <label className="block text-slate-200 text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="cavcoi@gmail.com"
              className="w-full p-3 mb-4 rounded-lg bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />

            <label className="block text-slate-200 text-sm mb-1">Mật khẩu</label>
            <input
              type="password"
              placeholder="********"
              className="w-full p-3 mb-6 rounded-lg bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-white bg-blue-500 hover:bg-blue-600 transform hover:scale-105 transition-all"
            >
              ĐĂNG NHẬP
            </button>
          </form>

          <p className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-blue-500 hover:text-blue-400 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DangNhap;
