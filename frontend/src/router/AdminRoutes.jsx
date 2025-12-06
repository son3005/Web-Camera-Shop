// src/router/AdminRoutes.jsx
import React, { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

// ✅ Tên biến tiếng Việt, đường dẫn file giữ nguyên
const BangDieuKhien = lazy(() => import("../pages/Admin/Dashboard"));
const QuanLyKho = lazy(() => import("../pages/Admin/Inventory"));
const QuanLyDonHang = lazy(() => import("../pages/Admin/Orders"));
const QuanLyPhieuNhap = lazy(() => import("../pages/Admin/PhieuNhapPage"));
const QuanLyNhaCungCap = lazy(() => import("../pages/Admin/SuppliersPage"));
const CaiDatThuongHieu = lazy(() => import("../pages/Admin/SettingsBrands"));
const CaiDatDanhMuc = lazy(() => import("../pages/Admin/SettingsCategories"));
const CaiDatCapDo = lazy(() => import("../pages/Admin/SettingsLevels"));

// 🔥 Trang quản lý đánh giá
const QuanLyDanhGia = lazy(() => import("../pages/Admin/AdminReviewsPage"));

// 🔥 Trang quản lý khách hàng
const QuanLyKhachHang = lazy(() => import("../pages/Admin/Customers"));

// 🔥 Trang quản lý ảnh trình chiếu
const QuanLyTrinhChieu = lazy(() => import("../pages/Admin/SlideshowPage"));

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
    // Trang mặc định: Bảng điều khiển
    { index: true, element: <BangDieuKhien /> },

    // Sản phẩm / Kho
    { path: "inventory", element: <QuanLyKho /> },

    // Đơn hàng
    { path: "orders", element: <QuanLyDonHang /> },

    // Phiếu nhập
    { path: "phieu-nhap", element: <QuanLyPhieuNhap /> },

    // Nhà cung cấp
    { path: "suppliers", element: <QuanLyNhaCungCap /> },

    // Khách hàng
    { path: "customers", element: <QuanLyKhachHang /> },

    // Đánh giá
    { path: "reviews", element: <QuanLyDanhGia /> },

    // Cài đặt
    { path: "settings/brands", element: <CaiDatThuongHieu /> },
    { path: "settings/categories", element: <CaiDatDanhMuc /> },
    { path: "settings/levels", element: <CaiDatCapDo /> },
    { path: "settings/slideshow", element: <QuanLyTrinhChieu /> },
  ],
};

export default AdminRoutes;
