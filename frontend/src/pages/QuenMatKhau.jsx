// QuenMatKhau.jsx
import React from "react";
import { FaEnvelope, FaArrowRight } from "react-icons/fa";
import BG from "../assets/images/BG.jpg";       // ảnh nền toàn màn hình
import LoginImage from "../assets/images/Login.jpg"; // ảnh bên trái card

function QuenMatKhau() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background toàn màn hình */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})` }}
      ></div>
      {/* Overlay xanh ngọc + làm mờ nền */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-400/70 to-teal-600/80 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl flex max-w-5xl w-full h-[500px] relative z-10 overflow-hidden border border-white/20">
        
        {/* Bên trái */}
        <div className="w-1/2 flex flex-col items-center justify-center p-10 
                        bg-gradient-to-b from-teal-600/90 to-teal-800/90 text-white rounded-l-2xl h-full relative overflow-hidden">
          {/* Ảnh nền Login */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${LoginImage})` }}
          ></div>
          {/* Overlay xanh ngọc đậm */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-700/70 to-teal-900/90"></div>

          <div className="relative z-10 text-center">
            <h1 className="text-3xl font-bold mb-4">Quên mật khẩu 🔑</h1>
            <p className="text-lg">
              Nhập email của bạn để lấy lại mật khẩu <br />
              và tiếp tục trải nghiệm.
            </p>
          </div>
        </div>

        {/* Bên phải */}
        <div className="w-1/2 p-10 flex flex-col justify-center h-full 
                        bg-white rounded-r-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Khôi phục mật khẩu</h2>
          <form className="flex flex-col space-y-4">
            <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-teal-500">
              <FaEnvelope className="text-gray-400 mr-3" />
              <input 
                type="email" 
                placeholder="Nhập email đã đăng ký" 
                className="w-full outline-none"
              />
            </div>
            <button 
              type="submit" 
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-semibold py-3 rounded-lg hover:shadow-xl transition"
            >
              Gửi liên kết <FaArrowRight />
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600">
            Nhớ mật khẩu?{" "}
            <a href="/dangnhap" className="text-teal-600 hover:underline">Đăng nhập</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default QuenMatKhau;
