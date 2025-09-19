// src/services/mockApi.js

const productDetailsData = {
  P001: {
    id: "P001",
    name: "Canon EOS R5",
    brand: "canon",
    isActive: true,
    description:
      "Canon EOS R5 là máy ảnh mirrorless full-frame chuyên nghiệp, nổi bật với khả năng quay video 8K RAW, hệ thống lấy nét Dual Pixel CMOS AF II và cảm biến 45MP.",
    properties: {
      ISO: "100-51200",
      "Tốc Độ Màn Trập": "1/8000 giây",
      "Độ Phân Giải": "45MP",
      "Chống Rung": "Sensor-Shift 5 trục",
    },
    variants: [
      {
        style: "Body Only",
        color: "Đen",
        costPrice: 3500,
        sellingPrice: 3899,
        salePrice: null,
        quantity: 12,
        images: [],
      },
    ],
  },
  P002: {
    id: "P002",
    name: "Sony A7 IV",
    brand: "sony",
    isActive: true,
    description:
      "Sony Alpha A7 IV là sự kết hợp hoàn hảo giữa nhiếp ảnh và quay phim, với cảm biến Exmor R 33MP mới, khả năng quay 4K 60p 10-bit và hệ thống lấy nét tự động hàng đầu.",
    properties: {
      ISO: "100-51200",
      "Tốc Độ Màn Trập": "1/8000 giây",
      "Độ Phân Giải": "33MP",
      "Chống Rung": "Sensor-Shift 5 trục",
    },
    variants: [
      {
        style: "Body Only",
        color: "Đen",
        costPrice: 2200,
        sellingPrice: 2499,
        salePrice: 2450,
        quantity: 8,
        images: [],
      },
      {
        style: "Kit 28-70mm",
        color: "Đen",
        costPrice: 2400,
        sellingPrice: 2699,
        salePrice: null,
        quantity: 5,
        images: [],
      },
    ],
  },
};

export const fetchProductById = (productId) => {
  console.log(`[API Giả Lập] Đang truy xuất dữ liệu cho ID: ${productId}...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = productDetailsData[productId];
      resolve(product || null);
    }, 1000);
  });
};
