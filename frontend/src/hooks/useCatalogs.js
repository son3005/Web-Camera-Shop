// src/hooks/useCatalogs.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Import tất cả API functions từ file catalogsApi
import * as api from "../api/catalogsApi";

// =================================================================
// 1. DANH MỤC (CATEGORY) HOOKS
// =================================================================

// QueryKey chung
const DANH_MUC_QUERY_KEY = "danhMucs";

/**
 * Hook: Lấy danh sách danh mục (phân trang)
 * @param {Object} params - Query params (page, per_page)
 * @returns {import("@tanstack/react-query").UseQueryResult<import("../schemas/catalogsSchemas").DanhMucListResponse>}
 */
export const useDanhMucs = (params = {}) => {
  return useQuery({
    queryKey: [DANH_MUC_QUERY_KEY, params], // Key bao gồm cả params để cache
    queryFn: () => api.layDanhMucs(params),
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    keepPreviousData: true, // Giữ data cũ khi fetch page mới
  });
};

/**
 * Hook: Lấy chi tiết 1 danh mục
 * @param {number} id - ID danh mục
 * @returns {import("@tanstack/react-query").UseQueryResult<import("../schemas/catalogsSchemas").DanhMucResponse>}
 */
export const useDanhMucChiTiet = (id) => {
  return useQuery({
    queryKey: [DANH_MUC_QUERY_KEY, id], // Key: ['danhMucs', 123]
    queryFn: () => api.layDanhMucChiTiet(id),
    enabled: !!id, // Chỉ fetch khi có id
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
};

/**
 * Hook: Tạo danh mục mới
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export const useTaoDanhMuc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.taoDanhMuc, // api.taoDanhMuc(danhMucData)
    onSuccess: (data) => {
      toast.success(`Tạo danh mục "${data.ten_danh_muc}" thành công!`);
      // Invalidate (làm mới) cache của danh sách danh mục
      queryClient.invalidateQueries([DANH_MUC_QUERY_KEY]);
    },
    onError: (error) => {
      toast.error(
        `Lỗi khi tạo danh mục: ${error.response?.data?.error || error.message}`
      );
    },
  });
};

/**
 * Hook: Cập nhật danh mục
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export const useCapNhatDanhMuc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.capNhatDanhMuc, // api.capNhatDanhMuc({ id, danhMucData })
    onSuccess: (data) => {
      toast.success(`Cập nhật danh mục "${data.ten_danh_muc}" thành công!`);
      // Invalidate cache của danh sách VÀ cache của chi tiết
      queryClient.invalidateQueries([DANH_MUC_QUERY_KEY]);
      queryClient.invalidateQueries([DANH_MUC_QUERY_KEY, data.id]);
    },
    onError: (error) => {
      toast.error(
        `Lỗi khi cập nhật: ${error.response?.data?.error || error.message}`
      );
    },
  });
};

/**
 * Hook: Xóa danh mục
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export const useXoaDanhMuc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.xoaDanhMuc, // api.xoaDanhMuc(id)
    onSuccess: () => {
      toast.success("Xóa danh mục thành công!");
      // Invalidate cache của danh sách
      queryClient.invalidateQueries([DANH_MUC_QUERY_KEY]);
    },
    onError: (error) => {
      toast.error(
        `Lỗi khi xóa: ${error.response?.data?.error || error.message}`
      );
    },
  });
};

// =================================================================
// 2. THƯƠNG HIỆU (BRAND) HOOKS
// =================================================================

// QueryKey chung
const THUONG_HIEU_QUERY_KEY = "thuongHieus";

/**
 * Hook: Lấy danh sách thương hiệu (phân trang)
 * @param {Object} params - Query params (page, per_page)
 * @returns {import("@tanstack/react-query").UseQueryResult<import("../schemas/catalogsSchemas").ThuongHieuListResponse>}
 */
export const useThuongHieus = (params = {}) => {
  return useQuery({
    queryKey: [THUONG_HIEU_QUERY_KEY, params],
    queryFn: () => api.layThuongHieus(params),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

/**
 * Hook: Lấy chi tiết 1 thương hiệu
 * @param {number} id - ID thương hiệu
 * @returns {import("@tanstack/react-query").UseQueryResult<import("../schemas/catalogsSchemas").ThuongHieuResponse>}
 */
export const useThuongHieuChiTiet = (id) => {
  return useQuery({
    queryKey: [THUONG_HIEU_QUERY_KEY, id], // Key: ['thuongHieus', 123]
    queryFn: () => api.layThuongHieuChiTiet(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook: Tạo thương hiệu mới
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export const useTaoThuongHieu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.taoThuongHieu,
    onSuccess: (data) => {
      toast.success(`Tạo thương hiệu "${data.ten_thuong_hieu}" thành công!`);
      queryClient.invalidateQueries([THUONG_HIEU_QUERY_KEY]);
    },
    onError: (error) => {
      toast.error(
        `Lỗi khi tạo: ${error.response?.data?.error || error.message}`
      );
    },
  });
};

/**
 * Hook: Cập nhật thương hiệu
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export const useCapNhatThuongHieu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.capNhatThuongHieu,
    onSuccess: (data) => {
      toast.success(`Cập nhật "${data.ten_thuong_hieu}" thành công!`);
      queryClient.invalidateQueries([THUONG_HIEU_QUERY_KEY]);
      queryClient.invalidateQueries([THUONG_HIEU_QUERY_KEY, data.id]);
    },
    onError: (error) => {
      toast.error(
        `Lỗi khi cập nhật: ${error.response?.data?.error || error.message}`
      );
    },
  });
};

/**
 * Hook: Xóa thương hiệu
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export const useXoaThuongHieu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.xoaThuongHieu,
    onSuccess: () => {
      toast.success("Xóa thương hiệu thành công!");
      queryClient.invalidateQueries([THUONG_HIEU_QUERY_KEY]);
    },
    onError: (error) => {
      toast.error(
        `Lỗi khi xóa: ${error.response?.data?.error || error.message}`
      );
    },
  });
};
