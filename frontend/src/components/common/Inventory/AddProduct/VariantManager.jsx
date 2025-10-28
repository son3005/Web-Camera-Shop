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
        readOnly
          ? "cursor-not-allowed bg-slate-200 dark:bg-slate-700/30"
          : ""
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
}) => {
  // --- MODE: READONLY (chỉ xem, không dùng hook form)
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
                  label="Màu sắc"
                  readOnly={true}
                  defaultValue={variant.color}
                />
                <FormInput
                  label="SKU"
                  readOnly={true}
                  defaultValue={variant.sku}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormInput
                  label="Giá nhập"
                  type="number"
                  readOnly={true}
                  defaultValue={variant.cost_price}
                />
                <FormInput
                  label="Giá bán"
                  type="number"
                  readOnly={true}
                  defaultValue={variant.selling_price}
                />
                <FormInput
                  label="Giá KM"
                  type="number"
                  readOnly={true}
                  defaultValue={variant.sale_price}
                />
              </div>
              <FormInput
                label="Tồn kho"
                type="number"
                readOnly={true}
                defaultValue={variant.stock}
              />
              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">
                  Hình ảnh
                </label>
                <VariantImageUpload images={variant.images || []} readOnly />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- MODE: EDIT (dùng react-hook-form)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "cac_bien_the", // 🔥 Đúng theo schema Yup
  });

  const handleAddVariant = () => {
    append({
      ten_bien_the: "",
      ma_sku: "",
      gia: 0,
      gia_khuyen_mai: 0,
      so_luong_ton_kho: 0,
      hinh_anhs: [],
    });
  };

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

            {/* --- Tên biến thể + SKU --- */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Tên biến thể"
                name={`cac_bien_the.${index}.ten_bien_the`}
                register={register}
                errors={errors?.cac_bien_the?.[index]?.ten_bien_the}
              />
              <FormInput
                label="SKU"
                name={`cac_bien_the.${index}.ma_sku`}
                register={register}
                errors={errors?.cac_bien_the?.[index]?.ma_sku}
              />
            </div>

            {/* --- Giá + Giá KM + Tồn kho --- */}
            <div className="grid grid-cols-3 gap-4">
              <FormInput
                label="Giá"
                type="number"
                name={`cac_bien_the.${index}.gia`}
                register={register}
                errors={errors?.cac_bien_the?.[index]?.gia}
              />
              <FormInput
                label="Giá KM"
                type="number"
                name={`cac_bien_the.${index}.gia_khuyen_mai`}
                register={register}
                errors={errors?.cac_bien_the?.[index]?.gia_khuyen_mai}
              />
              <FormInput
                label="Tồn kho"
                type="number"
                name={`cac_bien_the.${index}.so_luong_ton_kho`}
                register={register}
                errors={errors?.cac_bien_the?.[index]?.so_luong_ton_kho}
              />
            </div>

            {/* --- Upload ảnh --- */}
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">
                Hình ảnh
              </label>
              <Controller
                name={`cac_bien_the.${index}.hinh_anhs`}
                control={control}
                defaultValue={[]}
                render={({ field: { onChange, value } }) => (
                  <VariantImageUpload
                    control={control}
                    name={`cac_bien_the.${index}.hinh_anhs`}
                    images={value || []}
                    onChange={onChange}
                  />
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddVariant}
        className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-lg text-white 
                   bg-gradient-to-br from-emerald-500 to-cyan-600 hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-emerald-500/30"
      >
        <Plus size={20} /> Thêm Biến thể
      </button>
    </div>
  );
};

export default VariantManager;
