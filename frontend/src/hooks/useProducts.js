// frontend/src/hooks/useProducts.js
// Hook này bọc lại các hàm gọi API ở adminProductApi.js
// để component chỉ cần gọi hook chứ không phải tự gọi axios.
//
// Tên hàm giữ nguyên như bạn đang dùng ở Inventory, AddProductModal, ProductDetailModal.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/adminProductApi";
import { useToast } from "./useToast";

export const useProducts = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  // ===================== GET LIST =====================
  const useGetAllSanPham = (filters = {}) => {
    return useQuery({
      queryKey: ["san-pham", filters], // để phân trang / filter theo key
      queryFn: () => fetchProducts(filters),
      keepPreviousData: true,
    });
  };

  // ===================== GET DETAIL =====================
  const useGetSanPhamById = (id, options = {}) => {
    return useQuery({
      queryKey: ["san-pham", id],
      queryFn: () => fetchProductById(id),
      enabled: !!id,
      ...options,
    });
  };

  // ===================== CREATE =====================
  const useCreateSanPham = () => {
    return useMutation({
      mutationFn: (payload) => createProduct(payload),
      onSuccess: () => {
        // làm mới tất cả query liên quan 'san-pham'
        queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] === "san-pham",
        });
        success("Thêm sản phẩm thành công");
      },
      onError: (err) => {
        error(
          err?.response?.data?.error ||
            err?.message ||
            "Không tạo được sản phẩm"
        );
      },
    });
  };

  // ===================== UPDATE =====================
  const useUpdateSanPham = () => {
    return useMutation({
      // component sẽ truyền { id, ...data }
      mutationFn: ({ id, ...rest }) => updateProduct(id, rest),
      onSuccess: (_, variables) => {
        // refresh detail
        queryClient.invalidateQueries({ queryKey: ["san-pham", variables.id] });
        // refresh list
        queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] === "san-pham",
        });
        success("Cập nhật sản phẩm thành công");
      },
      onError: (err) => {
        error(
          err?.response?.data?.error ||
            err?.message ||
            "Không cập nhật được sản phẩm"
        );
      },
    });
  };

  // ===================== DELETE =====================
  const useDeleteSanPham = () => {
    return useMutation({
      mutationFn: (id) => deleteProduct(id),
      onSuccess: () => {
        // refresh list sau khi xóa
        queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] === "san-pham",
        });
        success("Xóa sản phẩm thành công");
      },
      onError: (err) => {
        error(
          err?.response?.data?.error || err?.message || "Không thể xóa sản phẩm"
        );
      },
    });
  };

  return {
    useGetAllSanPham,
    useGetSanPhamById,
    useCreateSanPham,
    useUpdateSanPham,
    useDeleteSanPham,
  };
};
