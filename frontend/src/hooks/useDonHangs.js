// src/hooks/useDonHangs.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  taoDonHang,
  layLichSuDonHang,
  // layChiTietDonHangUser, // Tạm thời dùng API admin cho cả user detail
  layTatCaDonHang,
  capNhatTrangThaiDonHang,
  layChiTietDonHangAdmin,
  layThongKeTrangThai, // Thêm hàm mới
} from "../api/donHangApi";

// --- HOOKS CHO ADMIN ---

export const useTatCaDonHang = (paramsFromComponent) => {
  return useQuery({
    queryKey: ["admin_donhangs", paramsFromComponent],
    queryFn: () => {
      const apiParams = {
        page: paramsFromComponent.page || 1,
        per_page: paramsFromComponent.limit || 10,
        sort_by: paramsFromComponent.sort_by || "date",
        sort_order: paramsFromComponent.sort_order || "desc",
      };
      if (
        paramsFromComponent.trang_thai &&
        paramsFromComponent.trang_thai.length > 0
      ) {
        // API backend mong đợi enum string dạng 'cho_xac_nhan', không phải uppercase
        apiParams.trang_thai = paramsFromComponent.trang_thai.join(",");
      }
      if (paramsFromComponent.search_term) {
        apiParams.search_term = paramsFromComponent.search_term;
      }
      if (paramsFromComponent.start_date) {
        apiParams.start_date = paramsFromComponent.start_date;
      }
      if (paramsFromComponent.end_date) {
        apiParams.end_date = paramsFromComponent.end_date;
      }
      return layTatCaDonHang(apiParams);
    },
    keepPreviousData: true,
  });
};

export const useCapNhatTrangThaiDonHang = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: capNhatTrangThaiDonHang,
    onSuccess: (data) => {
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin_donhangs"] }); // Invalidate list hiệu quả hơn
      queryClient.invalidateQueries({ queryKey: ["admin_donhang_summary"] }); // Invalidate cả summary
      queryClient.setQueryData(["donhang_chitiet", data.id], data);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Lỗi khi cập nhật trạng thái");
    },
  });
};

// --- (HOOK MỚI CHO STATUS GRID) ---
/**
 * (Admin) Hook để lấy dữ liệu thống kê cho StatusGrid
 */
export const useThongKeTrangThaiDonHang = () => {
  return useQuery({
    queryKey: ["admin_donhang_summary"], // Key riêng cho query này
    queryFn: layThongKeTrangThai,
    // Có thể thêm staleTime để cache dữ liệu summary lâu hơn một chút
    // staleTime: 5 * 60 * 1000, // 5 phút
  });
};
// --- (HẾT HOOK MỚI) ---

// --- HOOKS CHO USER (Giữ nguyên) ---

export const useTaoDonHang = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taoDonHang,
    onSuccess: () => {
      toast.success("Đặt hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["giohang"] });
      queryClient.invalidateQueries({ queryKey: ["lichsu_donhang"] });
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
 */
export const useDonHangChiTiet = (donHangId, isAdmin = false) => {
  return useQuery({
    queryKey: ["donhang_chitiet", donHangId],
    // --- (SỬA) Gọi API dựa vào quyền ---
    // Hiện tại API lấy chi tiết đơn hàng user chưa có, tạm dùng API admin cho cả hai
    queryFn: () =>
      isAdmin
        ? layChiTietDonHangAdmin(donHangId)
        : layChiTietDonHangAdmin(donHangId), // Thay layLichSuDonHang bằng API chi tiết user khi có
    enabled: !!donHangId,
  });
};
