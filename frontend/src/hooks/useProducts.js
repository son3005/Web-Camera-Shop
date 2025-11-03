// src/hooks/api/useProducts.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { useToast } from "./useToast";

export const useProducts = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Lấy danh sách sản phẩm với filter
  const useGetAllSanPham = (filters = {}) => {
    const {
      page = 1,
      per_page = 10,
      search,
      min_price,
      max_price,
      sort_by_price,
      sort_by_name,
      thuong_hieu_ids = [],
      danh_muc_ids = [],
    } = filters;

    return useQuery({
      queryKey: ["san-pham", filters],
      queryFn: async () => {
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: per_page.toString(),
          ...(search && { search }),
          ...(min_price && { min_price: min_price.toString() }),
          ...(max_price && { max_price: max_price.toString() }),
          ...(sort_by_price && { sort_by_price }),
          ...(sort_by_name && { sort_by_name }),
        });

        // Thêm array parameters
        thuong_hieu_ids.forEach((id) => params.append("thuong_hieu_ids", id));
        danh_muc_ids.forEach((id) => params.append("danh_muc_ids", id));

        const { data } = await apiClient.get(`/san-pham?${params.toString()}`);
        return data;
      },
    });
  };

  // Lấy chi tiết sản phẩm
  const useGetSanPhamById = (id) => {
    return useQuery({
      queryKey: ["san-pham", id],
      queryFn: async () => {
        const { data } = await apiClient.get(`/san-pham/${id}`);
        return data;
      },
      enabled: !!id,
    });
  };

  // Tạo sản phẩm mới
  const useCreateSanPham = () => {
    return useMutation({
      mutationFn: async (sanPhamData) => {
        const { data } = await apiClient.post("/san-pham", sanPhamData);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["san-pham"] });
        toast.success("Tạo sản phẩm thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi tạo sản phẩm");
      },
    });
  };

  // Cập nhật sản phẩm
  const useUpdateSanPham = () => {
    return useMutation({
      mutationFn: async ({ id, ...updateData }) => {
        const { data } = await apiClient.put(`/san-pham/${id}`, updateData);
        return data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["san-pham", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["san-pham"] });
        toast.success("Cập nhật sản phẩm thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi cập nhật sản phẩm");
      },
    });
  };

  // Xóa sản phẩm
  const useDeleteSanPham = () => {
    return useMutation({
      mutationFn: async (id) => {
        await apiClient.delete(`/san-pham/${id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["san-pham"] });
        toast.success("Xóa sản phẩm thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi xóa sản phẩm");
      },
    });
  };

  // ==============================================================
  // BIẾN THỂ HOOKS
  // ==============================================================

  // Tạo biến thể mới
  const useCreateBienThe = (sanPhamId) => {
    return useMutation({
      mutationFn: async (bienTheData) => {
        const { data } = await apiClient.post(
          `/san-pham/${sanPhamId}/bien-the`,
          bienTheData
        );
        return data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["san-pham", sanPhamId] });
        toast.success("Tạo biến thể thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi tạo biến thể");
      },
    });
  };

  // Cập nhật biến thể
  const useUpdateBienThe = (sanPhamId, bienTheId) => {
    return useMutation({
      mutationFn: async (updateData) => {
        const { data } = await apiClient.put(
          `/san-pham/${sanPhamId}/bien-the/${bienTheId}`,
          updateData
        );
        return data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["san-pham", sanPhamId] });
        toast.success("Cập nhật biến thể thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi cập nhật biến thể");
      },
    });
  };

  // Xóa biến thể
  const useDeleteBienThe = (sanPhamId) => {
    return useMutation({
      mutationFn: async (bienTheId) => {
        await apiClient.delete(`/san-pham/${sanPhamId}/bien-the/${bienTheId}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["san-pham", sanPhamId] });
        toast.success("Xóa biến thể thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi xóa biến thể");
      },
    });
  };

  // ==============================================================
  // HÌNH ẢNH HOOKS
  // ==============================================================

  // Thêm ảnh cho biến thể
  const useAddHinhAnh = (sanPhamId, bienTheId) => {
    return useMutation({
      mutationFn: async (hinhAnhData) => {
        const { data } = await apiClient.post(
          `/san-pham/${sanPhamId}/bien-the/${bienTheId}/hinh-anh`,
          hinhAnhData
        );
        return data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["san-pham", sanPhamId] });
        toast.success("Thêm ảnh thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi thêm ảnh");
      },
    });
  };

  // Cập nhật ảnh
  const useUpdateHinhAnh = (sanPhamId, bienTheId, hinhAnhId) => {
    return useMutation({
      mutationFn: async (updateData) => {
        const { data } = await apiClient.put(
          `/san-pham/${sanPhamId}/bien-the/${bienTheId}/hinh-anh/${hinhAnhId}`,
          updateData
        );
        return data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["san-pham", sanPhamId] });
        toast.success("Cập nhật ảnh thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi cập nhật ảnh");
      },
    });
  };

  // Xóa ảnh
  const useDeleteHinhAnh = (sanPhamId, bienTheId) => {
    return useMutation({
      mutationFn: async (hinhAnhId) => {
        await apiClient.delete(
          `/san-pham/${sanPhamId}/bien-the/${bienTheId}/hinh-anh/${hinhAnhId}`
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["san-pham", sanPhamId] });
        toast.success("Xóa ảnh thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi xóa ảnh");
      },
    });
  };

  return {
    // Sản phẩm
    useGetAllSanPham,
    useGetSanPhamById,
    useCreateSanPham,
    useUpdateSanPham,
    useDeleteSanPham,

    // Biến thể
    useCreateBienThe,
    useUpdateBienThe,
    useDeleteBienThe,

    // Hình ảnh
    useAddHinhAnh,
    useUpdateHinhAnh,
    useDeleteHinhAnh,
  };
};
