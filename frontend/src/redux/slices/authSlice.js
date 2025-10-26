// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Lấy thông tin user/token từ localStorage (nếu có)
// Điều này RẤT QUAN TRỌNG, giúp user không bị logout khi F5
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

// 1. Định nghĩa trạng thái ban đầu
const trangThaiBanDau = {
  user: user || null,
  token: token || null,
};

// 2. Tạo Slice
const authSlice = createSlice({
  name: "auth", // Tên của slice
  initialState: trangThaiBanDau,

  // 3. Định nghĩa các "reducers" (hàm cập nhật state)
  reducers: {
    /**
     * Hàm này được gọi khi user đăng nhập thành công
     * payload sẽ là { user: {...}, token: "..." }
     */
    datThongTinDangNhap: (state, action) => {
      const { user, token } = action.payload;

      // Cập nhật state của Redux
      state.user = user;
      state.token = token;

      // Lưu vào localStorage để giữ đăng nhập
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    },

    /**
     * Hàm này được gọi khi user đăng xuất
     */
    dangXuat: (state) => {
      // Xóa state của Redux
      state.user = null;
      state.token = null;

      // Xóa khỏi localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

// 4. Export các actions để component có thể gọi (ví dụ: dispatch(datThongTinDangNhap(...)))
export const { datThongTinDangNhap, dangXuat } = authSlice.actions;

// 5. Export reducer để đưa vào store
export default authSlice.reducer;
