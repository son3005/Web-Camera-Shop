// src/components/admin/BienTheHinhAnhUploader.jsx
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useTaiLen } from "../../../hooks/useTaiLen"; //
import { Upload, X, Star, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

/**
 * Component quản lý hình ảnh cho MỘT biến thể.
 * Nó được dùng BÊN TRONG FormProvider của SanPhamForm.
 * @param {{ bienTheIndex: number }} props
 */
export const BienTheHinhAnhUploader = ({ bienTheIndex }) => {
  const { control, setValue, watch } = useFormContext();
  const fieldName = `bien_the_san_phams.${bienTheIndex}.hinh_anhs`;

  // Đây là một useFieldArray lồng (nested)
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });

  // Watch để lấy ra mảng ảnh hiện tại (cần cho logic set ảnh đại diện)
  const currentImages = watch(fieldName) || [];

  const taiLenMutation = useTaiLen(); //

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    toast.info(`Đang tải lên ${files.length} ảnh...`);

    try {
      // Gọi mutation cho từng file và đợi tất cả
      const uploadPromises = files.map((file) =>
        taiLenMutation.mutateAsync(file),
      );

      const results = await Promise.all(uploadPromises);

      // Lấy dữ liệu ảnh trả về từ hook useTaiLen
      const newImages = results.map((data, index) => ({
        url: data.url,
        public_id: data.public_id,
        alt_text: data.alt_text,
        // Nếu mảng ảnh đang trống, tự động đặt ảnh đầu tiên làm đại diện
        la_anh_dai_dien: currentImages.length === 0 && index === 0,
      }));

      append(newImages); // Thêm các ảnh mới vào React Hook Form
      toast.success("Tải lên thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải ảnh.");
      console.error(error);
    }
  };

  // Hàm để đặt một ảnh làm ảnh đại diện
  const setAnhDaiDien = (imageIndex) => {
    // 1. Reset tất cả ảnh về `false`
    currentImages.forEach((_, idx) => {
      setValue(`${fieldName}.${idx}.la_anh_dai_dien`, false);
    });
    // 2. Đặt ảnh được chọn là `true`
    setValue(`${fieldName}.${imageIndex}.la_anh_dai_dien`, true);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Hình ảnh biến thể
      </label>
      {/* Hiển thị ảnh đã upload */}
      <div className="grid grid-cols-4 gap-2">
        {fields.map((field, index) => (
          <div key={field.id} className="relative group border rounded-md">
            <img
              src={field.url}
              alt={field.alt_text}
              className="w-full h-24 object-cover rounded-md"
            />
            {/* Nút Xóa (remove) */}
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute top-0 right-0 p-0.5 bg-red-600 text-white rounded-bl-md opacity-70 group-hover:opacity-100"
            >
              <X size={16} />
            </button>
            {/* Nút Đặt làm đại diện */}
            <button
              type="button"
              onClick={() => setAnhDaiDien(index)}
              className={`absolute bottom-0 left-0 p-0.5 rounded-tr-md opacity-70 group-hover:opacity-100 ${
                field.la_anh_dai_dien
                  ? "bg-yellow-400 text-white"
                  : "bg-gray-500 text-white"
              }`}
              title="Đặt làm ảnh đại diện"
            >
              <Star size={16} />
            </button>
          </div>
        ))}

        {/* Ô để upload ảnh mới */}
        <label className="flex flex-col justify-center items-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
          {taiLenMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Upload size={24} className="text-gray-400" />
          )}
          <span className="text-xs text-gray-500">Thêm ảnh</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={taiLenMutation.isPending}
          />
        </label>
      </div>
    </div>
  );
};