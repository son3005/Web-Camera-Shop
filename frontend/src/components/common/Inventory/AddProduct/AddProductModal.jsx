import React, { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { X, LoaderCircle } from "lucide-react";

import { useSanPhamChiTiet } from "../../../../hooks/useSanPham";
import { useTaoSanPham, useCapNhatSanPham } from "../../../../hooks/useSanphamBienDoi";
import { useTaiLen } from "../../../../hooks/useTaiLen";

import VariantManager from "./VariantManager";
import PropertyForm from "./PropertyForm";
import DescriptionEditor from "./DescriptionEditor";

// --- Constants ---
const BRANDS = [
  { value: 1, label: "Sony" },
  { value: 2, label: "Canon" },
  { value: 3, label: "Nikon" },
  { value: 4, label: "Fujifilm" },
  { value: 5, label: "Panasonic" },
  { value: 6, label: "Leica" },
];

const CATEGORIES = [
  { value: 1, label: "Máy ảnh Mirrorless" },
  { value: 2, label: "Ống kính" },
  { value: 3, label: "Máy ảnh DSLR" },
  { value: 4, label: "Phụ kiện" },
];

const StatusToggle = ({ label, enabled, onChange, readOnly }) => (
  <div>
    <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-300">
      {label}
    </label>
    <button
      type="button"
      onClick={() => !readOnly && onChange(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
        enabled ? "bg-blue-600" : "bg-gray-400 dark:bg-gray-600"
      } ${readOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      disabled={readOnly}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

// --- Schema ---
const productSchema = yup.object().shape({
  ten_san_pham: yup.string().required("Tên sản phẩm là bắt buộc").min(5, "Tên quá ngắn"),
  mo_ta: yup.string().required("Mô tả là bắt buộc"),
  thuong_hieu_id: yup
    .number()
    .positive("Thương hiệu không hợp lệ")
    .required("Vui lòng chọn thương hiệu"),
  danh_muc_id: yup
    .number()
    .positive("Danh mục không hợp lệ")
    .required("Vui lòng chọn danh mục"),
  trang_thai: yup.string().oneOf(["DANG_BAN", "AN", "HET_HANG"]).default("DANG_BAN"),
  dac_diem_noi_bat: yup.array().of(yup.string()).nullable(),
  thong_so_ky_thuat: yup.object().nullable(),
  cac_bien_the: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.number().nullable(),
        ten_bien_the: yup.string().required("Tên biến thể là bắt buộc"),
        gia: yup
          .number()
          .typeError("Giá phải là số")
          .positive("Giá phải lớn hơn 0")
          .required("Giá là bắt buộc"),
        gia_khuyen_mai: yup
          .number()
          .typeError("Giá phải là số")
          .nullable()
          .positive("Giá phải lớn hơn 0")
          .lessThan(yup.ref("gia"), "Giá khuyến mãi phải nhỏ hơn giá gốc"),
        ma_sku: yup.string().required("SKU là bắt buộc"),
        so_luong_ton_kho: yup
          .number()
          .typeError("Số lượng phải là số")
          .integer("Số lượng phải là số nguyên")
          .min(0, "Số lượng không thể âm")
          .required("Số lượng là bắt buộc"),
        hinh_anhs: yup
          .mixed()
          .test("required", "Cần ít nhất 1 ảnh", (value) => value && value.length > 0),
      })
    )
    .min(1, "Cần ít nhất 1 biến thể"),
});

// ==========================================================
// COMPONENT CHÍNH
// ==========================================================
const AddProductModal = ({ mode = "add", product, onClose }) => {
  const {
    data: productDetails,
    isLoading: isLoadingDetails,
    isError,
  } = useSanPhamChiTiet(mode === "edit" ? product.id : null, {
    enabled: mode === "edit" && !!product?.id,
  });

  const { mutate: taoSanPham, isPending: isTaoPending } = useTaoSanPham();
  const { mutate: capNhatSanPham, isPending: isCapNhatPending } = useCapNhatSanPham();
  const { taiAnhLen, dangTaiLen } = useTaiLen();

  const isSubmitting = isTaoPending || isCapNhatPending || dangTaiLen;

  // ================== useForm ==================
  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      ten_san_pham: "",
      mo_ta: "",
      thuong_hieu_id: "",
      danh_muc_id: "",
      trang_thai: "DANG_BAN",
      dac_diem_noi_bat: [""],
      thong_so_ky_thuat: {},
      cac_bien_the: [],
    },
  });

  // ================== useFieldArray cho biến thể ==================
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "cac_bien_the",
  });

  // ================== Reset khi edit ==================
  useEffect(() => {
    if (mode === "edit" && productDetails) {
      const defaultValues = {
        ten_san_pham: productDetails.ten_san_pham,
        mo_ta: productDetails.mo_ta,
        thuong_hieu_id: productDetails.thuong_hieu.id,
        danh_muc_id: productDetails.danh_muc.id,
        trang_thai: productDetails.trang_thai,
        dac_diem_noi_bat: productDetails.dac_diem_noi_bat || [""],
        thong_so_ky_thuat: productDetails.thong_so_ky_thuat || {},
        cac_bien_the:
          productDetails.cac_bien_the?.map((v) => ({
            id: v.id,
            ten_bien_the: v.ten_bien_the,
            gia: v.gia,
            gia_khuyen_mai: v.gia_khuyen_mai,
            ma_sku: v.ma_sku,
            so_luong_ton_kho: v.so_luong_ton_kho,
            hinh_anhs: v.hinh_anhs.map((img) => ({
              id: img.id,
              url: img.url,
              public_id: img.public_id,
              la_anh_dai_dien: img.la_anh_dai_dien,
            })),
          })) || [],
      };
      reset(defaultValues);
    }
  }, [mode, productDetails, reset]);

  // ================== Submit ==================
  const onSubmit = async (data) => {
    console.log("Dữ liệu form (thô):", data);

    let finalData = { ...data };

    try {
      const processedVariants = await Promise.all(
        data.cac_bien_the.map(async (variant) => {
          const uploadedImages = await Promise.all(
            variant.hinh_anhs.map(async (image) => {
              if (image instanceof File) {
                return taiAnhLen(image);
              } else return image;
            })
          );
          const hasAvatar = uploadedImages.some((img) => img.la_anh_dai_dien);
          if (uploadedImages.length > 0 && !hasAvatar) {
            uploadedImages[0].la_anh_dai_dien = true;
          }
          return { ...variant, hinh_anhs: uploadedImages };
        })
      );

      finalData.cac_bien_the = processedVariants;
      console.log("Dữ liệu đã xử lý:", finalData);

      if (mode === "add") {
        taoSanPham(finalData, {
          onSuccess: () => {
            toast.success("Thêm sản phẩm thành công!");
            onClose();
          },
          onError: (err) => toast.error(err.message || "Lỗi khi thêm sản phẩm"),
        });
      } else {
        capNhatSanPham(
          { id: product.id, data: finalData },
          {
            onSuccess: () => {
              toast.success("Cập nhật sản phẩm thành công!");
              onClose();
            },
            onError: (err) => toast.error(err.message || "Lỗi khi cập nhật sản phẩm"),
          }
        );
      }
    } catch (uploadError) {
      console.error("Lỗi upload ảnh:", uploadError);
      toast.error(uploadError.message || "Lỗi khi upload ảnh. Vui lòng thử lại.");
    }
  };

  // ================== UI ==================
  if (mode === "edit" && isLoadingDetails) return <div>Đang tải...</div>;
  if (mode === "edit" && isError) return <div>Lỗi tải sản phẩm</div>;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-black/10 dark:border-white/10 sticky top-0 bg-slate-200/60 dark:bg-slate-800/70 backdrop-blur-xl z-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === "add" ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          {/* Thông tin chung */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột trái */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-300">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  {...register("ten_san_pham")}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <p className="text-red-500 text-xs mt-1 h-4">
                  {errors.ten_san_pham?.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-300">
                    Thương hiệu
                  </label>
                  <select
                    {...register("thuong_hieu_id")}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
                  >
                    <option value="">Chọn thương hiệu</option>
                    {BRANDS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-red-500 text-xs mt-1 h-4">
                    {errors.thuong_hieu_id?.message}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-300">
                    Danh mục
                  </label>
                  <select
                    {...register("danh_muc_id")}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
                  >
                    <option value="">Chọn danh mục</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-red-500 text-xs mt-1 h-4">
                    {errors.danh_muc_id?.message}
                  </p>
                </div>
              </div>

              <div>
                <Controller
                  name="trang_thai"
                  control={control}
                  render={({ field }) => (
                    <StatusToggle
                      label="Trạng thái"
                      enabled={field.value === "DANG_BAN"}
                      onChange={(enabled) =>
                        field.onChange(enabled ? "DANG_BAN" : "AN")
                      }
                      readOnly={field.value === "HET_HANG"}
                    />
                  )}
                />
              </div>
            </div>

            {/* Cột phải */}
            <div className="space-y-5">
              <Controller
                name="thong_so_ky_thuat"
                control={control}
                render={({ field }) => (
                  <PropertyForm
                    title="Thông số kỹ thuật"
                    properties={field.value || {}}
                    onChange={field.onChange}
                    control={control}
                  />
                )}
              />
            </div>
          </div>

          {/* Quản lý biến thể */}
          <div className="p-6 pt-0">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-300">
              Quản lý Biến thể & Hình ảnh
            </h3>
            <VariantManager
              control={control}
              fields={fields}
              append={append}
              remove={remove}
              update={update}
            />
            <p className="text-red-500 text-xs mt-1 h-4">
              {errors.cac_bien_the?.message}
            </p>
          </div>

          {/* Mô tả sản phẩm */}
          <div className="p-6 pt-0">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-300">
              Mô tả chi tiết
            </h3>
            <Controller
              name="mo_ta"
              control={control}
              render={({ field }) => (
                <DescriptionEditor value={field.value} onChange={field.onChange} />
              )}
            />
            <p className="text-red-500 text-xs mt-1 h-4">{errors.mo_ta?.message}</p>
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-4 p-5 border-t border-black/10 dark:border-white/10 sticky bottom-0 bg-slate-200/60 dark:bg-slate-800/70 backdrop-blur-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-transform duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <LoaderCircle className="animate-spin" size={18} />}
              {isSubmitting
                ? dangTaiLen
                  ? "Đang upload ảnh..."
                  : "Đang lưu..."
                : mode === "add"
                ? "Thêm sản phẩm"
                : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
