<<<<<<< HEAD
// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DangNhap from "./pages/Dangnhap";
import DangKy from "./pages/Dangky";
import QuenMatKhau from "./pages/Quenmatkhau";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dangnhap" replace />} />
        <Route path="/dangnhap" element={<DangNhap />} />
        <Route path="/dangky" element={<DangKy />} />
        <Route path="/quenmatkhau" element={<QuenMatKhau />} />
      </Routes>
    </Router>
  );
}

=======
// Import RouterProvider để cung cấp router cho toàn bộ ứng dụng
import { RouterProvider } from "react-router-dom";

// Import router đã định nghĩa ở src/router/index.jsx
import router from "./router";

function App() {
  // RouterProvider giúp kết nối router (cấu hình các route)
  // với toàn bộ ứng dụng React
  return <RouterProvider router={router} />;
}

// Xuất App làm component gốc
>>>>>>> fe2b7099b0159077b8e7731b3552a991e2de4859
export default App;
