// src/redux/slices/authSlice.js
// Slice quản lý trạng thái đăng nhập (user + token)
// Mình chỉ lưu và xóa đúng 2 thứ: user, token
// KHÔNG xóa các key dạng cart_user_<id> để giỏ hàng còn đó cho lần login sau.

import { createSlice } from "@reduxjs/toolkit";

// Lấy thông tin user/token từ localStorage (nếu có)
// → giúp user không bị logout khi F5
const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("token");

const initialState = {
  // Nếu đã từng lưu thì parse ra, không thì để null
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

      // cập nhật redux
      state.user = user;
      state.token = token;

      // lưu vào localStorage để F5 không mất
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    },

    /**
     * Gọi khi đăng xuất
     * Ở đây chỉ xóa thông tin đăng nhập
     * KHÔNG đụng vào các key giỏ hàng theo user (cart_user_<id>)
     */
    dangXuat: (state) => {
      state.user = null;
      state.token = null;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { datThongTinDangNhap, dangXuat } = authSlice.actions;
export default authSlice.reducer;
