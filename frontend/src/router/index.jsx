import React, { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

// --- Import các cấu hình route riêng lẻ ---
import AdminRoutes from "./AdminRoutes";
import MainLayout from "../layouts/MainLayout";

// --- Import các trang ---
import HomePage from "../pages/HomePage";
import ProductListPage from "../pages/ProductListPage";
import ProductDetailPage from "../pages/ProductDetailPage";

// --- Lazy load các trang khác ---
const DangNhap = lazy(() => import("../pages/Dangnhap"));
const DangKy = lazy(() => import("../pages/Dangky"));
const QuenMatKhau = lazy(() => import("../pages/Quenmatkhau"));
const DoiMatKhau = lazy(() => import("../pages/Doimatkhau")); // ✅ thêm dòng này

// --- Tạo Router tổng hợp ---
const router = createBrowserRouter([
  // Nhóm 1: Route của Admin
  AdminRoutes,

  // Nhóm 2: Public routes (dùng MainLayout)
  {
    path: "/",
    element: <MainLayout />, // MainLayout đã chứa Header/Footer
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductListPage /> },
      { path: "products/:productId", element: <ProductDetailPage /> },
    ],
  },

  // Nhóm 3: Auth routes (login, register, forgot password, reset password)
  {
    path: "/dangnhap",
    element: <DangNhap />,
  },
  {
    path: "/dangky",
    element: <DangKy />,
  },
  {
    path: "/quenmatkhau",
    element: <QuenMatKhau />,
  },
  {
    path: "/doimatkhau/:token",
    element: <DoiMatKhau />, // ✅ dùng component đúng
  },

  // Có thể thêm trang 404 nếu cần
  // {
  //   path: "*",
  //   element: <NotFoundPage />,
  // },
]);

export default router;
