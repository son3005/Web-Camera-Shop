// src/hooks/useTaiLen.js
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { layChuKyTaiLen, taiLenCloudinary } from "../api/taiLenApi";

export const useTaiLen = () => {
  return useMutation({
    mutationFn: async (file) => {
      // B1: Lấy chữ ký
      const chuKyData = await layChuKyTaiLen(); // Không cần folder → backend mặc định

      // B2: Upload
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
};
