// src/pages/DangNhap.jsx
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

function DangNhap() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const dangky = "/dangky";
  const quenmatkhau = "/quenmatkhau";


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (values) => {
    try {
      const data = await login(values); // values = { email, mat_khau }

      if (!data?.token) {
        throw new Error("Server không trả về token hợp lệ");
      }

      
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
      if (role === "quan_tri_vien" || role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Đăng nhập lỗi:", err);
      const msg =
        err.response?.data?.error ||
        err.message ||
        "❌ Email hoặc mật khẩu không đúng!";
      toast.error(msg, { position: "top-center" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ToastContainer />

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 to-blue-700/80 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl flex max-w-5xl w-full h-[600px] relative z-10 overflow-hidden border border-white/20">
        {/* Left */}
        <div className="w-1/2 flex flex-col items-center justify-center p-10 bg-gradient-to-b from-blue-600/90 to-blue-800/90 text-white rounded-l-2xl h-full relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${LoginImage})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-700/70 to-blue-900/90"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-bold mb-4">Chào mừng trở lại 📷</h1>
            <p className="text-lg">
              Lưu giữ khoảnh khắc, bắt trọn cảm xúc.
              <br />
              Đăng nhập để tiếp tục khám phá thế giới nhiếp ảnh.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="w-1/2 p-10 flex flex-col justify-center h-full bg-white rounded-r-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Đăng nhập
          </h2>

          <form
            className="flex flex-col space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* Email */}
            <div>
              <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500">
                <FaEnvelope className="text-gray-400 mr-3" />
                <input
                  type="email"
                  placeholder="Nhập email"
                  className="w-full outline-none"
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
              <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500">
                <FaLock className="text-gray-400 mr-3" />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className="w-full outline-none"
                  {...register("mat_khau")}
                />
              </div>
              {errors.mat_khau && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mat_khau.message}
                </p>
              )}
            </div>

            {/* Nút Đăng nhập */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-xl transition ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                "Đang đăng nhập..."
              ) : (
                <>
                  Đăng nhập <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-4 text-sm text-gray-600">
            Quên mật khẩu?{" "}
            <a href={quenmatkhau} className="text-blue-600 hover:underline">
              Khôi phục
            </a>
          </p>
          <p className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <a href={dangky} className="text-blue-600 hover:underline">
              Đăng ký
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DangNhap;
