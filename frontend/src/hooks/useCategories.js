// src/hooks/useCategories.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  checkCategoryUsage,
} from "../api/categoriesApi";

export const useCategories = () => {
  const qc = useQueryClient();

  const useGetCategories = (params = { page: 1, per_page: 10 }) =>
    useQuery({
      queryKey: ["categories", params],
      queryFn: () => getCategories(params),
      staleTime: 60_000,
    });

  const useGetCategoryById = (id, options = {}) =>
    useQuery({
      queryKey: ["category", id],
      queryFn: () => getCategoryById(id),
      enabled: !!id && (options.enabled ?? true),
    });

  const useCreateCategory = () =>
    useMutation({
      mutationFn: createCategory,
      onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    });

  const useUpdateCategory = () =>
    useMutation({
      mutationFn: updateCategory,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["categories"] });
        qc.invalidateQueries({ queryKey: ["category"] });
      },
    });

  const useDeleteCategory = () =>
    useMutation({
      mutationFn: deleteCategory,
      onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    });

  const useCheckCategoryUsage = () =>
    useMutation({
      mutationFn: checkCategoryUsage,
    });

  return {
    useGetCategories,
    useGetCategoryById,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
    useCheckCategoryUsage,
  };
};
