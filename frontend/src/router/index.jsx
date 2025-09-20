// Import hàm tạo router từ react-router-dom
import { createBrowserRouter } from "react-router-dom";

// Import trang Home
import Home from "../pages/Home";

// Import layout bao quanh các trang (chứa Header, Footer, SocialBar)
import MainLayout from "../layouts/MainLayout";

// Tạo router chính của ứng dụng
const router = createBrowserRouter([
  {
    // Đường dẫn gốc (http://localhost:5173/)
    path: "/",
    // element: xác định component nào sẽ render ở route này
    element: (
      <MainLayout>
        <Home />
        {/* 👆 Home sẽ được bọc bởi MainLayout 
            → nghĩa là luôn có Header, Footer, SocialBar */}
      </MainLayout>
    ),
  },
]);

// Xuất router để App.jsx có thể dùng
export default router;
