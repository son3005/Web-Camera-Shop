import React, { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

// --- Import các cấu hình route riêng lẻ ---
import AdminRoutes from "./AdminRoutes";
// import MainRoutes from './MainRoutes';
import MainLayout from "../layouts/MainLayout";

import HomePage from "../pages/HomePage";
import ProductListPage from "../pages/ProductListPage";
import ProductDetailPage from "../pages/ProductDetailPage";
// const NotFoundPage = () => <div>404 - Page Not Found</div>; // Placeholder cho trang 404
const DangNhap = lazy(() => import("../pages/Dangnhap"));
const DangKy = lazy(() => import("../pages/Dangky"));
const QuenMatKhau = lazy(() => import("../pages/QuenMatKhau"));

// --- Tạo Router tổng hợp ---
const router = createBrowserRouter([
  // Nhóm 1: Các route của Admin
  AdminRoutes,

  // Nhóm 2: Các route Public
  // Public
  {
    path: "/",
    element: (
      <MainLayout>
        {/* Header/Footer đã nằm trong MainLayout của bạn */}
      </MainLayout>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductListPage /> },
      { path: "products/:productId", element: <ProductDetailPage /> },
    ],
  },

  // Nhóm 3: Các route khác như Login, 404
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
  // {
  //   path: '*', // Bắt các URL không khớp
  //   element: <NotFoundPage />
  // }
]);

export default router;
