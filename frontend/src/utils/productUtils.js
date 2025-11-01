// src/utils/productUtils.js

/**
 * Tính toán tổng số lượng tồn kho từ các biến thể.
 * @param {import("../schemas/sanPhamSchemas").BienTheSanPhamResponse[]} cac_bien_the
 * @returns {number} Tổng tồn kho
 */
export const tinhTongTonKho = (cac_bien_the) => {
  if (!cac_bien_the || cac_bien_the.length === 0) {
    return 0;
  }
  return cac_bien_the.reduce((tong, bienThe) => tong + bienThe.so_luong_ton, 0);
};

/**
 * Tính toán khoảng giá (min-max) từ các biến thể.
 * @param {import("../schemas/sanPhamSchemas").BienTheSanPhamResponse[]} cac_bien_the
 * @returns {{min: number, max: number}}
 */
export const tinhKhoangGia = (cac_bien_the) => {
  if (!cac_bien_the || cac_bien_the.length === 0) {
    return { min: 0, max: 0 };
  }

  // Lấy tất cả các mức giá (ưu tiên giá khuyến mãi)
  const allPrices = cac_bien_the.map((bienThe) => {
    // Chuyển đổi giá trị string từ JSON sang number
    const giaKhuyenMai = parseFloat(bienThe.gia_khuyen_mai);
    const giaBan = parseFloat(bienThe.gia_ban);

    // Kiểm tra xem giá KM có hợp lệ không (lớn hơn 0)
    if (giaKhuyenMai > 0) {
      return giaKhuyenMai;
    }
    return giaBan;
  });

  return {
    min: Math.min(...allPrices),
    max: Math.max(...allPrices),
  };
};

/**
 * Hàm định dạng tiền tệ (ví dụ)
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
