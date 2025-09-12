// src/pages/Dangky.jsx
import React, { useState } from "react";

export default function Dangky() {
  const [tenKhachHang, setTenKhachHang] = useState("");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    if (matKhau !== xacNhanMatKhau) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Demo: hiển thị thông tin người dùng
    console.log("Tên khách hàng:", tenKhachHang);
    console.log("Email:", email);
    console.log("Mật khẩu:", matKhau);

    alert("Đăng ký thành công (demo)");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Đăng Ký Tài Khoản
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nhập tên khách hàng */}
          <div>
            <label
              htmlFor="tenKhachHang"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Tên khách hàng
            </label>
            <input
              id="tenKhachHang"
              type="text"
              placeholder="Nhập tên của bạn"
              value={tenKhachHang}
              onChange={(e) => setTenKhachHang(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Nhập email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="nhapemail@vidu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Nhập mật khẩu */}
          <div>
            <label
              htmlFor="matkhau"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Mật khẩu
            </label>
            <input
              id="matkhau"
              type="password"
              placeholder="Nhập mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label
              htmlFor="xacnhanmatkhau"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Xác nhận mật khẩu
            </label>
            <input
              id="xacnhanmatkhau"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={xacNhanMatKhau}
              onChange={(e) => setXacNhanMatKhau(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Đăng Ký
          </button>
        </form>

        {/* Link quay lại đăng nhập */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          Đã có tài khoản?{" "}
          <a href="/dangnhap" className="text-green-400 hover:underline font-medium">
            Đăng nhập ngay
          </a>
        </p>
      </div>
    </div>
  );
}
