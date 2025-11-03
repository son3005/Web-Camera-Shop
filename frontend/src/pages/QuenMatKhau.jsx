// src/pages/QuenMatKhau.jsx
// — Đồng bộ emerald, form rõ ràng, giữ forgotPassword + yup

import React, { useState } from "react";
import { FaEnvelope, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/authApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forgotPasswordSchema } from "../validation/loginSchema";
import BG from "../assets/images/BG.jpg";
import LoginImage from "../assets/images/Login.jpg";

export default function QuenMatKhau() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await forgotPassword(data); // { email }
      toast.success("📩 Email khôi phục mật khẩu đã được gửi!", {
        position: "top-center",
      });
      setTimeout(() => navigate("/dangnhap"), 1200);
    } catch (err) {
      console.error("Lỗi quên mật khẩu:", err);
      toast.error(err.response?.data?.error || "❌ Không thể gửi email!", {
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
              Quên mật khẩu 🔑
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-emerald-50/90">
              Nhập email để nhận liên kết khôi phục và tiếp tục hành trình nhiếp
              ảnh.
            </p>
          </div>
        </div>

        {/* Phải */}
        <div className="w-full md:w-1/2 h-full bg-white/95 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 md:p-10">
          <h2 className="text-2xl font-extrabold text-center mb-6">
            Khôi phục mật khẩu
          </h2>

          <form
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Email đã đăng ký
              </label>
              <div className="flex items-center ui-input">
                <FaEnvelope className="mr-2 opacity-70" />
                <input
                  type="email"
                  placeholder="Nhập email"
                  className="flex-1 bg-transparent outline-none"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-emerald w-full rounded-lg py-3 font-semibold ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                "Đang gửi..."
              ) : (
                <span className="inline-flex items-center gap-2">
                  Gửi liên kết <FaArrowRight />
                </span>
              )}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-slate-600 dark:text-slate-300">
            Nhớ mật khẩu?{" "}
            <a
              href="/dangnhap"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Đăng nhập
            </a>
          </div>
          <div className="text-center text-sm text-slate-600 dark:text-slate-300">
            Chưa có tài khoản?{" "}
            <a
              href="/dangky"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Đăng ký
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
