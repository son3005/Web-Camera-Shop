// src/hooks/api/useUpload.js
import { useMutation } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { useToast } from "./useToast";

export const useUpload = () => {
  const { toast } = useToast();

  // Lấy signature upload từ Cloudinary
  const useGetUploadSignature = () => {
    return useMutation({
      mutationFn: async (folder = "san_pham") => {
        const { data } = await apiClient.post("/upload/signature", {
          folder,
        });
        return data;
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi lấy chữ ký upload");
      },
    });
  };

  // Upload trực tiếp qua server (fallback)
  const useUploadDirect = () => {
    return useMutation({
      mutationFn: async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await apiClient.post("/upload/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return data;
      },
      onSuccess: () => {
        toast.success("Upload ảnh thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Lỗi khi upload ảnh");
      },
    });
  };

  return {
    useGetUploadSignature,
    useUploadDirect,
  };
};
