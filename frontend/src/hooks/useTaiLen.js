// src/hooks/useTaiLen.js
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { layChuKyTaiLen, taiLenCloudinary } from "../api/taiLenApi.js";

export const useTaiLen = () => {
  const mutation = useMutation({
    mutationFn: async (file) => {
      const chuKyData = await layChuKyTaiLen();
      const result = await taiLenCloudinary(file, chuKyData);
      return {
        url: result.secure_url,
        public_id: result.public_id,
        alt_text: file.name.split(".").slice(0, -1).join(".") || file.name,
        la_anh_dai_dien: false,
      };
    },
    onError: (error, file) => {
      toast.error(`Upload ảnh "${file.name}" thất bại!`);
      console.error("Upload error:", error);
    },
  });

  // Trả về cả mutate và mutateAsync
  return {
    ...mutation,
    mutateAsync: mutation.mutateAsync, // ← Thêm dòng này
  };
};
