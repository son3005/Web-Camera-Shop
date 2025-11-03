// src/pages/DangNhap.jsx
// — Đồng bộ màu emerald, bỏ blur gây mờ chữ, form nền rõ ràng (light/dark)
// — Giữ nguyên gọi authApi.login + redux, fallback khi backend trả token/user khác nhau

import React from "react";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BG from "../assets/images/BG.jpg";
import LoginImage from "../assets/images/Login.jpg";
import { loginSchema } from "../validation/loginSchema";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { datThongTinDangNhap } from "../redux/slices/authSlice";

export default function DangNhap() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(loginSchema) });

  // ⬇️ submit: tương thích 2 kiểu backend (JWT có payload hoặc trả kèm user)
  const onSubmit = async (values) => {
    try {
      const data = await login(values); // { token, user? }
      if (!data?.token) throw new Error("Token không hợp lệ");

      let decoded = {};
      try {
        decoded = jwtDecode(data.token);
      } catch {
        decoded = data.user || {};
      }
      const userToStore = {
        id: decoded.sub || decoded.id || data.user?.id,
        email: decoded.email || data.user?.email,
        vai_tro: decoded.vai_tro || data.user?.vai_tro,
      };
      dispatch(datThongTinDangNhap({ user: userToStore, token: data.token }));
      toast.success("🎉 Đăng nhập thành công!", { position: "top-center" });

      const role = (userToStore.vai_tro || "").toLowerCase();
      navigate(role === "quan_tri_vien" || role === "admin" ? "/admin" : "/", {
        replace: true,
      });
    } catch (err) {
      console.error("Đăng nhập lỗi:", err);
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "❌ Email hoặc mật khẩu không đúng!",
        { position: "top-center" }
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ToastContainer />

      {/* BG tổng: ảnh + overlay emerald, KHÔNG blur chữ */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 to-slate-900/60"
        aria-hidden
      />

      {/* Card: 2 cột, form nền rõ ràng để chữ không mờ */}
      <div
        className="
          relative z-10 flex w-full max-w-6xl h-[620px] md:h-[640px]
          rounded-2xl overflow-hidden shadow-2xl border border-white/10
          bg-white/5
        "
      >
        {/* Cột trái (hero): ảnh + gradient emerald, chỉ trang trí */}
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
              Chào mừng trở lại 📷
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-emerald-50/90">
              Lưu giữ khoảnh khắc, bắt trọn cảm xúc. <br />
              Đăng nhập để tiếp tục khám phá thế giới nhiếp ảnh.
            </p>
          </div>
        </div>

        {/* Cột phải (form): nền rõ ràng light/dark */}
        <div className="w-full md:w-1/2 h-full bg-white/95 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 md:p-10">
          <h2 className="text-2xl font-extrabold text-center mb-6">
            Đăng nhập
          </h2>

          <form
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
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

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu</label>
              <div className="flex items-center ui-input">
                <FaLock className="mr-2 opacity-70" />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className="flex-1 bg-transparent outline-none"
                  {...register("mat_khau")}
                />
              </div>
              {errors.mat_khau && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mat_khau.message}
                </p>
              )}
            </div>

            {/* Nút */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-emerald w-full rounded-lg py-3 font-semibold ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                "Đang đăng nhập..."
              ) : (
                <span className="inline-flex items-center gap-2">
                  Đăng nhập <FaArrowRight />
                </span>
              )}
            </button>
          </form>

          {/* Link phụ */}
          <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
            Quên mật khẩu?{" "}
            <a
              href="/quenmatkhau"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Khôi phục
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
