// src/components/common/settings/CategoryFormModal.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

const CategoryFormModal = ({ open, onClose, onSubmit, defaultValues }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: defaultValues ?? { ma_danh_muc: "", ten_danh_muc: "" },
  });

  React.useEffect(() => {
    reset(defaultValues ?? { ma_danh_muc: "", ten_danh_muc: "" });
  }, [defaultValues, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 text-slate-100 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {defaultValues ? "Cập nhật danh mục" : "Thêm danh mục"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-3">
          <div>
            <label className="text-sm">Mã danh mục (tối đa 5 ký tự) *</label>
            <input
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-700"
              {...register("ma_danh_muc")}
              maxLength={5}
              required
            />
          </div>
          <div>
            <label className="text-sm">Tên danh mục *</label>
            <input
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-700"
              {...register("ten_danh_muc")}
              maxLength={100}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-600"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
            >
              {defaultValues ? "Lưu" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
