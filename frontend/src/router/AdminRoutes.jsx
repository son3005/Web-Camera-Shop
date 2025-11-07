// src/router/AdminRoutes.jsx
import React, { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import Inventory from "../pages/Admin/Inventory";

// --- Lazy load các trang con ---
const Dashboard = lazy(() => import("../pages/Admin/Dashboard"));
const Orders = lazy(() => import("../pages/Admin/Orders"));
const PhieuThuList = lazy(() => import("../pages/Admin/PhieuThuList"));
const PhieuThuForm = lazy(() => import("../pages/Admin/PhieuThuForm"));
// ✅ Gợi ý sau: thêm chi tiết nếu cần
// const PhieuThuDetail = lazy(() => import("../pages/Admin/PhieuThuDetail"));
const Transactions = lazy(() => import("../pages/Admin/Transactions")); // ← nếu bạn có trang này

// --- (1) Layout wrapper bảo vệ quyền Admin ---
const AdminLayoutWrapper = () => (
  <ProtectedRoute adminOnly={true}>
    <AdminLayout>
      <Suspense fallback={<div className="p-6 text-center">Đang tải trang...</div>}>
        <Outlet />
      </Suspense>
    </AdminLayout>
  </ProtectedRoute>
);

// --- (2) Cấu hình các route admin ---
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

    // ✅ Phiếu thu riêng biệt (từ Sidebar /admin/phieu-thu)
    {
      path: "phieu-thu",
      children: [
        { index: true, element: <PhieuThuList /> }, // /admin/phieu-thu
        { path: "new", element: <PhieuThuForm  /> }, // /admin/phieu-thu/new
        // { path: ":id", element: <PhieuThuDetail /> }, // nếu cần chi tiết
      ],
    },

    // ✅ Giao dịch riêng biệt (từ Sidebar /admin/transactions)
    {
      path: "transactions",
      element: <Transactions />, // hoặc tạm thời 1 trang placeholder
    },

    // Cài đặt
    // { path: "settings", element: <SettingsPage /> },
  ],
};

export default AdminRoutes;
