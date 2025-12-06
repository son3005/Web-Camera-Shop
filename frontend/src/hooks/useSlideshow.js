// src/hooks/useSlideshow.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPrivateSlides,
  createSlide,
  updateSlide,
  deleteSlide,
} from "../api/slideshowApi";
import { useToast } from "./useToast";

export function useSlideshow() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const useGetSlides = () =>
    useQuery({
      queryKey: ["admin-slideshow"],
      queryFn: getPrivateSlides,
    });

  const useCreateSlide = () =>
    useMutation({
      mutationFn: (payload) => createSlide(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-slideshow"] });
        queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
        success("Thêm ảnh trình chiếu thành công");
      },
      onError: (err) => {
        error(
          err?.response?.data?.detail ||
            err?.response?.data?.error ||
            err?.message ||
            "Không thêm được ảnh trình chiếu"
        );
      },
    });

  const useUpdateSlide = () =>
    useMutation({
      mutationFn: ({ id, payload }) => updateSlide(id, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-slideshow"] });
        queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
        success("Cập nhật ảnh trình chiếu thành công");
      },
      onError: (err) => {
        error(
          err?.response?.data?.detail ||
            err?.response?.data?.error ||
            err?.message ||
            "Không cập nhật được ảnh trình chiếu"
        );
      },
    });

  const useDeleteSlide = () =>
    useMutation({
      mutationFn: (id) => deleteSlide(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-slideshow"] });
        queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
        success("Xoá ảnh trình chiếu thành công");
      },
      onError: (err) => {
        error(
          err?.response?.data?.detail ||
            err?.response?.data?.error ||
            err?.message ||
            "Không xoá được ảnh trình chiếu"
        );
      },
    });

  return {
    useGetSlides,
    useCreateSlide,
    useUpdateSlide,
    useDeleteSlide,
  };
}
