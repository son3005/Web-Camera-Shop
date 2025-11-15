import React, { lazy, Suspense } from "react";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute"; // bảo vệ route cần đăng nhập

// === Lazy load các trang ===
const HomePage = lazy(() => import("../pages/HomePage"));
const ProductListPage = lazy(() => import("../pages/ProductListPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const AccountPage = lazy(() => import("../pages/AccountPage"));

// === 3 TRANG MỚI THEO BACKEND ĐÃ CÓ ===
const PaymentResultPage = lazy(() => import("../pages/PaymentResultPage"));

// fallback khi đang lazy-load
const Fallback = <div className="p-6 text-center text-slate-300">Đang tải...</div>;

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
    // === TRANG THANH TOÁN (PayOS/COD) ===
    {
      path: "checkout",
      element: (
        <ProtectedRoute>
          <Suspense fallback={Fallback}>
            <CheckoutPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    // === TRANG KẾT QUẢ THANH TOÁN (PayOS) ===
    {
      path: "payment-result/:id",
      element: (
        <ProtectedRoute>
          <Suspense fallback={Fallback}>
            <PaymentResultPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },

    // === TRANG TÀI KHOẢN ===
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
