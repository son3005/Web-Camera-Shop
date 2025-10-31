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
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-900 dark:to-slate-950">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 dark:bg-slate-900 dark:border dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-slate-100">
          🔒 Đặt lại mật khẩu
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-slate-300">
              Mật khẩu mới
            </label>
            <input
              type="password"
              className="border rounded-lg w-full px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-slate-300">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              className="border rounded-lg w-full px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-300"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          {message && (
            <p className="text-red-500 dark:text-rose-400 text-sm text-center mb-3">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold py-2 rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition"
          >
            Xác nhận
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
