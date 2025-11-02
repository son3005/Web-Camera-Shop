
// src/router/index.jsx
import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// --- Import Layout gốc ---
import App from "../App"; // Component gốc chứa <Outlet/> và ToastContainer

// --- Import các cấu hình route con ---
import AdminRoutes from "./AdminRoutes"; // Object cấu hình route admin
import MainRoutes from "./MainRoutes"; // Object cấu hình route public

// --- Lazy load các trang Auth (không dùng layout) ---
const DangNhap = lazy(() => import("../pages/Dangnhap"));
const DangKy = lazy(() => import("../pages/Dangky")); // Giả sử có trang Dangky
const QuenMatKhau = lazy(() => import("../pages/Quenmatkhau"));
const DoiMatKhau = lazy(() => import("../pages/Doimatkhau"));


const router = createBrowserRouter([
  {
    // Route gốc sử dụng App layout
    path: "/",
    element: <App />, // App chứa <Outlet/>
    children: [
  
      MainRoutes,

      AdminRoutes,
    ],
  },

  // --- Các route không dùng layout chung (App layout) ---
  // Ví dụ: Trang đăng nhập, đăng ký...
  {
    path: "/dangnhap",
    element: (
      <Suspense fallback={<div>Đang tải...</div>}>
        <DangNhap />
      </Suspense>
    ),
  },
  {
    path: "/dangky", // Ví dụ
    element: (
      <Suspense fallback={<div>Đang tải...</div>}>
        <DangKy />
      </Suspense>
    ),
  },
   {
    path: "/quenmatkhau",
    element: (
      <Suspense fallback={<div>Đang tải...</div>}>
        <QuenMatKhau />
      </Suspense>
    ),
  },
  {
    path: "/doimatkhau/:token", // Sửa lại tên route nếu cần
    element: (
      <Suspense fallback={<div>Đang tải...</div>}>
        <DoiMatKhau />
      </Suspense>
    ),
  },
]);

export default router;