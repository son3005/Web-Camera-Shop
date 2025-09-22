import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// --- Import các cấu hình route riêng lẻ ---
import AdminRoutes from './AdminRoutes';

// --- Import các trang Public (trang của người dùng) ---
// Giả sử đồng đội của bạn đã tạo các trang này
// import HomePage from '../pages/HomePage';
// import ProductDetailPage from '../pages/ProductDetailPage';
// import LoginPage from '../pages/LoginPage';
// import NotFoundPage from '../pages/NotFoundPage';

// --- Tạo Router tổng hợp ---
const router = createBrowserRouter([
  // Nhóm 1: Các route của Admin, được import từ file riêng
  AdminRoutes,

  // Nhóm 2: Các route Public mà đồng đội bạn đang phát triển
  {
    path: '/',
    // element: <PublicLayout />, // Có thể có một layout riêng cho trang public
    children: [
      {
        index: true,
        // element: <HomePage />, // Đây là trang chủ
        element: <div>Đây là trang chủ</div>, // Placeholder
      },
      {
        path: 'products/:productId', // ví dụ: /products/canon-eos-r5
        // element: <ProductDetailPage />,
        element: <div>Đây là trang chi tiết sản phẩm</div>, // Placeholder
      },
      // ... Các trang public khác
    ],
  },

  // Nhóm 3: Các route khác như Login, 404
  // {
  //   path: '/login',
  //   element: <LoginPage />
  // },
  // {
  //   path: '*', // Bắt các URL không khớp
  //   element: <NotFoundPage />
  // }
]);

export default router;