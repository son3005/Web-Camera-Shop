// src/hooks/useLevels.js
// ===================================================
// React Query hooks cho module Quản lý Cấp độ (Level)
// ===================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLevels,
  createLevel,
  updateLevel,
  deleteLevel,
  checkLevelUsage,
} from "../api/capDoApi";

// Lấy danh sách cấp độ (có phân trang)
export const useLevelsList = (page = 1, perPage = 10) => {
  return useQuery({
    queryKey: ["levels", { page, perPage }],
    queryFn: () => getLevels({ page, per_page: perPage }),
    keepPreviousData: true,
  });
};

// Tạo mới
export const useCreateLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLevel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["levels"] }),
  });
};

// Cập nhật
export const useUpdateLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateLevel(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["levels"] }),
  });
};

// Xóa
export const useDeleteLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLevel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["levels"] }),
  });
};

// Kiểm tra sử dụng
export const useCheckLevelUsage = () => {
  return useMutation({
    mutationFn: checkLevelUsage,
  });
};
