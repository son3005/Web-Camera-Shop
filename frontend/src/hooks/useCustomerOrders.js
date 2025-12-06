// src/hooks/useCustomerOrders.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  layDonHangNguoiDung,
  layChiTietDonHangNguoiDung,
  huyDonHangNguoiDung,
  yeuCauDoiTra,
} from "../api/khachHangDonHangApi";

// Lấy danh sách đơn hàng của khách hiện tại (theo JWT)
export const useCustomerOrderList = () => {
  return useQuery({
    queryKey: ["customer-orders"],
    queryFn: layDonHangNguoiDung,
  });
};

// (dự phòng) Lấy chi tiết 1 đơn hàng – dùng khi sau này làm trang/modal chi tiết
export const useCustomerOrderDetail = (id, enabled = true) => {
  return useQuery({
    queryKey: ["customer-order", id],
    queryFn: () => layChiTietDonHangNguoiDung(id),
    enabled: !!id && enabled,
  });
};

// Huỷ đơn hàng
export const useCancelCustomerOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ly_do }) => huyDonHangNguoiDung(id, ly_do),
    onSuccess: () => {
      // load lại list đơn sau khi huỷ
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
  });
};

// Yêu cầu đổi trả
export const useReturnCustomerOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ly_do }) => yeuCauDoiTra(id, ly_do),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
  });
};
