import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { register } from "../api/authApi"; // ✅ đổi sang hàm đúng trong authApi.js
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BG from "../assets/images/BG.jpg";
import LoginImage from "../assets/images/Login.jpg";

function DangKy() {
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhan, setXacNhan] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra xác nhận mật khẩu
    if (matKhau !== xacNhan) {
      toast.error("❌ Mật khẩu xác nhận không khớp!", { position: "top-center" });
      return;
    }

    setLoading(true);
    try {
      // Gọi API đăng ký
      await register({
        ho_ten: hoTen,
        email,
        mat_khau: matKhau,
        xac_nhan_mat_khau: xacNhan,
      });

      toast.success("🎉 Đăng ký thành công! Hãy đăng nhập để tiếp tục.", {
        position: "top-center",
      });

      // Điều hướng về trang đăng nhập sau 1.5 giây
      setTimeout(() => navigate("/dangnhap"), 1500);
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      toast.error(err.response?.data?.error || "❌ Lỗi khi đăng ký!", {
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
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/70 to-green-700/80 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl flex max-w-5xl w-full h-[650px] relative z-10 overflow-hidden border border-white/20">
        {/* Left */}
        <div className="w-1/2 flex flex-col items-center justify-center p-10 bg-gradient-to-b from-green-600/90 to-green-800/90 text-white rounded-l-2xl h-full relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${LoginImage})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-green-700/70 to-green-900/90"></div>

          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-bold mb-4">Tạo tài khoản mới ✨</h1>
            <p className="text-lg">
              Hãy tham gia cùng chúng tôi và tận hưởng <br />
              những trải nghiệm tuyệt vời.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="w-1/2 p-10 flex flex-col justify-center h-full bg-white rounded-r-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Đăng ký</h2>
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            {/* Họ tên */}
            <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-green-500">
              <FaUser className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Họ và tên"
                className="w-full outline-none"
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-green-500">
              <FaEnvelope className="text-gray-400 mr-3" />
              <input
                type="email"
                placeholder="Nhập email"
                className="w-full outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Mật khẩu */}
            <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-green-500">
              <FaLock className="text-gray-400 mr-3" />
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                className="w-full outline-none"
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                required
              />
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-green-500">
              <FaLock className="text-gray-400 mr-3" />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                className="w-full outline-none"
                value={xacNhan}
                onChange={(e) => setXacNhan(e.target.value)}
                required
              />
            </div>

            {/* Nút đăng ký */}
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold py-3 rounded-lg hover:shadow-xl transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang xử lý..." : <>Đăng ký <FaArrowRight /></>}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <a href="/dangnhap" className="text-green-600 hover:underline">
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DangKy;
