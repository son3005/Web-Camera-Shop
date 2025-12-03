// D:\Web-Camera-Shop\frontend\src\router\ProtectedRoute.jsx
// ---------------------------------------------------
// Bọc quanh các route cần đăng nhập / cần quyền admin
// ---------------------------------------------------
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation(); // Lấy vị trí hiện tại để quay lại sau login

  // 1. Kiểm tra xem có token không (đã đăng nhập chưa)
  if (!token) {
    return (
      <Navigate
        to="/dangnhap"
        replace
        // lưu lại trang mà user định vào → login xong quay lại
        state={{ from: location }}
      />
    );
  }

  // 2. Nếu route yêu cầu quyền admin (adminOnly=true)
  if (adminOnly) {
    const role = (user?.vai_tro || "").toLowerCase();
    if (role !== "quan_tri_vien") {
      toast.error("Bạn không có quyền truy cập trang này!");
      return <Navigate to="/" replace />;
    }
  }

  // 3. Nếu đã đăng nhập và đủ quyền, hiển thị component con (layout/trang)
  return children;
};

export default ProtectedRoute;
