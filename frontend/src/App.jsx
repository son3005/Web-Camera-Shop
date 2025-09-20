import { RouterProvider } from "react-router-dom";

import router from "./router";

function App() {
  // RouterProvider giúp kết nối router (cấu hình các route)
  // với toàn bộ ứng dụng React
  return <RouterProvider router={router} />;
}

export default App;
