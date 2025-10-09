import React, { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

// --- Import các cấu hình route riêng lẻ ---
import AdminRoutes from "./AdminRoutes";
// import MainRoutes from './MainRoutes';
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";

// const NotFoundPage = () => <div>404 - Page Not Found</div>; // Placeholder cho trang 404
const DangNhap = lazy(() => import("../pages/Dangnhap"));
const DangKy = lazy(() => import("../pages/Dangky"));
const QuenMatKhau = lazy(() => import("../pages/QuenMatKhau"));

// --- Tạo Router tổng hợp ---
const router = createBrowserRouter([
  // Nhóm 1: Các route của Admin
  AdminRoutes,

  // Nhóm 2: Các route Public
  {
    path: "/",
    children: [
      {
        index: true,
        element: (
          <MainLayout>
            <Home />
          </MainLayout>
        ), // Placeholder
      },
      {
        path: "products/:productId", // ví dụ: /products/canon-eos-r5
        // element: <ProductDetailPage />,
        element: <div>Đây là trang chi tiết sản phẩm</div>, // Placeholder
      },
      // ... Các trang public khác
    ],
  },
  // MainRoutes,

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
