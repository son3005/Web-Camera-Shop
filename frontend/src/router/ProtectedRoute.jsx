// src/router/ProtectedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

// Component này nhận `children` (là layout/trang cần bảo vệ)
// và `adminOnly` (prop để chỉ định có yêu cầu quyền admin hay không)
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation(); // Lấy vị trí hiện tại

  // 1. Kiểm tra xem có token không (đã đăng nhập chưa)
  if (!token) {
    // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
    // `replace: true` để không lưu lại trang admin trong history
    // `state: { from: location }` để sau khi đăng nhập có thể quay lại trang admin
    return <Navigate to="/dangnhap" replace state={{ from: location }} />;
  }

  // 2. Nếu route yêu cầu quyền admin (adminOnly=true)
  if (adminOnly) {
    // Kiểm tra xem user có tồn tại và có vai trò 'quan_tri_vien' không
    // Giả sử backend trả về trường `vai_tro`
    if (!user || user.vai_tro !== 'quan_tri_vien') {
      // Nếu không phải admin, chuyển hướng về trang chủ hoặc trang báo lỗi 403
      // Ở đây tạm chuyển về trang chủ '/'
      alert("Bạn không có quyền truy cập trang này!");
      return <Navigate to="/" replace />;
    }
  }

  // 3. Nếu đã đăng nhập và đủ quyền, hiển thị component con (layout/trang)
  return children;
};

export default ProtectedRoute;