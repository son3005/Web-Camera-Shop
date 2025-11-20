// src/redux/slices/authSlice.js
// --------------------------------------------------
// Slice quản lý trạng thái đăng nhập (user + token)
// ĐÃ CHỈNH: đồng bộ 3 key token trong localStorage để
// tránh trường hợp axios khác vẫn còn token cũ.
// --------------------------------------------------

import { createSlice } from "@reduxjs/toolkit";

// Đọc lại user/token từ localStorage để không bị logout khi F5
const savedUser = localStorage.getItem("user");

// ✅ đọc token theo thứ tự ưu tiên
const savedToken =
  localStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("admin_token");

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Gọi khi đăng nhập thành công
     * payload mong đợi: { user: {...}, token: "..." }
     */
    datThongTinDangNhap: (state, action) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;

      // lưu lại để F5 vẫn còn
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ ghi đồng bộ 3 key để mấy chỗ cũ dùng key khác vẫn lấy được token mới
      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
      localStorage.setItem("admin_token", token);
    },

    /**
     * Gọi khi đăng xuất
     * Xóa sạch thông tin đăng nhập + các token cũ
     */
    dangXuat: (state) => {
      state.user = null;
      state.token = null;

      localStorage.removeItem("user");

      // xóa sạch mọi khả năng còn sót token
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("admin_token");
    },
  },
});

export const { datThongTinDangNhap, dangXuat } = authSlice.actions;
export default authSlice.reducer;
