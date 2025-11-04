// src/redux/slices/gioHangSlice.js
// Quản lý giỏ hàng GẮN THEO USER.
//
// Quy ước lưu trữ:
// - Mỗi user sẽ có 1 key riêng trong localStorage: cart_user_<userId>
//   ví dụ user id = 5 → "cart_user_5"
// - Bên authSlice ta chỉ xóa user/token khi logout, KHÔNG xóa các key cart_user_*
//   → nên khi login lại user đó, ta đọc lại được giỏ cũ.
//
// Flow hoạt động:
// 1. App vừa load (F5):
//    - giỏ hàng slice sẽ thử đọc localStorage.user để biết đang là user nào
//    - nếu có user.id → đọc luôn giỏ của user đó → hiện đúng giỏ
// 2. Người dùng thêm/xóa/sửa giỏ khi đang đăng nhập:
//    - cập nhật redux
//    - đồng thời ghi xuống localStorage vào key cart_user_<id>
// 3. Người dùng logout:
//    - authSlice xóa user/token
//    - gioHangSlice nhận action dangXuat → xóa giỏ trên redux (đúng yêu cầu “đăng xuất thì mất giỏ”)
//    - nhưng KHÔNG xóa cart_user_<id> trong localStorage
// 4. Người dùng login lại đúng user đó:
//    - gioHangSlice nhận action datThongTinDangNhap → biết user.id
//    - đọc cart_user_<id> → nạp lại giỏ

import { createSlice } from "@reduxjs/toolkit";
import { datThongTinDangNhap, dangXuat } from "./authSlice";

// =========================
// 1. Helpers
// =========================

// Tạo tên key để lưu giỏ cho từng user
const buildCartKey = (userId) => `cart_user_${userId}`;

// Đọc 1 giỏ từ localStorage
function loadCartFromLocalStorage(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      tongSoLuong: Number(parsed.tongSoLuong || 0),
      tongTien: Number(parsed.tongTien || 0),
    };
  } catch (err) {
    console.warn("Không đọc được giỏ hàng từ localStorage:", err);
    return null;
  }
}

// Ghi 1 giỏ xuống localStorage
function saveCartToLocalStorage(storageKey, state) {
  try {
    const data = {
      items: state.items,
      tongSoLuong: state.tongSoLuong,
      tongTien: state.tongTien,
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (err) {
    console.warn("Không lưu được giỏ hàng xuống localStorage:", err);
  }
}

// Tính lại tổng số lượng và tổng tiền
function recalc(state) {
  state.tongSoLuong = state.items.reduce(
    (sum, it) => sum + Number(it.quantity || 0),
    0
  );
  state.tongTien = state.items.reduce(
    (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
    0
  );
}

// Khi app vừa khởi tạo, ta thử xem có user trong localStorage không
// nếu có thì nạp giỏ tương ứng luôn
function createInitialState() {
  // authSlice đang lưu "user" và "token" → ta đọc lại "user"
  const rawUser = localStorage.getItem("user");
  if (!rawUser) {
    // chưa đăng nhập
    return {
      items: [],
      tongSoLuong: 0,
      tongTien: 0,
      currentUserKey: null,
    };
  }

  try {
    const user = JSON.parse(rawUser);
    const userId = user?.id;
    if (!userId) {
      // user không có id → coi như khách
      return {
        items: [],
        tongSoLuong: 0,
        tongTien: 0,
        currentUserKey: null,
      };
    }

    // Có userId → thử nạp giỏ của user này
    const cartKey = buildCartKey(userId);
    const cart = loadCartFromLocalStorage(cartKey);

    if (cart) {
      return {
        items: cart.items,
        tongSoLuong: cart.tongSoLuong,
        tongTien: cart.tongTien,
        currentUserKey: cartKey,
      };
    }

    // Không có giỏ đã lưu → khởi tạo giỏ trống nhưng vẫn nhớ đang là user đó
    return {
      items: [],
      tongSoLuong: 0,
      tongTien: 0,
      currentUserKey: cartKey,
    };
  } catch (err) {
    console.warn("Không parse được user từ localStorage:", err);
    return {
      items: [],
      tongSoLuong: 0,
      tongTien: 0,
      currentUserKey: null,
    };
  }
}

// =========================
// 2. Slice
// =========================
const gioHangSlice = createSlice({
  name: "gioHang",
  initialState: createInitialState(),
  reducers: {
    // Thêm 1 sản phẩm vào giỏ
    themVaoGio: (state, action) => {
      const {
        productId,
        name,
        image,
        price,
        color,
        quantity = 1,
      } = action.payload;

      // tìm xem sản phẩm này (cùng màu) đã có chưa
      const existed = state.items.find(
        (x) => x.productId === productId && x.color === color
      );

      if (existed) {
        existed.quantity += quantity;
      } else {
        state.items.push({
          productId,
          name,
          image,
          price,
          color,
          quantity,
        });
      }

      // tính lại tổng
      recalc(state);

      // nếu đang gắn với 1 user cụ thể → lưu lại giỏ của user đó
      if (state.currentUserKey) {
        saveCartToLocalStorage(state.currentUserKey, state);
      }
    },

    // Cập nhật số lượng
    capNhatSoLuong: (state, action) => {
      const { productId, color, quantity } = action.payload;
      const item = state.items.find(
        (x) => x.productId === productId && x.color === color
      );
      if (item) {
        item.quantity = Math.max(1, Number(quantity || 1));
      }

      recalc(state);

      if (state.currentUserKey) {
        saveCartToLocalStorage(state.currentUserKey, state);
      }
    },

    // Xóa 1 item khỏi giỏ
    xoaKhoiGio: (state, action) => {
      const { productId, color } = action.payload;
      state.items = state.items.filter(
        (x) => !(x.productId === productId && x.color === color)
      );

      recalc(state);

      if (state.currentUserKey) {
        saveCartToLocalStorage(state.currentUserKey, state);
      }
    },

    // Xóa hết giỏ
    xoaTatCa: (state) => {
      state.items = [];
      recalc(state);

      if (state.currentUserKey) {
        saveCartToLocalStorage(state.currentUserKey, state);
      }
    },
  },

  // Lắng nghe action từ authSlice
  extraReducers: (builder) => {
    // ===== Khi ĐĂNG NHẬP thành công =====
    builder.addCase(datThongTinDangNhap, (state, action) => {
      const { user } = action.payload || {};
      const userId = user?.id;

      if (!userId) {
        // không có id thì coi như khách
        state.currentUserKey = null;
        state.items = [];
        recalc(state);
        return;
      }

      const key = buildCartKey(userId);
      state.currentUserKey = key;

      // thử đọc giỏ đã lưu của user này
      const cart = loadCartFromLocalStorage(key);
      if (cart) {
        state.items = cart.items;
        state.tongSoLuong = cart.tongSoLuong;
        state.tongTien = cart.tongTien;
      } else {
        // chưa có giỏ → để trống
        state.items = [];
        recalc(state);
      }
    });

    // ===== Khi ĐĂNG XUẤT =====
    builder.addCase(dangXuat, (state) => {
      // yêu cầu: logout thì trên UI giỏ phải trống
      state.items = [];
      state.tongSoLuong = 0;
      state.tongTien = 0;
      state.currentUserKey = null;
      // KHÔNG xóa cart_user_<id> trong localStorage
      // để lần sau login lại user đó vẫn lấy được giỏ cũ
    });
  },
});

// Export actions để UI dùng
export const { themVaoGio, capNhatSoLuong, xoaKhoiGio, xoaTatCa } =
  gioHangSlice.actions;

// Export reducer
export default gioHangSlice.reducer;
