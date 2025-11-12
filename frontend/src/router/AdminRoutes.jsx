// src/router/AdminRoutes.jsx
import React, { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

// lazy các trang có file thật
const Dashboard = lazy(() => import("../pages/Admin/Dashboard"));
const Inventory = lazy(() => import("../pages/Admin/Inventory"));
const Orders = lazy(() => import("../pages/Admin/Orders"));
const PhieuThu = lazy(() => import("../pages/Admin/PhieuThuPage"));

const AdminLayoutWrapper = () => (
  <ProtectedRoute adminOnly={true}>
    <AdminLayout>
      <Suspense fallback={<div>Đang tải trang...</div>}>
        <Outlet />
      </Suspense>
    </AdminLayout>
  </ProtectedRoute>
);

const AdminRoutes = {
  path: "/admin",
  element: <AdminLayoutWrapper />,
  children: [
    {
      index: true,
      element: <Dashboard />,
    },
    {
      path: "inventory",
      element: <Inventory />,
    },
    {
      path: "orders",
      element: <Orders />,
    },
    {
      path: "phieu-thu", // ✅ route mới
      element: <PhieuThu />,
    },
  ],
};

export default AdminRoutes;
