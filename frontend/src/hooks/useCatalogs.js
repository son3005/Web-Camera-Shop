// src/hooks/api/useCatalogs.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { useToast } from "./useToast";

// ==============================================================
// DANH MỤC HOOKS
// ==============================================================

export const useCatalogs = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Lấy danh sách danh mục
  const useGetAllDanhMuc = (options = {}) => {
    const { page = 1, per_page = 10 } = options;
    return useQuery({
      queryKey: ["danh-muc", page, per_page],
      queryFn: async () => {
        const { data } = await apiClient.get(
          `/catalogs/danh-muc?page=${page}&per_page=${per_page}`
        );
        return data;
      },
    });
  };

  // Lấy chi tiết danh mục
  const useGetDanhMucById = (id) => {
    return useQuery({
      queryKey: ["danh-muc", id],
      queryFn: async () => {
        const { data } = await apiClient.get(`/catalogs/danh-muc/${id}`);
        return data;
      },
      enabled: !!id,
    });
  };

  // Tạo danh mục mới
  const useCreateDanhMuc = () => {
    return useMutation({
      mutationFn: async (danhMucData) => {
        const { data } = await apiClient.post(
          "/catalogs/danh-muc",
          danhMucData
        );
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["danh-muc"] });
        toast.success("Tạo danh mục thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi tạo danh mục");
      },
    });
  };

  // Cập nhật danh mục
  const useUpdateDanhMuc = () => {
    return useMutation({
      mutationFn: async ({ id, ...updateData }) => {
        const { data } = await apiClient.put(
          `/catalogs/danh-muc/${id}`,
          updateData
        );
        return data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["danh-muc", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["danh-muc"] });
        toast.success("Cập nhật danh mục thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi cập nhật danh mục");
      },
    });
  };

  // Xóa danh mục
  const useDeleteDanhMuc = () => {
    return useMutation({
      mutationFn: async (id) => {
        await apiClient.delete(`/catalogs/danh-muc/${id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["danh-muc"] });
        toast.success("Xóa danh mục thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi xóa danh mục");
      },
    });
  };

  // ==============================================================
  // THƯƠNG HIỆU HOOKS
  // ==============================================================

  // Lấy danh sách thương hiệu
  const useGetAllThuongHieu = (options = {}) => {
    const { page = 1, per_page = 10 } = options;
    return useQuery({
      queryKey: ["thuong-hieu", page, per_page],
      queryFn: async () => {
        const { data } = await apiClient.get(
          `/catalogs/thuong-hieu?page=${page}&per_page=${per_page}`
        );
        return data;
      },
    });
  };

  // Lấy chi tiết thương hiệu
  const useGetThuongHieuById = (id) => {
    return useQuery({
      queryKey: ["thuong-hieu", id],
      queryFn: async () => {
        const { data } = await apiClient.get(`/catalogs/thuong-hieu/${id}`);
        return data;
      },
      enabled: !!id,
    });
  };

  // Tạo thương hiệu mới
  const useCreateThuongHieu = () => {
    return useMutation({
      mutationFn: async (thuongHieuData) => {
        const { data } = await apiClient.post(
          "/catalogs/thuong-hieu",
          thuongHieuData
        );
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["thuong-hieu"] });
        toast.success("Tạo thương hiệu thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi tạo thương hiệu");
      },
    });
  };

  // Cập nhật thương hiệu
  const useUpdateThuongHieu = () => {
    return useMutation({
      mutationFn: async ({ id, ...updateData }) => {
        const { data } = await apiClient.put(
          `/catalogs/thuong-hieu/${id}`,
          updateData
        );
        return data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ["thuong-hieu", variables.id],
        });
        queryClient.invalidateQueries({ queryKey: ["thuong-hieu"] });
        toast.success("Cập nhật thương hiệu thành công");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.error || "Lỗi khi cập nhật thương hiệu"
        );
      },
    });
  };

  // Xóa thương hiệu
  const useDeleteThuongHieu = () => {
    return useMutation({
      mutationFn: async (id) => {
        await apiClient.delete(`/catalogs/thuong-hieu/${id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["thuong-hieu"] });
        toast.success("Xóa thương hiệu thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi xóa thương hiệu");
      },
    });
  };

  return {
    // Danh mục
    useGetAllDanhMuc,
    useGetDanhMucById,
    useCreateDanhMuc,
    useUpdateDanhMuc,
    useDeleteDanhMuc,

    // Thương hiệu
    useGetAllThuongHieu,
    useGetThuongHieuById,
    useCreateThuongHieu,
    useUpdateThuongHieu,
    useDeleteThuongHieu,
  };
};
