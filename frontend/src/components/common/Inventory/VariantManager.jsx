// src/components/common/Inventory/VariantManager.jsx

import React from "react";
import { useFieldArray, Controller } from "react-hook-form";
import VariantImageUpload from "./VariantImageUpload";
import { Trash2, Plus } from "lucide-react";

/**
 * Input thường dùng trong form biến thể
 */
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
    <label className="block text-sm font-medium text-slate-800 mb-1">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      readOnly={readOnly}
      defaultValue={readOnly ? defaultValue : undefined}
      {...(register ? register(name) : {})}
      className={`w-full rounded-lg px-3 py-2 text-sm transition-all bg-white/90 border ${
        errors
          ? "border-red-500 focus:ring-red-500"
          : "border-slate-200 focus:ring-emerald-500"
      } focus:outline-none focus:ring-2 placeholder:text-slate-500 ${
        readOnly ? "cursor-not-allowed bg-slate-100" : ""
      }`}
    />
    {errors && (
      <p className="text-red-500 text-xs mt-1 h-4">{errors.message}</p>
    )}
  </div>
);

// Map trạng thái raw -> nhãn tiếng Việt
const getStatusLabel = (raw) => {
  if (typeof raw === "boolean") return raw ? "Đang bán" : "Ngừng bán";
  if (typeof raw === "string") {
    const v = raw.trim().toUpperCase();
    if (["DANG_BAN", "DANGBAN", "ACTIVE", "DANG_BAN"].includes(v))
      return "Đang bán";
    if (["SAP_BAN", "SAPBAN", "COMING_SOON"].includes(v)) return "Sắp bán";
    if (["NGUNG_BAN", "AN", "INACTIVE"].includes(v)) return "Ngừng bán";
  }
  return "Ngừng bán";
};

// Tính tồn kho một biến thể
const getVariantStock = (variant) => {
  if (!variant) return 0;

  // Ưu tiên các field tồn kho trực tiếp nếu có
  if (typeof variant.so_luong_ton === "number") return variant.so_luong_ton;
  if (typeof variant.so_luong === "number") return variant.so_luong;
  if (typeof variant.ton_kho === "number") return variant.ton_kho;
  if (typeof variant.stock === "number") return variant.stock;

  // Fallback: nhập - bán
  const nhap = Number(variant.so_luong_nhap ?? 0);
  const ban = Number(variant.so_luong_ban ?? 0);
  const q = nhap - ban;
  return q > 0 ? q : 0;
};

/**
 * Quản lý danh sách biến thể sản phẩm
 *
 * - readOnly: hiển thị danh sách biến thể (trong ProductDetailModal)
 * - không readOnly: dùng cho Add/Edit product trong AddProductModal
 */
const VariantManager = ({
  control,
  register,
  errors,
  defaultVariants,
  readOnly = false,
  uploadProgress,
  placeholderImage,
  onDeleteExistingVariant,
}) => {
  // ===== READ ONLY MODE =====
  if (readOnly) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Các biến thể</h3>
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 -mr-4 scrollbar-thin">
          {(defaultVariants || []).map((variant, index) => (
            <div
              key={variant.id || index}
              className="p-4 rounded-2xl bg-slate-50/90 backdrop-blur-sm border border-slate-200 space-y-4 shadow-sm"
            >
              <h4 className="font-bold text-slate-700">
                Biến thể #{index + 1}
              </h4>

              {/* Tên + trạng thái */}
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Tên biến thể"
                  readOnly={true}
                  defaultValue={variant.ten_bien_the}
                />
                <FormInput
                  label="Trạng thái"
                  readOnly={true}
                  defaultValue={getStatusLabel(variant.trang_thai_kich_hoat)}
                />
              </div>

              {/* Giá + tồn kho */}
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Giá bán"
                  type="number"
                  readOnly={true}
                  defaultValue={variant.gia_ban}
                />
                <FormInput
                  label="Số lượng tồn"
                  type="number"
                  readOnly={true}
                  defaultValue={getVariantStock(variant)}
                />
              </div>

              {/* Hình ảnh */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">
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

  // ===== EDIT / ADD MODE =====
  const { fields, append, remove } = useFieldArray({
    control,
    name: "bien_the_san_phams",
  });

  const handleAddVariant = () => {
    append({
      ten_bien_the: "",
      gia_ban: 0,
      trang_thai_kich_hoat: "dang_ban",
      mau: "",
      hinh_anhs: [],
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">Các biến thể</h3>

      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 -mr-4 scrollbar-thin">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 rounded-2xl bg-slate-50/90 backdrop-blur-sm border border-slate-200 space-y-4 shadow-sm"
          >
            {/* Header mỗi biến thể */}
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-700">
                Biến thể #{index + 1}
              </h4>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const maybeId = field?.id_in_db || field?.id;
                    // Lưu id biến thể đã tồn tại để gửi lên backend xoá
                    if (maybeId && onDeleteExistingVariant) {
                      onDeleteExistingVariant(maybeId);
                    }
                    remove(index);
                  }}
                  className="p-1.5 rounded-full text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {/* Hàng 1: tên + màu */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Tên biến thể"
                name={`bien_the_san_phams.${index}.ten_bien_the`}
                register={register}
                errors={errors?.bien_the_san_phams?.[index]?.ten_bien_the}
              />
              <FormInput
                label="Màu"
                name={`bien_the_san_phams.${index}.mau`}
                register={register}
                errors={errors?.bien_the_san_phams?.[index]?.mau}
              />
            </div>

            {/* Hàng 2: giá + trạng thái */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Giá bán"
                type="number"
                name={`bien_the_san_phams.${index}.gia_ban`}
                register={register}
                errors={errors?.bien_the_san_phams?.[index]?.gia_ban}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-800 mb-1">
                  Trạng thái
                </label>
                <Controller
                  name={`bien_the_san_phams.${index}.trang_thai_kich_hoat`}
                  control={control}
                  defaultValue={field.trang_thai_kich_hoat || "dang_ban"}
                  render={({ field: stField }) => (
                    <select
                      {...stField}
                      className="w-full px-3 py-2 rounded-lg text-sm bg-white/90 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 cursor-pointer"
                    >
                      <option value="dang_ban">Đang bán</option>
                      <option value="sap_ban">Sắp bán</option>
                      <option value="ngung_ban">Ngừng bán</option>
                    </select>
                  )}
                />
              </div>
            </div>

            {/* Hình ảnh */}
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-2">
                Hình ảnh
              </label>
              <Controller
                name={`bien_the_san_phams.${index}.hinh_anhs`}
                control={control}
                defaultValue={[]}
                render={({ field: { value, onChange } }) => (
                  <VariantImageUpload
                    images={value || []}
                    onChange={onChange}
                    uploadProgress={uploadProgress}
                    placeholderImage={placeholderImage}
                  />
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Nút thêm biến thể */}
      <button
        type="button"
        onClick={handleAddVariant}
        className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-lg text-white bg-gradient-to-br from-emerald-500 to-cyan-600 hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-emerald-500/30 cursor-pointer"
      >
        <Plus size={20} /> Thêm Biến thể
      </button>
    </div>
  );
};

export default VariantManager;
