// src/hooks/useCatalogs.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  lay_danh_muc,
  tao_danh_muc,
  cap_nhat_danh_muc,
  xoa_danh_muc,
  lay_thuong_hieu,
  tao_thuong_hieu,
  cap_nhat_thuong_hieu,
  xoa_thuong_hieu,
} from "../api/catalogs";
import { toast } from "react-hot-toast";

// === Danh mục ===
export const useDanhMuc = (params) =>
  useQuery({
    queryKey: ["danh_muc", params],
    queryFn: () => lay_danh_muc(params),
  });

export const useTaoDanhMuc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tao_danh_muc,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["danh_muc"] });
      toast.success("Tạo danh mục thành công");
    },
  });
};

export const useCapNhatDanhMuc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => cap_nhat_danh_muc(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["danh_muc"] });
      toast.success("Cập nhật danh mục thành công");
    },
  });
};

export const useXoaDanhMuc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: xoa_danh_muc,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["danh_muc"] });
      toast.success("Xóa danh mục thành công");
    },
  });
};

// === Thương hiệu ===
export const useThuongHieu = (params) =>
  useQuery({
    queryKey: ["thuong_hieu", params],
    queryFn: () => lay_thuong_hieu(params),
  });

export const useTaoThuongHieu = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tao_thuong_hieu,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["thuong_hieu"] });
      toast.success("Tạo thương hiệu thành công");
    },
  });
};

export const useCapNhatThuongHieu = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => cap_nhat_thuong_hieu(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["thuong_hieu"] });
      toast.success("Cập nhật thương hiệu thành công");
    },
  });
};

export const useXoaThuongHieu = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: xoa_thuong_hieu,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["thuong_hieu"] });
      toast.success("Xóa thương hiệu thành công");
    },
  });
};
