// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";

// Import các reducers từ thư mục slices
import authReducer from "./slices/authSlice";
import gioHangReducer from "./slices/gioHangSlice"; // (Ví dụ: sau này bạn thêm giỏ hàng)
import uiReducer from "./slices/uiSlice"; // (Ví dụ: sau này bạn thêm UI state)

// 1. Cấu hình store
export const store = configureStore({
  // "reducer" là nơi tổng hợp tất cả các slice
  reducer: {
    // Tên "auth" ở đây sẽ quyết định state
    // (ví dụ: state.auth.token)
    auth: authReducer,

    // (Khi bạn có slice mới, chỉ cần thêm vào đây)
    gioHang: gioHangReducer,
    ui: uiReducer,
  },

  // (Tùy chọn) Bật Redux DevTools (rất hữu ích khi dev)
  devTools: import.meta.env.MODE !== "production",
});
