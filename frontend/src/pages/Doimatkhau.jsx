// src/pages/Doimatkhau.jsx
// — Đồng bộ emerald, form rõ ràng, giữ resetPassword + yup

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPasswordSchema } from "../validation/loginSchema";
import { resetPassword } from "../api/authApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BG from "../assets/images/BG.jpg";
import LoginImage from "../assets/images/Login.jpg";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    const { mat_khau, xac_nhan_mat_khau } = data;
    if (mat_khau !== xac_nhan_mat_khau) {
      toast.error("❌ Mật khẩu xác nhận không khớp!", {
        position: "top-center",
      });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, { mat_khau }); // Backend: POST token + body
      toast.success("✅ Đổi mật khẩu thành công! Hãy đăng nhập lại.", {
        position: "top-center",
      });
      setTimeout(() => navigate("/dangnhap"), 1200);
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ToastContainer />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 to-slate-900/60"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-6xl h-[620px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5">
        {/* Trái */}
        <div className="hidden md:flex w-1/2 relative items-center justify-center text-white">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${LoginImage})` }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-emerald-700/90 via-emerald-800/92 to-emerald-900/95"
            aria-hidden
          />
          <div className="relative z-10 px-10">
            <h1 className="text-4xl font-extrabold drop-shadow-md">
              Đặt lại mật khẩu 🔒
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-emerald-50/90">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </p>
          </div>
        </div>

        {/* Phải */}
        <div className="w-full md:w-1/2 h-full bg-white/95 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 md:p-10">
          <h2 className="text-2xl font-extrabold text-center mb-6">
            Đổi mật khẩu
          </h2>

          <form
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                className="ui-input w-full"
                {...register("mat_khau")}
              />
              {errors.mat_khau && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mat_khau.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                className="ui-input w-full"
                {...register("xac_nhan_mat_khau")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-emerald w-full rounded-lg py-3 font-semibold ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </form>

          <div className="text-center text-sm text-slate-600 dark:text-slate-300 mt-4">
            Nhớ mật khẩu?{" "}
            <a
              href="/dangnhap"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Đăng nhập
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
