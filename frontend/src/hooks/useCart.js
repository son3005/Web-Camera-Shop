// src/hooks/useCart.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import {
  layGioHang,
  themVaoGioHang,
  capNhatSoLuongGioHang,
  xoaKhoiGioHang,
  kiemTraTonKho,
} from "../api/gioHangApi";

export const useCart = () => {
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // 1. lấy giỏ
  const useGetCart = () =>
    useQuery({
      queryKey: ["gio-hang"],
      queryFn: layGioHang,
      staleTime: 30_000,
    });

  // 2. thêm
  const useAddToCart = () =>
    useMutation({
      mutationFn: ({ bienTheId, soLuong }) =>
        themVaoGioHang({ bienTheId, soLuong }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["gio-hang"] });
        success("Đã thêm sản phẩm vào giỏ hàng");
      },
      onError: (err) => {
        error(err?.response?.data?.message || "Lỗi khi thêm sản phẩm");
      },
    });

  // 3. cập nhật số lượng
  const useUpdateQuantity = () =>
    useMutation({
      mutationFn: ({ chiTietId, soLuong }) =>
        capNhatSoLuongGioHang({ chiTietId, soLuong }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["gio-hang"] });
      },
      onError: (err) => {
        error(err?.response?.data?.message || "Lỗi khi cập nhật số lượng");
      },
    });

  // 4. xóa
  const useRemoveItem = () =>
    useMutation({
      mutationFn: (chiTietId) => xoaKhoiGioHang(chiTietId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["gio-hang"] });
        success("Đã xóa sản phẩm khỏi giỏ hàng");
      },
      onError: (err) => {
        error(err?.response?.data?.message || "Lỗi khi xóa sản phẩm");
      },
    });

  // 5. kiểm tra tồn kho
  const useCheckStock = () =>
    useMutation({
      mutationFn: ({ bienTheId, soLuong }) =>
        kiemTraTonKho({ bienTheId, soLuong }),
      onError: (err) => {
        error(err?.response?.data?.message || "Lỗi khi kiểm tra tồn kho");
      },
    });

  return {
    useGetCart,
    useAddToCart,
    useUpdateQuantity,
    useRemoveItem,
    useCheckStock,
  };
};
