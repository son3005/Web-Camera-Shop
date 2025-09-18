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

export default App;
