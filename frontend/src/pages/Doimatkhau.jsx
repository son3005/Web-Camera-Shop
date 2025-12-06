// src/pages/Doimatkhau.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPasswordSchema } from "../validation/loginSchema";
import { resetPassword } from "../api/authApi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FaLock, FaArrowRight } from "react-icons/fa";

import BG from "../assets/images/BG.jpg";
import LoginImage from "../assets/images/Login.jpg";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(resetPasswordSchema) });

  const matKhau = watch("mat_khau");

  const handleResetPassword = async (data) => {
    const { mat_khau, xac_nhan_mat_khau } = data;

    if (mat_khau !== xac_nhan_mat_khau) {
      toast.error("❌ Mật khẩu xác nhận không khớp!", {
        position: "top-center",
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, { mat_khau });

      toast.success("🎉 Đổi mật khẩu thành công! Hãy đăng nhập lại.", {
        position: "top-center",
      });

      setTimeout(() => navigate("/dangnhap"), 1200);
    } catch (err) {
      toast.error(err.response?.data?.error || "❌ Lỗi đổi mật khẩu!", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ToastContainer />

      {/* Nền + overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 to-slate-900/60" />

      {/* CARD */}
      <div
        className="
          relative z-10 w-full max-w-md p-8 rounded-2xl
          bg-white/10 backdrop-blur-xl border border-white/20
          shadow-2xl
        "
      >
        <h2 className="text-2xl font-extrabold text-center mb-6 text-white drop-shadow">
          🔒 Đặt lại mật khẩu
        </h2>

        <form
          onSubmit={handleSubmit(handleResetPassword)}
          className="space-y-4"
        >
          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium mb-1 text-white/90">
              Mật khẩu mới
            </label>

            <div
              className="
                flex items-center gap-3 px-4 py-3
                rounded-xl bg-white/70 backdrop-blur-xl
                border border-slate-200 shadow-sm
                focus-within:ring-2 focus-within:ring-emerald-500
                transition-all
              "
            >
              <FaLock className="text-slate-700 text-lg" />
              <input
                type="password"
                className="flex-1 bg-transparent outline-none text-sm text-slate-900"
                placeholder="Nhập mật khẩu mới"
                {...register("mat_khau")}
              />
            </div>

            {errors.mat_khau && (
              <p className="text-red-500 text-sm mt-1">
                {errors.mat_khau.message}
              </p>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-sm font-medium mb-1 text-white/90">
              Xác nhận mật khẩu
            </label>

            <div
              className="
                flex items-center gap-3 px-4 py-3
                rounded-xl bg-white/70 backdrop-blur-xl
                border border-slate-200 shadow-sm
                focus-within:ring-2 focus-within:ring-emerald-500
                transition-all
              "
            >
              <FaLock className="text-slate-700 text-lg" />
              <input
                type="password"
                className="flex-1 bg-transparent outline-none text-sm text-slate-900"
                placeholder="Nhập lại mật khẩu"
                {...register("xac_nhan_mat_khau")}
              />
            </div>

            {errors.xac_nhan_mat_khau && (
              <p className="text-red-500 text-sm mt-1">
                {errors.xac_nhan_mat_khau.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full rounded-lg py-3 mt-2 font-semibold text-white
              bg-gradient-to-r from-emerald-500 to-emerald-700
              hover:shadow-xl hover:shadow-emerald-500/30 transition
              disabled:opacity-60
            "
          >
            {loading ? (
              "Đang xử lý..."
            ) : (
              <span className="inline-flex items-center gap-2">
                Xác nhận <FaArrowRight />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
