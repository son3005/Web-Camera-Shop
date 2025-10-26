// src/hooks/useSanphamBienDoi.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
// Import các hàm API
import { taoSanPham, capNhatSanPham, xoaSanPham } from "../api/sanphamApi";

/**
 * Hook để TẠO sản phẩm
 * @param {function} onSuccessCallback - Hàm gọi lại (ví dụ: đóng modal) khi thành công
 */
export const useTaoSanPham = (onSuccessCallback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taoSanPham, // Hàm API để tạo
    onSuccess: (data) => {
      toast.success("Tạo sản phẩm thành công!");
      // Tự động fetch lại danh sách sản phẩm
      queryClient.invalidateQueries(["sanphams"]);
      // Gọi hàm callback (ví dụ: để đóng modal)
      if (onSuccessCallback) onSuccessCallback(data);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Lỗi khi tạo sản phẩm");
    },
  });
};

/**
 * Hook để CẬP NHẬT sản phẩm
 * @param {function} onSuccessCallback - Hàm gọi lại (ví dụ: đóng modal) khi thành công
 */
export const useCapNhatSanPham = (onSuccessCallback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: capNhatSanPham, // Hàm API để cập nhật ({ sanPhamId, sanPhamData })
    onSuccess: (data, variables) => {
      toast.success("Cập nhật sản phẩm thành công!");
      // Tự động fetch lại danh sách
      queryClient.invalidateQueries(["sanphams"]);
      // Tự động fetch lại trang chi tiết của sản phẩm đó
      queryClient.invalidateQueries(["sanpham", variables.sanPhamId]);
      if (onSuccessCallback) onSuccessCallback(data);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Lỗi khi cập nhật sản phẩm");
    },
  });
};

/**
 * Hook để XÓA sản phẩm
 */
export const useXoaSanPham = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: xoaSanPham, // Hàm API để xóa (nhận sanPhamId)
    onSuccess: () => {
      toast.success("Xóa sản phẩm thành công!");
      // Tự động fetch lại danh sách
      queryClient.invalidateQueries(["sanphams"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Lỗi khi xóa sản phẩm");
    },
  });
};
