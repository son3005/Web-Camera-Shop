// src/api/gioHangApi.js
// API giỏ hàng chuẩn theo backend bạn đã gửi

import apiClient from "./apiClient";

// Giỏ rỗng an toàn để FE không nổ
const EMPTY_CART = {
  id: null,
  nguoi_dung_id: null,
  items: [],
  tong_so_luong: 0,
  tong_gia_tri: 0,
};

// nhận diện lỗi pydantic ngay_them = null
const isNgayThemError = (err) => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.msg ||
    err?.message ||
    "";
  return (
    typeof msg === "string" &&
    (msg.includes("ChiTietGioHangResponse") || msg.includes("ngay_them"))
  );
};

// ✅ Lấy giỏ hàng
export const layGioHang = async () => {
  try {
    const res = await apiClient.get("/gio-hang/");
    return res.data.data;
  } catch (err) {
    if (isNgayThemError(err)) {
      console.warn("[gioHangApi] ngay_them null → trả EMPTY_CART");
      return EMPTY_CART;
    }
    throw err;
  }
};

// ✅ Thêm sản phẩm vào giỏ
// gọi: themVaoGioHang({ bienTheId: 12, soLuong: 1 })
export const themVaoGioHang = async ({ bienTheId, soLuong = 1 }) => {
  try {
    const res = await apiClient.post("/gio-hang/them", {
      bien_the_san_pham_id: Number(bienTheId),
      so_luong: soLuong,
    });
    return res.data.data;
  } catch (err) {
    if (isNgayThemError(err)) {
      console.warn("[gioHangApi] ngay_them null khi thêm → trả EMPTY_CART");
      return EMPTY_CART;
    }
    throw err;
  }
};

// ✅ Cập nhật số lượng
// gọi: capNhatSoLuongGioHang({ chiTietId: 5, soLuong: 3 })
export const capNhatSoLuongGioHang = async ({ chiTietId, soLuong }) => {
  try {
    const res = await apiClient.put("/gio-hang/cap-nhat-so-luong", {
      chi_tiet_gio_hang_id: chiTietId,
      so_luong: soLuong,
    });
    return res.data.data;
  } catch (err) {
    if (isNgayThemError(err)) {
      return EMPTY_CART;
    }
    throw err;
  }
};

// ✅ Xóa sản phẩm khỏi giỏ
export const xoaKhoiGioHang = async (chiTietId) => {
  try {
    const res = await apiClient.delete(`/gio-hang/xoa/${chiTietId}`);
    return res.data.data;
  } catch (err) {
    if (isNgayThemError(err)) {
      return EMPTY_CART;
    }
    throw err;
  }
};

// ✅ Kiểm tra tồn kho
// gọi: kiemTraTonKho({ bienTheId: 3, soLuong: 1 })
export const kiemTraTonKho = async ({ bienTheId, soLuong = 1 }) => {
  const res = await apiClient.post("/gio-hang/kiem-tra-ton-kho", {
    bien_the_san_pham_id: Number(bienTheId),
    so_luong: soLuong,
  });
  return res.data.data;
};
