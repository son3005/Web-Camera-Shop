// src/components/common/Inventory/AddProduct/VariantManager.jsx
import React from "react";
import { useFieldArray, Controller } from "react-hook-form";
import VariantImageUpload from "./VariantImageUpload";
import { Trash2, Plus } from "lucide-react";

const FormInput = ({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder,
  readOnly,
  defaultValue,
}) => (
  <div className="flex-1 min-w-[120px]">
    <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      readOnly={readOnly}
      defaultValue={readOnly ? defaultValue : undefined}
      {...(register ? register(name) : {})}
      className={`w-full rounded-lg px-3 py-2 text-sm transition-all bg-white/50 dark:bg-slate-700/50 border ${
        errors
          ? "border-red-500 focus:ring-red-500"
          : "border-black/10 dark:border-white/10 focus:ring-cyan-500"
      } focus:outline-none focus:ring-2 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
        readOnly ? "cursor-not-allowed bg-slate-200 dark:bg-slate-700/30" : ""
      }`}
    />
    {errors && (
      <p className="text-red-500 text-xs mt-1 h-4">{errors.message}</p>
    )}
  </div>
);

const DateInput = ({
  label,
  name,
  register,
  errors,
  readOnly,
  defaultValue,
}) => (
  <div className="flex-1 min-w-[120px]">
    <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
      {label}
    </label>
    <input
      type="datetime-local"
      readOnly={readOnly}
      defaultValue={readOnly ? defaultValue : undefined}
      {...(register ? register(name) : {})}
      className={`w-full rounded-lg px-3 py-2 text-sm transition-all bg-white/50 dark:bg-slate-700/50 border ${
        errors
          ? "border-red-500 focus:ring-red-500"
          : "border-black/10 dark:border-white/10 focus:ring-cyan-500"
      } focus:outline-none focus:ring-2 ${
        readOnly ? "cursor-not-allowed bg-slate-200 dark:bg-slate-700/30" : ""
      }`}
    />
    {errors && (
      <p className="text-red-500 text-xs mt-1 h-4">{errors.message}</p>
    )}
  </div>
);

const VariantManager = ({
  control,
  register,
  errors,
  defaultVariants,
  readOnly = false,
  uploadProgress,
  placeholderImage,
}) => {
  if (readOnly) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          Các biến thể
        </h3>
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 -mr-4 scrollbar-thin">
          {(defaultVariants || []).map((variant, index) => (
            <div
              key={variant.id || index}
              className="p-4 rounded-2xl bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm border border-white/20 dark:border-slate-600/50 space-y-4"
            >
              <h4 className="font-bold text-slate-700 dark:text-cyan-300">
                Biến thể #{index + 1}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Tên biến thể"
                  readOnly={true}
                  defaultValue={variant.ten_bien_the}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Giá bán"
                  type="number"
                  readOnly={true}
                  defaultValue={variant.gia_ban}
                />
                <FormInput
                  label="Giá khuyến mãi"
                  type="number"
                  readOnly={true}
                  defaultValue={variant.gia_khuyen_mai}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DateInput
                  label="Ngày bắt đầu KM"
                  readOnly={true}
                  defaultValue={variant.ngay_bat_dau_khuyen_mai}
                />
                <DateInput
                  label="Ngày kết thúc KM"
                  readOnly={true}
                  defaultValue={variant.ngay_ket_thuc_khuyen_mai}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <FormInput
                  label="Số lượng tồn"
                  type="number"
                  readOnly={true}
                  defaultValue={variant.so_luong_ton}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">
                  Hình ảnh
                </label>
                <VariantImageUpload
                  images={variant.hinh_anhs || []}
                  readOnly={true}
                  placeholderImage={placeholderImage}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bien_the_san_phams",
  });

  const handleAddVariant = () => {
    append({
      ten_bien_the: "",
      gia_ban: 0,
      gia_khuyen_mai: 0,
      ngay_bat_dau_khuyen_mai: "",
      ngay_ket_thuc_khuyen_mai: "",
      so_luong_ton: 0,
      trang_thai_kich_hoat: "dang_ban",
      hinh_anhs: [],
    });
  };

  console.log("VariantManager - Fields:", fields);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
        Các biến thể
      </h3>
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 -mr-4 scrollbar-thin">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 rounded-2xl bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm border border-white/20 dark:border-slate-600/50 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-700 dark:text-cyan-300">
                Biến thể #{index + 1}
              </h4>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1.5 rounded-full text-red-500 hover:bg-red-500/10 transition"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Tên biến thể"
                name={`bien_the_san_phams.${index}.ten_bien_the`}
                register={register}
                errors={errors?.bien_the_san_phams?.[index]?.ten_bien_the}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Giá bán"
                type="number"
                name={`bien_the_san_phams.${index}.gia_ban`}
                register={register}
                errors={errors?.bien_the_san_phams?.[index]?.gia_ban}
              />
              <FormInput
                label="Giá khuyến mãi"
                type="number"
                name={`bien_the_san_phams.${index}.gia_khuyen_mai`}
                register={register}
                errors={errors?.bien_the_san_phams?.[index]?.gia_khuyen_mai}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DateInput
                label="Ngày bắt đầu KM"
                name={`bien_the_san_phams.${index}.ngay_bat_dau_khuyen_mai`}
                register={register}
                errors={
                  errors?.bien_the_san_phams?.[index]?.ngay_bat_dau_khuyen_mai
                }
              />
              <DateInput
                label="Ngày kết thúc KM"
                name={`bien_the_san_phams.${index}.ngay_ket_thuc_khuyen_mai`}
                register={register}
                errors={
                  errors?.bien_the_san_phams?.[index]?.ngay_ket_thuc_khuyen_mai
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormInput
                label="Số lượng tồn"
                type="number"
                name={`bien_the_san_phams.${index}.so_luong_ton`}
                register={register}
                errors={errors?.bien_the_san_phams?.[index]?.so_luong_ton}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">
                Hình ảnh
              </label>
              <Controller
                name={`bien_the_san_phams.${index}.hinh_anhs`}
                control={control}
                defaultValue={[]}
                render={({ field: { value, onChange } }) => {
                  console.log(
                    `VariantManager - Controller for variant ${index}:`,
                    value
                  );
                  return (
                    <VariantImageUpload
                      images={value || []}
                      onChange={(newImages) => {
                        console.log(
                          `VariantManager - Images changed for variant ${index}:`,
                          newImages
                        );
                        onChange(newImages);
                      }}
                      uploadProgress={uploadProgress}
                      placeholderImage={placeholderImage}
                    />
                  );
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAddVariant}
        className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-lg text-white bg-gradient-to-br from-emerald-500 to-cyan-600 hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-emerald-500/30"
      >
        <Plus size={20} /> Thêm Biến thể
      </button>
    </div>
  );
};

export default VariantManager;
