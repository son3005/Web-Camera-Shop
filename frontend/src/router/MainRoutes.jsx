import React, { lazy } from "react";

const HomePage = lazy(() => import("../pages/HomePage"));
const ProductListPage = lazy(() => import("../pages/ProductListPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));


import MainLayout from "../layouts/MainLayout";
import Home from "../pages/HomePage";

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
    ],
  },
};

export default MainRoutes;
