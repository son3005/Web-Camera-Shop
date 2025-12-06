// frontend/src/hooks/useProducts.js
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

  const useGetAllSanPham = (filters = {}) => {
    return useQuery({
      queryKey: ["san-pham", filters],
      queryFn: () => fetchProducts(filters),
      keepPreviousData: true,
    });
  };

  const useGetSanPhamById = (id, options = {}) => {
    return useQuery({
      queryKey: ["san-pham", id],
      queryFn: () => fetchProductById(id),
      enabled: !!id,
      ...options,
    });
  };

  const useCreateSanPham = () => {
    return useMutation({
      mutationFn: (payload) => createProduct(payload),
      onSuccess: () => {
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

  const useUpdateSanPham = () => {
    return useMutation({
      mutationFn: ({ id, ...rest }) => updateProduct(id, rest),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["san-pham", variables.id] });
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

  const useDeleteSanPham = () => {
    return useMutation({
      mutationFn: (id) => deleteProduct(id),
      onSuccess: () => {
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
