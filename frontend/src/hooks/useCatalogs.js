// frontend/src/hooks/useCatalogs.js
// Hook lấy danh mục + thương hiệu + cấp độ cho form sản phẩm và bộ lọc.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { useToast } from "./useToast";

// export đúng tên để chỗ khác import { useCatalogs } ... không lỗi
export const useCatalogs = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ========= DANH MỤC =========
  // BE của bạn là: GET http://localhost:5000/api/danh-muc/
  // nên ở đây mình gọi đúng: "/danh-muc/"
  const useGetAllDanhMuc = (options = {}) => {
    const { page = 1, per_page = 10 } = options;
    return useQuery({
      queryKey: ["danh-muc", page, per_page],
      queryFn: async () => {
        const { data } = await apiClient.get(
          `/danh-muc/?page=${page}&per_page=${per_page}`
        );
        return data; // { data: [...], pagination: {...} }
      },
    });
  };

  const useGetDanhMucById = (id) => {
    return useQuery({
      queryKey: ["danh-muc", id],
      queryFn: async () => {
        const { data } = await apiClient.get(`/danh-muc/${id}`);
        return data;
      },
      enabled: !!id,
    });
  };

  const useCreateDanhMuc = () => {
    return useMutation({
      mutationFn: async (payload) => {
        const { data } = await apiClient.post("/danh-muc/", payload);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["danh-muc"] });
        toast.success("Tạo danh mục thành công");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error || "Lỗi khi tạo danh mục");
      },
    });
  };

  const useUpdateDanhMuc = () => {
    return useMutation({
      mutationFn: async ({ id, ...rest }) => {
        const { data } = await apiClient.put(`/danh-muc/${id}`, rest);
        return data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["danh-muc", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["danh-muc"] });
        toast.success("Cập nhật danh mục thành công");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error || "Lỗi khi cập nhật danh mục");
      },
    });
  };

  const useDeleteDanhMuc = () => {
    return useMutation({
      mutationFn: async (id) => {
        await apiClient.delete(`/danh-muc/${id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["danh-muc"] });
        toast.success("Xóa danh mục thành công");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error || "Lỗi khi xóa danh mục");
      },
    });
  };

  // ========= THƯƠNG HIỆU =========
  // BE: /api/thuong-hieu/
  const useGetAllThuongHieu = (options = {}) => {
    const { page = 1, per_page = 10 } = options;
    return useQuery({
      queryKey: ["thuong-hieu", page, per_page],
      queryFn: async () => {
        const { data } = await apiClient.get(
          `/thuong-hieu/?page=${page}&per_page=${per_page}`
        );
        return data;
      },
    });
  };

  const useGetThuongHieuById = (id) => {
    return useQuery({
      queryKey: ["thuong-hieu", id],
      queryFn: async () => {
        const { data } = await apiClient.get(`/thuong-hieu/${id}`);
        return data;
      },
      enabled: !!id,
    });
  };

  const useCreateThuongHieu = () => {
    return useMutation({
      mutationFn: async (payload) => {
        const { data } = await apiClient.post("/thuong-hieu/", payload);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["thuong-hieu"] });
        toast.success("Tạo thương hiệu thành công");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error || "Lỗi khi tạo thương hiệu");
      },
    });
  };

  const useUpdateThuongHieu = () => {
    return useMutation({
      mutationFn: async ({ id, ...rest }) => {
        const { data } = await apiClient.put(`/thuong-hieu/${id}`, rest);
        return data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ["thuong-hieu", variables.id],
        });
        queryClient.invalidateQueries({ queryKey: ["thuong-hieu"] });
        toast.success("Cập nhật thương hiệu thành công");
      },
      onError: (err) => {
        toast.error(
          err?.response?.data?.error || "Lỗi khi cập nhật thương hiệu"
        );
      },
    });
  };

  const useDeleteThuongHieu = () => {
    return useMutation({
      mutationFn: async (id) => {
        await apiClient.delete(`/thuong-hieu/${id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["thuong-hieu"] });
        toast.success("Xóa thương hiệu thành công");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error || "Lỗi khi xóa thương hiệu");
      },
    });
  };

  // ========= CẤP ĐỘ =========
  // BE: /api/cap-do/
  const useGetAllCapDo = (options = {}) => {
    const { page = 1, per_page = 10 } = options;
    return useQuery({
      queryKey: ["cap-do", page, per_page],
      queryFn: async () => {
        const { data } = await apiClient.get(
          `/cap-do/?page=${page}&per_page=${per_page}`
        );
        return data;
      },
    });
  };

  return {
    // danh mục
    useGetAllDanhMuc,
    useGetDanhMucById,
    useCreateDanhMuc,
    useUpdateDanhMuc,
    useDeleteDanhMuc,
    // thương hiệu
    useGetAllThuongHieu,
    useGetThuongHieuById,
    useCreateThuongHieu,
    useUpdateThuongHieu,
    useDeleteThuongHieu,
    // cấp độ
    useGetAllCapDo,
  };
};
