import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import MainLayout from "../layouts/MainLayout";

const HomePage = lazy(() => import("../pages/HomePage"));
const ProductListPage = lazy(() => import("../pages/ProductListPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));

const DangNhap = lazy(() => import("../pages/Dangnhap"));
const DangKy = lazy(() => import("../pages/Dangky"));
const QuenMatKhau = lazy(() => import("../pages/QuenMatKhau"));
const DoiMatKhau = lazy(() => import("../pages/Doimatkhau"));

const Fallback = <div className="container mx-auto px-4 py-10">Đang tải…</div>;

const router = createBrowserRouter([
  AdminRoutes,
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Fallback}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "products",
        element: (
          <Suspense fallback={Fallback}>
            <ProductListPage />
          </Suspense>
        ),
      },
      {
        path: "products/:productId",
        element: (
          <Suspense fallback={Fallback}>
            <ProductDetailPage />
          </Suspense>
        ),
      },
      {
        path: "cart",
        element: (
          <Suspense fallback={Fallback}>
            <CartPage />
          </Suspense>
        ),
      },
      {
        path: "checkout",
        element: (
          <Suspense fallback={Fallback}>
            <CheckoutPage />
          </Suspense>
        ),
      },
    ],
  },
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
]);

export default router;
