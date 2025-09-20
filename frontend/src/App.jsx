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
export default App;
