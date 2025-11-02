/**
 * Định dạng số thành tiền tệ VND
 * @param {number} value - Số tiền
 * @returns {string} - Chuỗi đã định dạng (ví dụ: 1.000.000 ₫)
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return "";
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });
  return formatter.format(value);
};

/**
 * Định dạng trạng thái sản phẩm
 * @param {string} status - Trạng thái từ API (ví dụ: 'dang_ban')
 * @returns {object} - { text, className }
 */
export const formatStatus = (status) => {
  switch (status) {
    case "dang_ban":
      return {
        text: "Đang bán",
        className: "bg-green-100 text-green-800",
      };
    case "ngung_ban":
      return {
        text: "Ngừng bán",
        className: "bg-red-100 text-red-800",
      };
    case "hang_dat_truoc":
      return {
        text: "Đặt trước",
        className: "bg-blue-100 text-blue-800",
      };
    case "sap_mo_ban":
      return {
        text: "Sắp mở bán",
        className: "bg-yellow-100 text-yellow-800",
      };
    default:
      return {
        text: "Không xác định",
        className: "bg-gray-100 text-gray-800",
      };
  }
};
