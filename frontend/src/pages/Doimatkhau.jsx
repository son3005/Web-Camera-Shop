import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams(); // lấy token từ URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("❌ Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mat_khau: password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("✅ Đổi mật khẩu thành công! Hãy đăng nhập lại.");
        navigate("/login");
      } else {
        setMessage(`❌ ${data.error || "Lỗi đổi mật khẩu"}`);
      }
    } catch (error) {
      setMessage("⚠️ Không thể kết nối tới máy chủ.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-100 to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          🔒 Đặt lại mật khẩu
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Mật khẩu mới</label>
            <input
              type="password"
              className="border rounded-lg w-full px-3 py-2 mt-1 focus:ring focus:ring-green-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Xác nhận mật khẩu</label>
            <input
              type="password"
              className="border rounded-lg w-full px-3 py-2 mt-1 focus:ring focus:ring-green-200"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className="text-red-500 text-sm text-center mb-3">{message}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            Xác nhận
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
