// src/hooks/useHinhAnh.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  them_hinh_anh,
  cap_nhat_hinh_anh,
  xoa_hinh_anh,
} from "../api/san_pham";
import { toast } from "react-hot-toast";

export const useThemHinhAnh = (san_pham_id, bien_the_id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => them_hinh_anh(san_pham_id, bien_the_id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["san_pham", san_pham_id] });
      toast.success("Thêm ảnh thành công");
    },
  });
};

export const useCapNhatHinhAnh = (san_pham_id, bien_the_id, hinh_anh_id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      cap_nhat_hinh_anh(san_pham_id, bien_the_id, hinh_anh_id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["san_pham", san_pham_id] });
      toast.success("Cập nhật ảnh thành công");
    },
  });
};

export const useXoaHinhAnh = (san_pham_id, bien_the_id, hinh_anh_id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => xoa_hinh_anh(san_pham_id, bien_the_id, hinh_anh_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["san_pham", san_pham_id] });
      toast.success("Xóa ảnh thành công");
    },
  });
};
