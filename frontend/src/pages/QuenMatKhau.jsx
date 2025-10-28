import React, { useState } from "react";
import { FaEnvelope, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/authApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BG from "../assets/images/BG.jpg";
import LoginImage from "../assets/images/Login.jpg";

function QuenMatKhau() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gọi API quên mật khẩu
      await forgotPassword({ email });

      toast.success("📩 Email khôi phục mật khẩu đã được gửi!", {
        position: "top-center",
      });

      // Reset form
      setEmail("");

      // (Tuỳ chọn) chuyển về trang đăng nhập sau 2s
      setTimeout(() => navigate("/dangnhap"), 2000);
    } catch (err) {
      console.error("Lỗi quên mật khẩu:", err);
      toast.error(err.response?.data?.error || "❌ Không thể gửi email!", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ToastContainer />

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 to-blue-700/80 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl flex max-w-5xl w-full h-[600px] relative z-10 overflow-hidden border border-white/20">
        {/* Left */}
        <div className="w-1/2 flex flex-col items-center justify-center p-10 bg-gradient-to-b from-blue-600/90 to-blue-800/90 text-white rounded-l-2xl h-full relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${LoginImage})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-700/70 to-blue-900/90"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-bold mb-4">Quên mật khẩu 🔑</h1>
            <p className="text-lg">
              Hãy nhập email của bạn để nhận liên kết khôi phục <br />
              và tiếp tục hành trình nhiếp ảnh.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="w-1/2 p-10 flex flex-col justify-center h-full bg-white rounded-r-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Khôi phục mật khẩu
          </h2>
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500">
              <FaEnvelope className="text-gray-400 mr-3" />
              <input
                type="email"
                placeholder="Nhập email đã đăng ký"
                className="w-full outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-xl transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang gửi..." : <>Gửi liên kết <FaArrowRight /></>}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600">
            Nhớ mật khẩu?{" "}
            <a href="/dangnhap" className="text-blue-600 hover:underline">
              Đăng nhập
            </a>
          </p>
          <p className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <a href="/dangky" className="text-blue-600 hover:underline">
              Đăng ký
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default QuenMatKhau;
