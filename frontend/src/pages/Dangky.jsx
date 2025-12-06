// src/pages/DangKy.jsx

import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { register as registerApi } from "../api/authApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerSchema } from "../validation/loginSchema";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import BG from "../assets/images/BG.jpg";
import LoginImage from "../assets/images/Login.jpg";

export default function DangKy() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(registerSchema),
  });
  const matKhau = watch("mat_khau");

  const onSubmit = async (data) => {
    const { ho_ten, email, mat_khau, xac_nhan } = data;

    if (mat_khau !== xac_nhan) {
      toast.error("❌ Mật khẩu xác nhận không khớp!", {
        position: "top-center",
      });
      return;
    }

    setLoading(true);

    try {
      await registerApi({ ho_ten, email, mat_khau });
      toast.success("🎉 Đăng ký thành công!", { position: "top-center" });
      setTimeout(() => navigate("/dangnhap"), 1200);
    } catch (err) {
      toast.error(err.response?.data?.error || "❌ Lỗi khi đăng ký!", {
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
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 to-slate-900/60" />

      <div className="relative z-10 flex w-full max-w-6xl h-[640px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5">
        {/* LEFT SIDE */}
        <div className="hidden md:flex w-1/2 relative items-center justify-center text-white">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${LoginImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-700/90 via-emerald-800/92 to-emerald-900/95" />

          <div className="relative z-10 px-10">
            <h1 className="text-4xl font-extrabold drop-shadow-md">
              Tạo tài khoản mới ✨
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-emerald-50/90">
              Tham gia ngay để nhận ưu đãi & trải nghiệm tuyệt vời.
            </p>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 h-full bg-white/95 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 md:p-10">
          <h2 className="text-2xl font-extrabold text-center mb-6">Đăng ký</h2>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* HỌ TÊN */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Họ và tên
              </label>

              <div
                className="
                flex items-center gap-3 w-full px-4 py-3
                rounded-xl bg-white/70 backdrop-blur-xl
                border border-slate-200 shadow-sm
                focus-within:ring-2 focus-within:ring-emerald-500 transition-all"
              >
                <FaUser className="text-slate-600 text-lg" />
                <input
                  type="text"
                  placeholder="Họ và tên"
                  className="flex-1 bg-transparent outline-none text-sm"
                  {...register("ho_ten")}
                />
              </div>

              {errors.ho_ten && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.ho_ten.message}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>

              <div
                className="
                flex items-center gap-3 w-full px-4 py-3
                rounded-xl bg-white/70 backdrop-blur-xl
                border border-slate-200 shadow-sm
                focus-within:ring-2 focus-within:ring-emerald-500 transition-all"
              >
                <FaEnvelope className="text-slate-600 text-lg" />
                <input
                  type="email"
                  placeholder="Nhập email"
                  className="flex-1 bg-transparent outline-none text-sm"
                  {...register("email")}
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu</label>

              <div
                className="
                flex items-center gap-3 w-full px-4 py-3
                rounded-xl bg-white/70 backdrop-blur-xl
                border border-slate-200 shadow-sm
                focus-within:ring-2 focus-within:ring-emerald-500 transition-all"
              >
                <FaLock className="text-slate-600 text-lg" />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className="flex-1 bg-transparent outline-none text-sm"
                  {...register("mat_khau")}
                />
              </div>

              {errors.mat_khau && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mat_khau.message}
                </p>
              )}
            </div>

            {/* CONFIRM */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Xác nhận mật khẩu
              </label>

              <div
                className="
                flex items-center gap-3 w-full px-4 py-3
                rounded-xl bg-white/70 backdrop-blur-xl
                border border-slate-200 shadow-sm
                focus-within:ring-2 focus-within:ring-emerald-500 transition-all"
              >
                <FaLock className="text-slate-600 text-lg" />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  className="flex-1 bg-transparent outline-none text-sm"
                  {...register("xac_nhan")}
                />
              </div>

              {errors.xac_nhan && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.xac_nhan.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-emerald w-full rounded-lg py-3 font-semibold"
            >
              {loading ? (
                "Đang xử lý..."
              ) : (
                <span className="inline-flex items-center gap-2">
                  Đăng ký <FaArrowRight />
                </span>
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-slate-600 dark:text-slate-300">
            Đã có tài khoản?{" "}
            <a href="/dangnhap" className="text-emerald-600 hover:underline">
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
