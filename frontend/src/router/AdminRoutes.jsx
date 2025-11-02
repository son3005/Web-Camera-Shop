// src/router/AdminRoutes.jsx

import React, { lazy, Suspense } from 'react'; // Thêm Suspense
import { Outlet } from 'react-router-dom'; // Thêm Outlet
import AdminLayout from '../layouts/AdminLayout'; // Import Layout
import ProtectedRoute from './ProtectedRoute'; // --- (1) Import ProtectedRoute ---

// Lazy load các trang con
const Dashboard = lazy(() => import('../pages/Admin/Dashboard'));
const ProductManagement = lazy(() => import('../components/common/admin/ProductManagement'));
const Orders = lazy(() => import('../pages/Admin/Orders'));
// Thêm các trang admin khác nếu có

// --- (2) Bọc AdminLayout bằng ProtectedRoute ---
// AdminLayout bây giờ sẽ chứa <Outlet /> để render các trang con
const AdminLayoutWrapper = () => (
  <ProtectedRoute adminOnly={true}> {/* Yêu cầu đăng nhập và là admin */}
    <AdminLayout>
       {/* Thêm Suspense để hiển thị loading khi trang con đang tải */}
       <Suspense fallback={<div>Đang tải trang...</div>}>
         <Outlet /> {/* Các trang con sẽ được render ở đây */}
       </Suspense>
    </AdminLayout>
  </ProtectedRoute>
);


// Định nghĩa route cho Admin
const AdminRoutes = {
  path: '/admin',
  // --- (3) Sử dụng Wrapper thay vì AdminLayout trực tiếp ---
  element: <AdminLayoutWrapper />,
  children: [
    {
      index: true, // Trang /admin
      element: <Dashboard />,
    },
    {
      path: 'inventory', // Trang /admin/inventory
      element: <ProductManagement />,
    },
    {
      path: 'orders', // Trang /admin/orders
      element: <Orders />,
    },
    // Thêm các route admin con khác ở đây
    // { path: 'users', element: <UsersPage /> },
    // { path: 'settings', element: <SettingsPage /> },
  ],
};

export default AdminRoutes;
