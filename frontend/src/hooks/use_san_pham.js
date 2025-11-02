// src/hooks/useSanPham.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  lay_danh_sach_san_pham,
  lay_chi_tiet_san_pham,
  tao_san_pham,
  cap_nhat_san_pham,
  xoa_san_pham,
} from "../api/san_pham";
import { toast } from "react-hot-toast";

// ------------------- Danh sách -------------------
export const useDanhSachSanPham = (params) =>
  useQuery({
    queryKey: ["san_pham", params],
    queryFn: () => lay_danh_sach_san_pham(params),
    staleTime: 5 * 60 * 1000, // 5 phút
  });

// ------------------- Chi tiết -------------------
export const useChiTietSanPham = (id) =>
  useQuery({
    queryKey: ["san_pham", id],
    queryFn: () => lay_chi_tiet_san_pham(id),
    enabled: !!id,
  });

// ------------------- Tạo -------------------
export const useTaoSanPham = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tao_san_pham,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["san_pham"] });
      toast.success("Tạo sản phẩm thành công");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error || "Lỗi tạo sản phẩm"),
  });
};

// ------------------- Cập nhật -------------------
export const useCapNhatSanPham = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => cap_nhat_san_pham(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["san_pham", id] });
      qc.invalidateQueries({ queryKey: ["san_pham"] });
      toast.success("Cập nhật thành công");
    },
    onError: (err) => toast.error(err?.response?.data?.error || "Lỗi cập nhật"),
  });
};

// ------------------- Xóa -------------------
export const useXoaSanPham = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: xoa_san_pham,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["san_pham"] });
      toast.success("Xóa sản phẩm thành công");
    },
    onError: (err) => toast.error(err?.response?.data?.error || "Lỗi xóa"),
  });
};
