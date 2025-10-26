// src/hooks/useSanPhams.js
import { useQuery } from "@tanstack/react-query";
// Quan trọng: Import các hàm API (chúng ta sẽ tạo ở bước sau)
// Giả sử file API của bạn tên là 'sanphamApi.js'
import { laySanPhams, laySanPhamTheoId } from "../api/sanphamApi";

/**
 * Hook để lấy DANH SÁCH sản phẩm (dùng trong Inventory.jsx)
 * @param {object} params - { page, limit, search, brands, ... }
 */
export const useSanPhams = (params) => {
  return useQuery({
    // queryKey phải bao gồm params để React Query
    // tự động cache và fetch lại khi params thay đổi
    queryKey: ["sanphams", params],

    // queryFn gọi hàm API thật
    queryFn: () => laySanPhams(params),

    // Giữ data cũ khi fetch page mới, giúp UI mượt hơn
    keepPreviousData: true,
  });
};

/**
 * Hook để lấy CHI TIẾT sản phẩm (dùng trong AddProductModal [Edit] và ProductDetailModal)
 * @param {string|number} sanPhamId - ID của sản phẩm
 */
export const useSanPhamChiTiet = (sanPhamId) => {
  return useQuery({
    queryKey: ["sanpham", sanPhamId],
    queryFn: () => laySanPhamTheoId(sanPhamId),

    // Chỉ chạy query này khi `sanPhamId` có giá trị (không phải null/undefined)
    enabled: !!sanPhamId,
  });
};
