import React, { lazy, Suspense } from "react";

const HomePage = lazy(() => import("../pages/HomePage"));
const ProductListPage = lazy(() => import("../pages/ProductListPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const AccountPage = lazy(() => import("../pages/AccountPage")); // 👈 thêm

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute"; // 👈 dùng để chặn khách vãng lai

// fallback đơn giản
const Fallback = <div>Loading...</div>;

const MainRoutes = {
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
    // 👇 mới: trang quản lý thông tin cá nhân
    {
      path: "tai-khoan",
      element: (
        <ProtectedRoute>
          <Suspense fallback={Fallback}>
            <AccountPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
  ],
};

export default MainRoutes;
