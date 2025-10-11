import React from "react";
import { useForm } from "react-hook-form";                // ✅ Quản lý form
import { yupResolver } from "@hookform/resolvers/yup";    // ✅ Validate form bằng Yup
import * as yup from "yup";                               // ✅ Schema validation
import axios from "axios";
import jwtDecode from "jwt-decode";                       // ✅ Giải mã JWT để lấy thông tin user
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";             // ✅ Lưu user vào Redux
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import BG from "../assets/images/BG.jpg";
import LoginImage from "../assets/images/Login.jpg";

// ✅ Schema xác thực form
const schema = yup.object({
  email: yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
  password: yup.string().min(6, "Tối thiểu 6 ký tự").required("Vui lòng nhập mật khẩu"),
});

function DangNhap() {
  const dispatch = useDispatch();

  // ✅ Khởi tạo form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  // ✅ Xử lý đăng nhập
  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", data);
      const token = res.data.token;

      // Giải mã token để lấy thông tin user
      const user = jwtDecode(token);

      // Lưu vào redux
      dispatch(setUser({ user, token }));

      alert("Đăng nhập thành công!");
      // Có thể redirect tới trang chủ: navigate("/")
    } catch (err) {
      alert("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 to-blue-700/80 backdrop-blur-sm"></div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl flex max-w-5xl w-full h-[600px] relative z-10 overflow-hidden border border-white/20">
        {/* Bên trái */}
        <div className="w-1/2 flex flex-col items-center justify-center p-10 bg-gradient-to-b from-blue-600/90 to-blue-800/90 text-white rounded-l-2xl h-full relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${LoginImage})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-700/70 to-blue-900/90"></div>

          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-bold mb-4">Chào mừng trở lại 📷</h1>
            <p className="text-lg">
              Lưu giữ khoảnh khắc, bắt trọn cảm xúc. <br />
              Đăng nhập để tiếp tục khám phá thế giới nhiếp ảnh.
            </p>
          </div>
        </div>

        {/* Bên phải */}
        <div className="w-1/2 p-10 flex flex-col justify-center h-full bg-white rounded-r-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Đăng nhập</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500">
                <FaEnvelope className="text-gray-400 mr-3" />
                <input
                  type="email"
                  placeholder="Nhập email"
                  className="w-full outline-none"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500">
                <FaLock className="text-gray-400 mr-3" />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className="w-full outline-none"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-xl transition"
            >
              Đăng nhập <FaArrowRight />
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600">
            Quên mật khẩu?{" "}
            <a href="/quenmatkhau" className="text-blue-600 hover:underline">Khôi phục</a>
          </p>
          <p className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <a href="/dangky" className="text-blue-600 hover:underline">Đăng ký</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DangNhap;
