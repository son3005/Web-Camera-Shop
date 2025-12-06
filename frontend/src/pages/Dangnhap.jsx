//frontend\src\pages\Dangnhap.jsx

import React from "react";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(loginSchema) });

  const onSubmit = async (values) => {
    try {
      const data = await login(values);
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
        ho_ten: decoded.ho_ten || data.user?.ho_ten,
        vai_tro: decoded.vai_tro || data.user?.vai_tro,
      };

      dispatch(datThongTinDangNhap({ user: userToStore, token: data.token }));

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("access_token", data.token);
      localStorage.setItem("token", data.token);

      toast.success("🎉 Đăng nhập thành công!", { position: "top-center" });

      const role = (userToStore.vai_tro || "").toLowerCase();
      const from = location.state?.from?.pathname;

      if (from) {
        navigate(from, { replace: true });
      } else if (role === "quan_tri_vien" || role === "admin") {
        navigate("/admin/inventory", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "❌ Email hoặc mật khẩu không đúng!",
        { position: "top-center" }
      );
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

      <div
        className="
          relative z-10 flex w-full max-w-6xl h-[620px] md:h-[640px]
          rounded-2xl overflow-hidden shadow-2xl border border-white/10
          bg-white/5
        "
      >
        {/* LEFT */}
        <div className="hidden md:flex w-1/2 relative items-center justify-center text-white">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${LoginImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-700/90 via-emerald-800/92 to-emerald-900/95" />
          <div className="relative z-10 px-10">
            <h1 className="text-4xl font-extrabold drop-shadow-md">
              Chào mừng trở lại 📷
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-emerald-50/90">
              Đăng nhập để tiếp tục mua sắm.
            </p>
          </div>
        </div>

        {/* RIGHT (FORM) */}
        <div className="w-full md:w-1/2 h-full bg-white/95 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 md:p-10">
          <h2 className="text-2xl font-extrabold text-center mb-6">
            Đăng nhập
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>

              <div
                className="
                flex items-center gap-3 w-full px-4 py-3
                rounded-xl bg-white/70 backdrop-blur-xl
                border border-slate-200 shadow-sm
                focus-within:ring-2 focus-within:ring-emerald-500
                transition-all"
              >
                <FaEnvelope className="text-slate-600 text-lg" />
                <input
                  type="email"
                  className="flex-1 bg-transparent outline-none text-sm"
                  placeholder="Nhập email"
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
                focus-within:ring-2 focus-within:ring-emerald-500
                transition-all"
              >
                <FaLock className="text-slate-600 text-lg" />
                <input
                  type="password"
                  className="flex-1 bg-transparent outline-none text-sm"
                  placeholder="Nhập mật khẩu"
                  {...register("mat_khau")}
                />
              </div>

              {errors.mat_khau && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mat_khau.message}
                </p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-emerald w-full rounded-lg py-3 font-semibold"
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

          {/* LINKS */}
          <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
            Quên mật khẩu?{" "}
            <a href="/quenmatkhau" className="text-emerald-600 hover:underline">
              Khôi phục
            </a>
          </div>
          <div className="text-center text-sm text-slate-600 dark:text-slate-300">
            Chưa có tài khoản?{" "}
            <a href="/dangky" className="text-emerald-600 hover:underline">
              Đăng ký
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
