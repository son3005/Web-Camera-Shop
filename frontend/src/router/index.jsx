// src/router/index.jsx
import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import AdminRoutes from "./AdminRoutes";
import MainRoutes from "./MainRoutes";

// Các trang auth & static
const DangNhap = lazy(() => import("../pages/Dangnhap"));
const DangKy = lazy(() => import("../pages/Dangky"));
const QuenMatKhau = lazy(() => import("../pages/Quenmatkhau"));
const DoiMatKhau = lazy(() => import("../pages/Doimatkhau"));
const ChinhSachPage = lazy(() => import("../pages/ChinhSachPage"));
const LienHePage = lazy(() => import("../pages/LienHePage"));

const Fallback = <div className="container mx-auto px-4 py-10">Đang tải…</div>;

const router = createBrowserRouter([
  // 🌟 Admin
  AdminRoutes,

  // 🌟 Client main site (/, products, cart, checkout, tai-khoan, payment-result,…)
  MainRoutes,

  // 🌟 Auth pages
  {
    path: "/dangnhap",
    element: (
      <Suspense fallback={Fallback}>
        <DangNhap />
      </Suspense>
    ),
  },
  {
    path: "/dangky",
    element: (
      <Suspense fallback={Fallback}>
        <DangKy />
      </Suspense>
    ),
  },
  {
    path: "/quenmatkhau",
    element: (
      <Suspense fallback={Fallback}>
        <QuenMatKhau />
      </Suspense>
    ),
  },
  {
    path: "/doimatkhau/:token",
    element: (
      <Suspense fallback={Fallback}>
        <DoiMatKhau />
      </Suspense>
    ),
  },

  // 🌟 Các trang tĩnh ngoài layout chính (nếu bạn muốn để riêng cũng được)
  {
    path: "/chinh-sach",
    element: (
      <Suspense fallback={Fallback}>
        <ChinhSachPage />
      </Suspense>
    ),
  },
  {
    path: "/lien-he",
    element: (
      <Suspense fallback={Fallback}>
        <LienHePage />
      </Suspense>
    ),
  },

  // (optional) 404 custom
  // {
  //   path: "*",
  //   element: <NotFoundPage />,
  // },
]);

export default router;
