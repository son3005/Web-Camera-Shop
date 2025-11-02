// validation/shared.js
// File này chứa các enum, type, và giá trị chung dùng cho toàn bộ schema

// Trạng thái sản phẩm
export const TrangThaiSanPhamEnum = {
  DANG_BAN: "DANG_BAN",
  NGUNG_BAN: "NGUNG_BAN",
  HET_HANG: "HET_HANG",
};

// Trạng thái kích hoạt biến thể
export const TrangThaiKichHoatBienTheEnum = {
  DANG_BAN: "DANG_BAN",
  NGUNG_BAN: "NGUNG_BAN",
};

// Loại khuyến mãi (nếu có)
export const LoaiKhuyenMaiEnum = {
  PHAN_TRAM: "PHAN_TRAM",
  TIEN_MAT: "TIEN_MAT",
};

// Đơn vị tiền tệ
export const DonViTienTe = "VND";

// Các pattern thường dùng
export const Patterns = {
  MA_SAN_PHAM: /^[A-Z0-9]{6,24}$/, // Ví dụ: SP001, ABC123XYZ
  MA_DANH_MUC: /^[A-Z]{2,5}$/, // Ví dụ: DT, LT, PK
  MA_THUONG_HIEU: /^[A-Z]{2,5}$/, // Ví dụ: APP, SAM, SON
};

// Hàm validate custom (có thể dùng trong Yup)
export const validateMaSanPham = (value) => Patterns.MA_SAN_PHAM.test(value);
export const validateMaDanhMuc = (value) => Patterns.MA_DANH_MUC.test(value);
export const validateMaThuongHieu = (value) =>
  Patterns.MA_THUONG_HIEU.test(value);
