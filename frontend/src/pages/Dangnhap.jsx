import React, { useState } from "react";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import BG from "../assets/images/BG.jpg";
import LoginImage from "../assets/images/Login.jpg";

function DangNhap() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser({ email, mat_khau: matKhau });
      alert("🎉 Đăng nhập thành công!");
      navigate("/"); // chuyển về trang chủ
    } catch (err) {
      alert(err.response?.data?.error || "❌ Email hoặc mật khẩu không đúng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/70 to-emerald-700/80 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl flex max-w-5xl w-full h-[600px] relative z-10 overflow-hidden border border-white/20">
        {/* Left */}
        <div className="w-1/2 flex flex-col items-center justify-center p-10 bg-gradient-to-b from-emerald-600/90 to-emerald-800/90 text-white rounded-l-2xl h-full relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${LoginImage})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-700/70 to-emerald-900/90"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-bold mb-4">Chào mừng trở lại 📷</h1>
            <p className="text-lg">
              Lưu giữ khoảnh khắc, bắt trọn cảm xúc.
              <br />
              Đăng nhập để tiếp tục khám phá thế giới nhiếp ảnh.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="w-1/2 p-10 flex flex-col justify-center h-full bg-white rounded-r-2xl shadow-xl dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-slate-100">
            Đăng nhập
          </h2>
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-600">
              <FaEnvelope className="text-gray-400 dark:text-slate-400 mr-3" />
              <input
                type="email"
                placeholder="Nhập email"
                className="w-full outline-none placeholder-gray-400 dark:placeholder-slate-300 bg-transparent text-gray-900 dark:text-slate-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-600">
              <FaLock className="text-gray-400 dark:text-slate-400 mr-3" />
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                className="w-full outline-none placeholder-gray-400 dark:placeholder-slate-300 bg-transparent text-gray-900 dark:text-slate-100"
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold py-3 rounded-lg hover:shadow-xl hover:shadow-emerald-500/30 transition"
            >
              {loading ? (
                "Đang đăng nhập..."
              ) : (
                <>
                  Đăng nhập <FaArrowRight />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600 dark:text-slate-300">
            Quên mật khẩu?{" "}
            <a
              href="/quenmatkhau"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Khôi phục
            </a>
          </p>
          <p className="text-center text-sm text-gray-600 dark:text-slate-300">
            Chưa có tài khoản?{" "}
            <a
              href="/dangky"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Đăng ký
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DangNhap;
