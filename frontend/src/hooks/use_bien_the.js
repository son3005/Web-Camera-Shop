// src/hooks/useBienThe.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  them_bien_the,
  cap_nhat_bien_the,
  xoa_bien_the,
} from "../api/san_pham";
import { toast } from "react-hot-toast";

// ------------------- Tạo biến thể -------------------
export const useThemBienThe = (san_pham_id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => them_bien_the(san_pham_id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["san_pham", san_pham_id] });
      toast.success("Thêm biến thể thành công");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error || "Lỗi thêm biến thể"),
  });
};

// ------------------- Cập nhật biến thể -------------------
export const useCapNhatBienThe = (san_pham_id, bien_the_id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      cap_nhat_bien_the(san_pham_id, bien_the_id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["san_pham", san_pham_id] });
      toast.success("Cập nhật biến thể thành công");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error || "Lỗi cập nhật biến thể"),
  });
};

// ------------------- Xóa biến thể -------------------
export const useXoaBienThe = (san_pham_id, bien_the_id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => xoa_bien_the(san_pham_id, bien_the_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["san_pham", san_pham_id] });
      toast.success("Xóa biến thể thành công");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error || "Lỗi xóa biến thể"),
  });
};
