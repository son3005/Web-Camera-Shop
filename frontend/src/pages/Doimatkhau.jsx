// src/pages/Doimatkhau.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPasswordSchema } from "../validation/loginSchema"; // ✅ import schema yup
import { resetPassword } from "../api/authApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ⬇️ dùng lại ảnh nền giống trang đăng nhập/đăng ký
import BG from "../assets/images/BG.jpg";
import LoginImage from "../assets/images/Login.jpg";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dangnhap = "/dangnhap";

  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const handleResetPassword = async (data) => {
    const { mat_khau, xac_nhan_mat_khau } = data;

    
    if (mat_khau !== xac_nhan_mat_khau) {
      toast.error("❌ Mật khẩu xác nhận không khớp!", { position: "top-center" });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, { mat_khau });

      toast.success("✅ Đổi mật khẩu thành công! Hãy đăng nhập lại.", {
        position: "top-center",
      });

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

          <form onSubmit={handleSubmit(handleResetPassword)}>
            {/* Mật khẩu mới */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
                {...register("mat_khau")}
              />
              {errors.mat_khau && (
                <p className="text-red-500 text-sm mt-1">{errors.mat_khau.message}</p>
              )}
            </div>
  
            {/* Xác nhận mật khẩu */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
                {...register("xac_nhan_mat_khau")}
              />
              {errors.xac_nhan_mat_khau && (
                <p className="text-red-500 text-sm mt-1">{errors.xac_nhan_mat_khau.message}</p>
              )}
            </div>
  
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold py-2.5 rounded-lg hover:shadow-xl hover:shadow-emerald-500/30 transition disabled:opacity-60"
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </form>
      </div>
    </div>
  );
};

export default ResetPassword;
