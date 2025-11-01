// src/pages/Doimatkhau.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// ⬇️ dùng lại ảnh nền giống trang đăng nhập/đăng ký
import BG from "../assets/images/BG.jpg";
import LoginImage from "../assets/images/Login.jpg";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("❌ Mật khẩu xác nhận không khớp");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mat_khau: password }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Lỗi đổi mật khẩu");

      alert("✅ Đổi mật khẩu thành công! Hãy đăng nhập lại.");
      navigate("/dangnhap"); // ✅ đồng bộ với trang đăng nhập
    } catch (err) {
      setMessage(`⚠️ ${err.message || "Không thể kết nối tới máy chủ."}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Nền ảnh + overlay giống Đăng nhập/Đăng ký */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/70 to-emerald-700/80 backdrop-blur-sm" />

      {/* Card “glass” ở giữa */}
      <div className="relative z-10 max-w-3xl w-full mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Trang trí bên trái (mờ, giống login/register) */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center relative bg-gradient-to-b from-emerald-600/90 to-emerald-800/90">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url(${LoginImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-700/70 to-emerald-900/90" />
            <div className="relative z-10 p-8 text-center text-white">
              <h2 className="text-2xl font-bold">🔒 Đặt lại mật khẩu</h2>
              <p className="mt-2 text-white/80">
                Nhập mật khẩu mới của bạn và xác nhận để hoàn tất.
              </p>
            </div>
          </div>

          {/* Form bên phải */}
          <div className="w-full md:w-1/2 p-8 bg-white/70 dark:bg-slate-900/80">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-slate-100 md:hidden">
              🔒 Đặt lại mật khẩu
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-slate-300">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg px-3 py-2 border focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-300"
                  placeholder="Nhập mật khẩu mới"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-slate-300">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg px-3 py-2 border focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-300"
                  placeholder="Nhập lại mật khẩu"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {message && (
                <p className="text-red-600 dark:text-rose-400 text-sm text-center">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold py-2.5 rounded-lg hover:shadow-xl hover:shadow-emerald-500/30 transition disabled:opacity-60"
              >
                {submitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
