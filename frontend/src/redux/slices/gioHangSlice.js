// src/redux/slices/gioHangSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // [{productId, name, image, price, color, quantity}]
  tongSoLuong: 0,
  tongTien: 0,
};

function recalc(state) {
  state.tongSoLuong = state.items.reduce((s, i) => s + i.quantity, 0);
  state.tongTien = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
}

const gioHangSlice = createSlice({
  name: "gioHang",
  initialState,
  reducers: {
    themVaoGio: (state, action) => {
      const {
        productId,
        name,
        image,
        price,
        color,
        quantity = 1,
      } = action.payload;
      const existed = state.items.find(
        (x) => x.productId === productId && x.color === color
      );
      if (existed) existed.quantity += quantity;
      else state.items.push({ productId, name, image, price, color, quantity });
      recalc(state);
    },
    capNhatSoLuong: (state, action) => {
      const { productId, color, quantity } = action.payload;
      const item = state.items.find(
        (x) => x.productId === productId && x.color === color
      );
      if (item) item.quantity = Math.max(1, Number(quantity || 1));
      recalc(state);
    },
    xoaKhoiGio: (state, action) => {
      const { productId, color } = action.payload;
      state.items = state.items.filter(
        (x) => !(x.productId === productId && x.color === color)
      );
      recalc(state);
    },
    xoaTatCa: (state) => {
      state.items = [];
      recalc(state);
    },
  },
});

export const { themVaoGio, capNhatSoLuong, xoaKhoiGio, xoaTatCa } =
  gioHangSlice.actions;
export default gioHangSlice.reducer;
