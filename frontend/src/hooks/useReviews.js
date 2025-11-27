// src/hooks/useReviews.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductReviews,
  getProductReviewStats,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  adminGetReviews,
  adminGetReviewStats,
  adminApproveReview,
  adminRejectReview,
} from "../api/reviewApi";

// ==== CUSTOMER SIDE ====

export function useProductReviews(sanPhamId, filters) {
  return useQuery({
    queryKey: ["product-reviews", sanPhamId, filters],
    queryFn: () =>
      getProductReviews(sanPhamId, {
        page: filters?.page || 1,
        per_page: filters?.per_page || 10,
        diem_danh_gia: filters?.diem_danh_gia,
        tu_ngay: filters?.tu_ngay,
        den_ngay: filters?.den_ngay,
        co_binh_luan: filters?.co_binh_luan,
      }),
    enabled: !!sanPhamId,
    keepPreviousData: true,
  });
}

export function useProductReviewStats(sanPhamId) {
  return useQuery({
    queryKey: ["product-review-stats", sanPhamId],
    queryFn: () => getProductReviewStats(sanPhamId),
    enabled: !!sanPhamId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyReviews(filters) {
  return useQuery({
    queryKey: ["my-reviews", filters],
    queryFn: () =>
      getMyReviews({
        page: filters?.page || 1,
        per_page: filters?.per_page || 10,
        diem_danh_gia: filters?.diem_danh_gia,
      }),
    keepPreviousData: true,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: (data) => {
      // Làm tươi danh sách liên quan sản phẩm + "của tôi"
      qc.invalidateQueries({ queryKey: ["product-reviews", data.san_pham_id] });
      qc.invalidateQueries({
        queryKey: ["product-review-stats", data.san_pham_id],
      });
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateReview(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["product-reviews", data.san_pham_id] });
      qc.invalidateQueries({
        queryKey: ["product-review-stats", data.san_pham_id],
      });
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: (_res, id) => {
      // Không có san_pham_id trong res.message → refresh thẳng các query chung
      qc.invalidateQueries({ queryKey: ["product-reviews"] });
      qc.invalidateQueries({ queryKey: ["product-review-stats"] });
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

// ==== ADMIN SIDE ====

export function useAdminReviews(filters) {
  return useQuery({
    queryKey: ["admin-reviews", filters],
    queryFn: () =>
      adminGetReviews({
        page: filters?.page || 1,
        per_page: filters?.per_page || 20,
        diem_danh_gia: filters?.diem_danh_gia,
        trang_thai: filters?.trang_thai,
        san_pham_id: filters?.san_pham_id,
        nguoi_dung_id: filters?.nguoi_dung_id,
        tu_ngay: filters?.tu_ngay,
        den_ngay: filters?.den_ngay,
        co_binh_luan: filters?.co_binh_luan,
      }),
    keepPreviousData: true,
  });
}

export function useAdminReviewStats() {
  return useQuery({
    queryKey: ["admin-review-stats"],
    queryFn: adminGetReviewStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminApproveReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApproveReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["admin-review-stats"] });
    },
  });
}

export function useAdminRejectReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminRejectReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["admin-review-stats"] });
    },
  });
}
