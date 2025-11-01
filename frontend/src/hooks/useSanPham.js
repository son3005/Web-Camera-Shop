// src/hooks/useSanPham.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";

// Import API và schemas
import {
  laySanPhams,
  laySanPhamTheoId,
  taoSanPham,
  capNhatSanPham,
  xoaSanPham,
  taoBienThe,
  capNhatBienThe,
  xoaBienThe,
} from "../api/sanPhamApi";
import { apiPrivate } from "../lib/axios"; // Đã cấu hình interceptor với JWT

// Hook: Lấy danh sách sản phẩm với phân trang và bộ lọc
/**
 * Fetch danh sách sản phẩm với bộ lọc
 * @param {Object} params - Query params (match laySanPhams)
 * @param {number} [params.page=1]
 * @param {number} [params.per_page=10]
 * @param {string} [params.search]
 * @param {number} [params.min_price]
 * @param {number} [params.max_price]
 * @param {"price_asc"|"price_desc"|"name_asc"|"name_desc"} [params.sort_by]
 * @param {number[]} [params.thuong_hieu_ids]
 * @param {number[]} [params.danh_muc_ids]
 * @returns {import("@tanstack/react-query").UseQueryResult<import("../schemas/sanPhamSchemas").SanPhamListResponse>}
 */
export const useSanPhams = (params = {}) => {
  return useQuery({
    queryKey: ["sanphams", params],
    queryFn: () => laySanPhams(params),
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    keepPreviousData: true, // Giữ data cũ khi fetch trang mới
  });
};

// Hook: Lấy chi tiết một sản phẩm
/**
 * Fetch chi tiết sản phẩm theo ID
 * @param {number} sanPhamId - ID sản phẩm
 * @param {Object} [options] - React Query options
 * @returns {import("@tanstack/react-query").UseQueryResult<import("../schemas/sanPhamSchemas").SanPhamResponse>}
 */
export const useSanPhamChiTiet = (sanPhamId, options = {}) => {
  return useQuery({
    queryKey: ["sanpham", sanPhamId],
    queryFn: () => laySanPhamTheoId(sanPhamId),
    enabled: !!sanPhamId, // Chỉ fetch nếu có ID
    staleTime: 10 * 60 * 1000, // Cache 10 phút
    ...options,
  });
};

// Hook: Tạo sản phẩm mới
/**
 * Tạo sản phẩm mới
 * @returns {import("@tanstack/react-query").UseMutationResult<import("../schemas/sanPhamSchemas").SanPhamResponse, Error, import("../schemas/sanPhamSchemas").SanPhamCreate>}
 */
export const useTaoSanPham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taoSanPham,
    onSuccess: () => {
      toast.success("Tạo sản phẩm thành công");
      queryClient.invalidateQueries(["sanphams"]); // Refresh danh sách
    },
    onError: (error) => {
      toast.error(`Lỗi tạo sản phẩm: ${error.message || "Vui lòng thử lại"}`);
    },
  });
};

// Hook: Cập nhật sản phẩm
/**
 * Cập nhật sản phẩm
 * @returns {import("@tanstack/react-query").UseMutationResult<import("../schemas/sanPhamSchemas").SanPhamResponse, Error, {sanPhamId: number, sanPhamData: import("../schemas/sanPhamSchemas").SanPhamUpdate}>}
 */
export const useCapNhatSanPham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: capNhatSanPham,
    onSuccess: (_, variables) => {
      toast.success("Cập nhật sản phẩm thành công");
      queryClient.invalidateQueries(["sanphams"]); // Refresh danh sách
      queryClient.invalidateQueries(["sanpham", variables.sanPhamId]); // Refresh chi tiết
    },
    onError: (error) => {
      toast.error(
        `Lỗi cập nhật sản phẩm: ${error.message || "Vui lòng thử lại"}`
      );
    },
  });
};

// Hook: Xóa sản phẩm
/**
 * Xóa sản phẩm
 * @returns {import("@tanstack/react-query").UseMutationResult<{message: string}, Error, number>}
 */
export const useXoaSanPham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: xoaSanPham,
    onSuccess: () => {
      toast.success("Xóa sản phẩm thành công");
      queryClient.invalidateQueries(["sanphams"]);
    },
    onError: (error) => {
      toast.error(`Lỗi xóa sản phẩm: ${error.message || "Vui lòng thử lại"}`);
    },
  });
};

// Hook: Tạo biến thể cho sản phẩm
/**
 * Tạo biến thể mới
 * @returns {import("@tanstack/react-query").UseMutationResult<import("../schemas/sanPhamSchemas").BienTheSanPhamResponse, Error, {sanPhamId: number, bienTheData: import("../schemas/sanPhamSchemas").BienTheSanPhamCreate}>}
 */
export const useTaoBienThe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taoBienThe,
    onSuccess: (_, variables) => {
      toast.success("Tạo biến thể thành công");
      queryClient.invalidateQueries(["sanpham", variables.sanPhamId]); // Refresh chi tiết sản phẩm
    },
    onError: (error) => {
      toast.error(`Lỗi tạo biến thể: ${error.message || "Vui lòng thử lại"}`);
    },
  });
};

// Hook: Cập nhật biến thể
/**
 * Cập nhật biến thể
 * @returns {import("@tanstack/react-query").UseMutationResult<import("../schemas/sanPhamSchemas").BienTheSanPhamResponse, Error, {sanPhamId: number, bienTheId: number, bienTheData: import("../schemas/sanPhamSchemas").BienTheSanPhamUpdate}>}
 */
export const useCapNhatBienThe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: capNhatBienThe,
    onSuccess: (_, variables) => {
      toast.success("Cập nhật biến thể thành công");
      queryClient.invalidateQueries(["sanpham", variables.sanPhamId]); // Refresh chi tiết sản phẩm
    },
    onError: (error) => {
      toast.error(
        `Lỗi cập nhật biến thể: ${error.message || "Vui lòng thử lại"}`
      );
    },
  });
};

// Hook: Xóa biến thể
/**
 * Xóa biến thể
 * @returns {import("@tanstack/react-query").UseMutationResult<{message: string}, Error, {sanPhamId: number, bienTheId: number}>}
 */
export const useXoaBienThe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: xoaBienThe,
    onSuccess: (_, variables) => {
      toast.success("Xóa biến thể thành công");
      queryClient.invalidateQueries(["sanpham", variables.sanPhamId]); // Refresh chi tiết sản phẩm
    },
    onError: (error) => {
      toast.error(`Lỗi xóa biến thể: ${error.message || "Vui lòng thử lại"}`);
    },
  });
};

// Hook: Lấy signature để upload ảnh lên Cloudinary
/**
 * Lấy signature từ backend để upload ảnh
 * @returns {import("@tanstack/react-query").UseMutationResult<{signature: string, timestamp: number, api_key: string, folder: string}, Error, string>}
 */
export const useUploadSignature = () => {
  return useMutation({
    mutationFn: async (folder = "san_pham") => {
      const res = await apiPrivate.post("/upload/signature", { folder });
      return res.data; // {signature, timestamp, api_key, folder}
    },
    onError: (error) => {
      toast.error(`Lỗi lấy signature: ${error.message || "Vui lòng thử lại"}`);
    },
  });
};

// Hook: Upload ảnh trực tiếp lên Cloudinary
/**
 * Upload ảnh lên Cloudinary
 * @returns {import("@tanstack/react-query").UseMutationResult<import("../schemas/sanPhamSchemas").HinhAnhResponse, Error, {file: File, signatureData: {signature: string, timestamp: number, api_key: string, folder: string}}>}
 */
export const useUploadToCloudinary = () => {
  return useMutation({
    mutationFn: async ({ file, signatureData }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signatureData.api_key);
      formData.append("timestamp", signatureData.timestamp);
      formData.append("signature", signatureData.signature);
      formData.append("folder", signatureData.folder);

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      return {
        url: res.data.secure_url,
        public_id: res.data.public_id,
        la_anh_dai_dien: false, // Default, có thể thêm logic chọn ảnh đại diện
      }; // Match HinhAnhResponse
    },
    onError: (error) => {
      toast.error(`Lỗi upload ảnh: ${error.message || "Vui lòng thử lại"}`);
    },
  });
};
