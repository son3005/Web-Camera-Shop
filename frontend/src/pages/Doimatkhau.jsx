// frontend/src/components/Doimatkhau.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/authApi"; // ✅ dùng đúng hàm API đã định nghĩa
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const { token } = useParams(); // lấy token từ URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("❌ Mật khẩu xác nhận không khớp!", { position: "top-center" });
      return;
    }

    setLoading(true);
    try {
      // --- BẮT ĐẦU SỬA LỖI ---
      // Gọi hàm với 2 tham số riêng biệt: (token, passwordData)
      await resetPassword(token, { mat_khau: password });
      // --- KẾT THÚC SỬA LỖI ---

      toast.success("✅ Đổi mật khẩu thành công! Hãy đăng nhập lại.", {
        position: "top-center",
      });

      // Chuyển về trang đăng nhập sau 2s
      setTimeout(() => navigate("/dangnhap"), 2000);
    } catch (err) {
      console.error("Lỗi đặt lại mật khẩu:", err);
      toast.error(err.response?.data?.error || "❌ Lỗi đổi mật khẩu!", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-indigo-100">
      <ToastContainer />
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          🔒 Đặt lại mật khẩu
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Mật khẩu mới */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {/* Nút xác nhận */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Nhớ mật khẩu?{" "}
          <a href="/dangnhap" className="text-blue-600 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;