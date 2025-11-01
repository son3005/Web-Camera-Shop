// src/routes/AdminRoutes.jsx

import React, { lazy } from "react"; // 1. Import `lazy` từ React

// Import Layout như bình thường
import AdminLayout from "../layouts/AdminLayout";

// 2. Chuyển các trang thành component "lười" (lazy-loaded)
//    Điều này giúp tăng tốc độ tải trang ban đầu
const Dashboard = lazy(() => import("../pages/Admin/Dashboard"));
const Inventory = lazy(() => import("../pages/Admin/Inventory"));
const Orders = lazy(() => import("../pages/Admin/Orders"));
const Customers = lazy(() => import("../pages/Admin/Customers"));

// Định nghĩa một object chứa cấu hình route cho Admin
const AdminRoutes = {
  path: "/admin",
  element: <AdminLayout />,
  children: [
    {
      index: true, // Trang mặc định khi truy cập /admin
      element: <Dashboard />,
    },
    {
      path: "inventory", // Tương ứng với URL: /admin/inventory
      element: <Inventory />,
    },
    {
      path: "orders", // 3. Kích hoạt route cho trang Orders
      element: <Orders />,
    },
    { path: "customers", element: <Customers /> },
  ],
};

export default AdminRoutes;
