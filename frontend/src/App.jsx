// src/App.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Bạn có thể import Header/Footer chung cho trang public ở đây nếu muốn
// import HeaderPublic from './components/layout/Public/Header';
// import FooterPublic from './components/layout/Public/Footer';

function App() {
  return (
    <> {/* Hoặc <div className="app-container"> */}

      {/* --- QUAN TRỌNG: Thêm Outlet vào đây --- */}
      {/* Outlet là nơi router sẽ render các layout con (MainLayout, AdminLayoutWrapper) */}
      {/* hoặc các trang không dùng layout (DangNhap, DangKy...) */}
      <Outlet />
      {/* --- HẾT PHẦN QUAN TRỌNG --- */}

      {/* ToastContainer nên đặt ở cấp cao nhất (App.jsx) */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="colored"
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;