// src/hooks/useBrands.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/apiClient"; // dùng instance của bạn

const keyList = (page, perPage) => ["brands", page, perPage];

export function useBrands() {
  const qc = useQueryClient();

  // GET /api/thuong-hieu/?page=&per_page=
  const useListBrands = (page = 1, perPage = 10) =>
    useQuery({
      queryKey: keyList(page, perPage),
      queryFn: async () => {
        const { data } = await api.get("/thuong-hieu/", {
          params: { page, per_page: perPage },
        });
        return data; // { data: [...], pagination: {...} }
      },
      keepPreviousData: true,
    });

  // POST /api/thuong-hieu/
  const createBrand = useMutation({
    mutationFn: async (payload) =>
      (await api.post("/thuong-hieu/", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });

  // PUT /api/thuong-hieu/:id
  const updateBrand = useMutation({
    mutationFn: async ({ id, ...payload }) =>
      (await api.put(`/thuong-hieu/${id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });

  // DELETE /api/thuong-hieu/:id
  const deleteBrand = useMutation({
    mutationFn: async (id) => (await api.delete(`/thuong-hieu/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });

  // GET /api/thuong-hieu/:id/kiem-tra-su-dung
  const checkUsage = async (id) =>
    (await api.get(`/thuong-hieu/${id}/kiem-tra-su-dung`)).data;

  return { useListBrands, createBrand, updateBrand, deleteBrand, checkUsage };
}
