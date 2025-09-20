import React from "react";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import BG from "../assets/images/BG.jpg";      // ảnh nền toàn màn hình
import LoginImage from "../assets/images/Login.jpg"; // ảnh login bên trái

function DangNhap() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background toàn màn hình */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})` }}
      ></div>
      {/* Overlay xanh + làm mờ ảnh nền */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 to-blue-700/80 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl flex max-w-5xl w-full h-[600px] relative z-10 overflow-hidden border border-white/20">
        
        {/* Bên trái */}
        <div className="w-1/2 flex flex-col items-center justify-center p-10 
                        bg-gradient-to-b from-blue-600/90 to-blue-800/90 text-white rounded-l-2xl h-full relative overflow-hidden">
          {/* Ảnh login riêng bên trong */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${LoginImage})` }}
          ></div>
          {/* Overlay xanh đậm cho ảnh login */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-700/70 to-blue-900/90"></div>

          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-bold mb-4">Chào mừng trở lại 📷</h1>
            <p className="text-lg">
              Lưu giữ khoảnh khắc, bắt trọn cảm xúc. <br />
              Đăng nhập để tiếp tục khám phá thế giới nhiếp ảnh.
            </p>
          </div>
        </div>

        {/* Bên phải */}
        <div className="w-1/2 p-10 flex flex-col justify-center h-full 
                        bg-white rounded-r-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Đăng nhập</h2>
          <form className="flex flex-col space-y-4">
            <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500">
              <FaEnvelope className="text-gray-400 mr-3" />
              <input 
                type="email" 
                placeholder="Nhập email" 
                className="w-full outline-none"
              />
            </div>
            <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500">
              <FaLock className="text-gray-400 mr-3" />
              <input 
                type="password" 
                placeholder="Nhập mật khẩu" 
                className="w-full outline-none"
              />
            </div>
            <button 
              type="submit" 
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-xl transition"
            >
              Đăng nhập <FaArrowRight />
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600">
            Quên mật khẩu?{" "}
            <a href="/quenmatkhau" className="text-blue-600 hover:underline">Khôi phục</a>
          </p>
          <p className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <a href="/dangky" className="text-blue-600 hover:underline">Đăng ký</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DangNhap;
