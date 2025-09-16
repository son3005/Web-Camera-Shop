// App.jsx
import React from "react";
// Import React Router để chuyển trang giữa đăng nhập / đăng ký / quên mật khẩu
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import các trang đã tạo
import DangNhap from "./pages/DangNhap";
import DangKy from "./pages/DangKy";
import QuenMatKhau from "./pages/QuenMatKhau";

function App() {
  return (
    // Router giúp điều hướng giữa các trang
    <Router>
      <Routes>
        {/* Khi mở trang chính thì vào trang đăng nhập */}
        <Route path="/" element={<DangNhap />} />
        {/* Trang đăng ký */}
        <Route path="/register" element={<DangKy />} />
        {/* Trang quên mật khẩu */}
        <Route path="/forgot-password" element={<QuenMatKhau />} />
      </Routes>
    </Router>
  );
}

export default App;
