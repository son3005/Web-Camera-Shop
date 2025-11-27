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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 rounded-3xl p-5 shadow-2xl border border-slate-200/70 dark:border-slate-700/70">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {defaultValues ? "Cập nhật danh mục" : "Thêm danh mục"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-4">
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              Mã danh mục (tối đa 5 ký tự) *
            </label>
            <input
              className="w-full mt-1 px-3 py-2 rounded-lg bg-white/80 border border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-inner
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500
                         dark:bg-slate-900/60 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
              {...register("ma_danh_muc")}
              maxLength={5}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              Tên danh mục *
            </label>
            <input
              className="w-full mt-1 px-3 py-2 rounded-lg bg-white/80 border border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-inner
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500
                         dark:bg-slate-900/60 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
              {...register("ten_danh_muc")}
              maxLength={100}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer
                         dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:from-emerald-400 hover:to-slate-500 shadow-md hover:shadow-lg cursor-pointer"
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
