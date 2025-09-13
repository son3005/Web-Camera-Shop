// src/pages/Dangnhap.jsx
import React, { useState } from "react";

export default function Dangnhap() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Mật khẩu:", matKhau);
    alert("Đăng nhập thành công (demo)");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Đăng Nhập
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
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
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mật khẩu */}
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
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ghi nhớ */}
          <div className="flex items-center">
            <input
              id="ghinho"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
            />
            <label htmlFor="ghinho" className="ml-2 block text-sm text-gray-300">
              Ghi nhớ đăng nhập
            </label>
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Đăng Nhập
          </button>
        </form>

        {/* Link tạo tài khoản */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          Người dùng mới?{" "}
          <a href="#" className="text-blue-400 hover:underline font-medium">
            Tạo tài khoản
          </a>
        </p>
      </div>
    </div>
  );
}
