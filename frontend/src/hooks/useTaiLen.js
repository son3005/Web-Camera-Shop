// src/hooks/useTaiLen.js
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
// Import các hàm API
import { layChuKyTaiLen, taiLenCloudinary } from "../api/taiLenApi";

export const useTaiLen = () => {
  // 1. Mutation để *xin chữ ký* từ backend (dùng apiPrivate)
  const { mutateAsync: layChuKy } = useMutation({
    mutationFn: layChuKyTaiLen,
    onError: () => toast.error("Không thể lấy chữ ký upload!"),
  });

  // 2. Mutation để *upload file* lên Cloudinary (dùng axios gốc)
  const { mutateAsync: taiFile, isLoading: dangTaiLen } = useMutation({
    mutationFn: ({ file, chuKyData }) => taiLenCloudinary(file, chuKyData),
  });

  /**
   * Hàm chính mà component sẽ gọi
   * @param {File} file - File object người dùng chọn
   * @returns {Promise<object|null>} - { url, public_id } hoặc null nếu lỗi
   */
  const taiAnhLen = async (file) => {
    try {
      // B1: Gọi hook 1 để xin chữ ký
      const chuKyData = await layChuKy();

      // B2: Gọi hook 2 để upload file
      const result = await taiFile({ file, chuKyData });

      // B3: Trả về dữ liệu chuẩn cho backend (theo schema HinhAnhSanPham.py)
      return {
        url: result.secure_url,
        public_id: result.public_id,
        alt_text: file.name,
        la_anh_dai_dien: false, // Mặc định
      };
    } catch (err) {
      toast.error(`Upload ảnh ${file.name} thất bại!`);
      console.error(err);
      return null;
    }
  };

  return { taiAnhLen, dangTaiLen };
};
