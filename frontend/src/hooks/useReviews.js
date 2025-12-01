// src/hooks/useReviews.js
// Hook dùng chung cho đánh giá sản phẩm (customer + admin)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  layDanhGiaSanPham,
  layThongKeDanhGiaSanPham,
  layDanhGiaCuaToi,
  taoDanhGia,
  capNhatDanhGia,
  xoaDanhGia,
  adminLayDanhGia,
  adminThongKeDanhGia,
  adminMoKhoaDanhGia,
  adminKhoaDanhGia,
} from "../api/reviewApi";

// ===================== CUSTOMER SIDE =====================

// Danh sách đánh giá của 1 sản phẩm (public)
export function useProductReviews(sanPhamId, filters = {}) {
  return useQuery({
    queryKey: ["product-reviews", sanPhamId, filters],
    queryFn: () =>
      layDanhGiaSanPham(sanPhamId, {
        page: filters.page || 1,
        per_page: filters.per_page || 10,
        diem_danh_gia: filters.diem_danh_gia,
        tu_ngay: filters.tu_ngay,
        den_ngay: filters.den_ngay,
        co_binh_luan: filters.co_binh_luan,
      }),
    enabled: !!sanPhamId,
    keepPreviousData: true,
  });
}

// Thống kê đánh giá 1 sản phẩm
export function useProductReviewStats(sanPhamId) {
  return useQuery({
    queryKey: ["product-review-stats", sanPhamId],
    queryFn: () => layThongKeDanhGiaSanPham(sanPhamId),
    enabled: !!sanPhamId,
    staleTime: 5 * 60 * 1000,
  });
}

// Danh sách đánh giá "của tôi"
export function useMyReviews(filters = {}) {
  return useQuery({
    queryKey: ["my-reviews", filters],
    queryFn: () =>
      layDanhGiaCuaToi({
        page: filters.page || 1,
        per_page: filters.per_page || 10,
        diem_danh_gia: filters.diem_danh_gia,
        tu_ngay: filters.tu_ngay,
        den_ngay: filters.den_ngay,
        co_binh_luan: filters.co_binh_luan,
      }),
    keepPreviousData: true,
  });
}

// Tạo đánh giá mới
export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: taoDanhGia,
    onSuccess: (data) => {
      const sanPhamId = data?.san_pham_id;
      if (sanPhamId) {
        qc.invalidateQueries({
          queryKey: ["product-reviews", sanPhamId],
        });
        qc.invalidateQueries({
          queryKey: ["product-review-stats", sanPhamId],
        });
      } else {
        qc.invalidateQueries({ queryKey: ["product-reviews"] });
        qc.invalidateQueries({ queryKey: ["product-review-stats"] });
      }
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

// Cập nhật đánh giá của chính user
export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    // ✅ Nhận { id, payload } đúng với chỗ bạn gọi trong MyReviewsSection
    mutationFn: ({ id, payload }) => capNhatDanhGia(id, payload),
    onSuccess: (data) => {
      const sanPhamId = data?.san_pham_id;
      if (sanPhamId) {
        qc.invalidateQueries({
          queryKey: ["product-reviews", sanPhamId],
        });
        qc.invalidateQueries({
          queryKey: ["product-review-stats", sanPhamId],
        });
      } else {
        qc.invalidateQueries({ queryKey: ["product-reviews"] });
        qc.invalidateQueries({ queryKey: ["product-review-stats"] });
      }
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

// Xoá đánh giá
export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: xoaDanhGia, // mutationFn(id) → xoaDanhGia(id)
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-reviews"] });
      qc.invalidateQueries({ queryKey: ["product-review-stats"] });
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

// ===================== ADMIN SIDE =====================

export function useAdminReviews(filters = {}) {
  return useQuery({
    queryKey: ["admin-reviews", filters],
    queryFn: () =>
      adminLayDanhGia({
        page: filters.page || 1,
        per_page: filters.per_page || 20,
        diem_danh_gia: filters.diem_danh_gia,
        trang_thai: filters.trang_thai,
        san_pham_id: filters.san_pham_id,
        nguoi_dung_id: filters.nguoi_dung_id,
        tu_ngay: filters.tu_ngay,
        den_ngay: filters.den_ngay,
        co_binh_luan: filters.co_binh_luan,
      }),
    keepPreviousData: true,
  });
}

export function useAdminReviewStats() {
  return useQuery({
    queryKey: ["admin-review-stats"],
    queryFn: adminThongKeDanhGia,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminApproveReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminMoKhoaDanhGia,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["admin-review-stats"] });
    },
  });
}

export function useAdminRejectReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminKhoaDanhGia,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["admin-review-stats"] });
    },
  });
}
