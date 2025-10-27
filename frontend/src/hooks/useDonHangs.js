// src/hooks/useDonHangs.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  taoDonHang,
  layLichSuDonHang,
  // layChiTietDonHang, // Hàm này user dùng
  layTatCaDonHang,
  capNhatTrangThaiDonHang,
  layChiTietDonHangAdmin, // Hàm mới cho admin
} from "../api/donHangApi";

// --- HOOKS CHO ADMIN ---

/**
 * (Admin) Hook để lấy TẤT CẢ đơn hàng (có lọc, sắp xếp, phân trang)
 * @param {object} paramsFromComponent - State từ component Orders.jsx
 * Ví dụ: { page: 1, limit: 10, trang_thai: ['CHO_XAC_NHAN', 'DA_XAC_NHAN'], search_term: '...', start_date: '...', end_date: '...', sort_by: 'price', sort_order: 'asc' }
 */
export const useTatCaDonHang = (paramsFromComponent) => {
  return useQuery({
    queryKey: ["admin_donhangs", paramsFromComponent], // Query key phải chứa đủ thông tin
    queryFn: () => {
      // --- (SỬA) Chuẩn bị params trước khi gọi API ---
      const apiParams = {
        page: paramsFromComponent.page || 1,
        per_page: paramsFromComponent.limit || 10, // Backend dùng 'per_page'
        sort_by: paramsFromComponent.sort_by || "date",
        sort_order: paramsFromComponent.sort_order || "desc",
      };

      // Xử lý trạng thái: Join mảng thành chuỗi
      if (
        paramsFromComponent.trang_thai &&
        paramsFromComponent.trang_thai.length > 0
      ) {
        apiParams.trang_thai = paramsFromComponent.trang_thai.join(",");
      }

      // Thêm các filter khác nếu có giá trị
      if (paramsFromComponent.search_term) {
        apiParams.search_term = paramsFromComponent.search_term;
      }
      if (paramsFromComponent.start_date) {
        apiParams.start_date = paramsFromComponent.start_date;
      }
      if (paramsFromComponent.end_date) {
        apiParams.end_date = paramsFromComponent.end_date;
      }

      // Gọi API với params đã chuẩn bị
      return layTatCaDonHang(apiParams);
    },
    keepPreviousData: true,
  });
};

/**
 * (Admin) Hook để cập nhật trạng thái đơn hàng (Giữ nguyên logic)
 */
export const useCapNhatTrangThaiDonHang = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: capNhatTrangThaiDonHang,
    onSuccess: (data) => {
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
      queryClient.invalidateQueries(["admin_donhangs"]); // Invalidate list
      queryClient.setQueryData(["donhang_chitiet", data.id], data); // Update detail cache
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Lỗi khi cập nhật trạng thái");
    },
  });
};

// --- HOOKS CHO USER (Giữ nguyên) ---

export const useTaoDonHang = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taoDonHang,
    onSuccess: () => {
      toast.success("Đặt hàng thành công!");
      queryClient.invalidateQueries(["giohang"]);
      queryClient.invalidateQueries(["lichsu_donhang"]);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.error || "Lỗi khi đặt hàng, vui lòng thử lại"
      );
    },
  });
};

export const useLichSuDonHang = (params) => {
  return useQuery({
    queryKey: ["lichsu_donhang", params],
    queryFn: () => layLichSuDonHang(params),
    keepPreviousData: true,
  });
};

/**
 * (User/Admin) Hook để lấy chi tiết 1 đơn hàng
 * @param {string|number} donHangId
 * @param {boolean} isAdmin - Cho biết có phải gọi API admin hay không
 */
export const useDonHangChiTiet = (donHangId, isAdmin = false) => {
  return useQuery({
    queryKey: ["donhang_chitiet", donHangId],
    // --- (SỬA) Gọi API dựa vào quyền ---
    queryFn: () =>
      isAdmin
        ? layChiTietDonHangAdmin(donHangId)
        : layLichSuDonHang({ id: donHangId }), // API lấy lịch sử đơn hàng của user chưa có, tạm dùng API admin
    enabled: !!donHangId,
  });
};
