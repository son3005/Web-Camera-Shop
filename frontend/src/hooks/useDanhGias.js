// src/hooks/useDanhGias.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
// Import các hàm API
import {
  layDanhGias,
  taoDanhGia,
  capNhatTrangThaiDanhGia,
} from "../api/danhGiaApi";

/**
 * Hook để LẤY danh sách đánh giá của 1 sản phẩm
 * @param {string|number} sanPhamId - ID sản phẩm
 * @param {object} params - { page, per_page }
 */
export const useDanhGias = (sanPhamId, params) => {
  return useQuery({
    queryKey: ["danhgias", sanPhamId, params],
    queryFn: () => layDanhGias({ sanPhamId, params }),
    enabled: !!sanPhamId, // Chỉ chạy khi có sanPhamId
  });
};

/**
 * Hook để TẠO một đánh giá mới
 * @param {string|number} sanPhamId - ID sản phẩm (để invalidate cache)
 */
export const useTaoDanhGia = (sanPhamId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taoDanhGia, // Hàm API (nhận reviewData)
    onSuccess: () => {
      toast.success("Gửi đánh giá thành công!");
      // Fetch lại danh sách đánh giá cho sản phẩm này
      queryClient.invalidateQueries(["danhgias", sanPhamId]);
      // Cập nhật lại data chi tiết sản phẩm (để tính lại avg_rating)
      queryClient.invalidateQueries(["sanpham", sanPhamId]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Lỗi khi gửi đánh giá");
    },
  });
};

/**
 * Hook (ADMIN) để CẬP NHẬT trạng thái đánh giá (duyệt/từ chối)
 */
export const useCapNhatTrangThaiDanhGia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: capNhatTrangThaiDanhGia, // Hàm API (nhận { reviewId, statusData })
    onSuccess: (data) => {
      toast.success(
        `Đã ${data.trang_thai === "DA_DUYET" ? "duyệt" : "từ chối"} đánh giá!`
      );
      // Fetch lại tất cả các query 'danhgias' (vì có thể ảnh hưởng nhiều nơi)
      queryClient.invalidateQueries(["danhgias"]);
      // Cập nhật lại sản phẩm liên quan
      if (data.san_pham_id) {
        queryClient.invalidateQueries(["sanpham", data.san_pham_id]);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Lỗi khi cập nhật");
    },
  });
};
