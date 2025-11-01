// src/pages/admin/SanPhamForm.jsx (Phiên bản đã hoàn thiện TODOs)
import React, { useEffect, useState } from "react";
import {
  useForm,
  useFieldArray,
  FormProvider,
  Controller,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  sanPhamCreateSchema,
  sanPhamUpdateSchema,
} from "../../validation/sanPhamSchemas"; //
import {
  useSanPhamChiTiet,
  useTaoSanPham,
  useCapNhatSanPham,
  // === TODO 1: Import các hooks biến thể ===
  useTaoBienThe,
  useCapNhatBienThe,
  useXoaBienThe,
} from "../../hooks/useSanPham"; //
import { useDanhMucs, useThuongHieus } from "../../hooks/useCatalogs"; //
import { ThongSoKyThuatView } from "../../components/common/admin/ThongSoKyThuatView";
// === TODO 2: Import component Upload ảnh ===
import { BienTheHinhAnhUploader } from "../../components/common/admin/BienTheHinhAnhUploader";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { get } from "lodash";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react"; // Thêm icon loading

// --- (Giữ nguyên các component FormInput, FormSelect) ---
const FormInput = ({ label, name, register, errors, ...rest }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={name}
      {...register(name)}
      {...rest}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
    />
    {errors[name] && <p className="text-red-500 text-sm">{errors[name].message}</p>}
  </div>
);

const FormSelect = ({ label, name, register, errors, children, ...rest }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      id={name}
      {...register(name)}
      {...rest}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
    >
      {children}
    </select>
    {errors[name] && <p className="text-red-500 text-sm">{errors[name].message}</p>}
  </div>
);
// --- (Hết phần component con) ---

export const SanPhamForm = ({ sanPhamId, onClose }) => {
  const isEdit = !!sanPhamId;

  // --- 1. State ---
  // Lưu data gốc khi Sửa, dùng để so sánh (diff)
  const [originalData, setOriginalData] = useState(null);
  // State loading cho nút submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 2. Data Fetching ---
  const { data: danhMucs } = useDanhMucs({ per_page: 999 });
  const { data: thuongHieus } = useThuongHieus({ per_page: 999 });
  const { data: sanPhamHienTai, isLoading: isLoadingSanPham } =
    useSanPhamChiTiet(sanPhamId, { enabled: isEdit });

  // --- 3. Mutations ---
  const taoSanPhamMutation = useTaoSanPham();
  const capNhatSanPhamMutation = useCapNhatSanPham();
  // Mutations cho biến thể
  const taoBienTheMutation = useTaoBienThe();
  const capNhatBienTheMutation = useCapNhatBienThe();
  const xoaBienTheMutation = useXoaBienThe();

  // --- 4. Form Setup ---
  const methods = useForm({
    resolver: yupResolver(isEdit ? sanPhamUpdateSchema : sanPhamCreateSchema),
    defaultValues: {
      ten_san_pham: "",
      ma_san_pham: "",
      danh_muc_id: "",
      thuong_hieu_id: "",
      mo_ta: "",
      trang_thai: "DANG_BAN",
      thong_so_ky_thuat: {},
      bien_the_san_phams: [], // Sẽ được reset ở useEffect
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, dirtyFields }, // Dùng dirtyFields
  } = methods;

  // --- 5. Field Array ---
  const { fields, append, remove } = useFieldArray({
    control,
    name: "bien_the_san_phams",
  });

  // --- 6. Effect (Load data vào form) ---
  useEffect(() => {
    if (isEdit && sanPhamHienTai) {
      const formData = {
        ...sanPhamHienTai,
        bien_the_san_phams: sanPhamHienTai.cac_bien_the, // Đổi tên từ response
        danh_muc_id: String(sanPhamHienTai.danh_muc_id),
        thuong_hieu_id: String(sanPhamHienTai.thuong_hieu_id),
      };
      reset(formData);
      setOriginalData(formData); // Lưu data gốc để so sánh
    } else if (!isEdit) {
      // Khi Thêm Mới, tự động thêm 1 biến thể mặc định
      append({
        ten_bien_the: "Mặc định",
        gia_ban: 0,
        gia_khuyen_mai: null,
        so_luong_ton: 0,
        hinh_anhs: [],
      });
    }
    // `append` được thêm vào dependencies
  }, [isEdit, sanPhamHienTai, reset, append]);

  // --- 7. Submit Handler (Đã fix TODOs) ---
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (isEdit) {
        // ===================================
        // LOGIC SỬA (UPDATE) - PHỨC TẠP
        // ===================================

        // --- B1: Cập nhật thông tin sản phẩm chung ---
        const productChanges = {};
        // Lấy các trường đã thay đổi ở level 1 (dùng dirtyFields)
        Object.keys(dirtyFields).forEach((key) => {
          if (key !== "bien_the_san_phams" && key !== "thong_so_ky_thuat") {
            productChanges[key] = data[key];
          }
        });

        // Lấy các trường đã thay đổi trong thong_so_ky_thuat
        if (dirtyFields.thong_so_ky_thuat) {
          const specChanges = {};
          Object.keys(dirtyFields.thong_so_ky_thuat).forEach((key) => {
            specChanges[key] = get(data.thong_so_ky_thuat, key);
          });
          productChanges.thong_so_ky_thuat = specChanges;
        }

        // Chỉ gọi API nếu có thay đổi
        if (Object.keys(productChanges).length > 0) {
          await capNhatSanPhamMutation.mutateAsync({
            sanPhamId,
            sanPhamData: productChanges,
          });
        }

        // --- B2: Xử lý Biến Thể (TODO 1) ---
        // Chỉ xử lý nếu mảng biến thể có thay đổi
        if (dirtyFields.bien_the_san_phams) {
          const originalVariants = originalData?.bien_the_san_phams || [];
          const newVariants = data.bien_the_san_phams || [];

          const originalIds = originalVariants.map((v) => v.id);
          const newIds = newVariants.map((v) => v.id).filter(Boolean); // Lọc ra các ID (loại bỏ undefined)

          const toCreate = [];
          const toUpdate = [];
          // Các ID có trong mảng gốc, nhưng không có trong mảng mới -> Xóa
          const toDelete = originalIds.filter((id) => !newIds.includes(id));

          newVariants.forEach((variant, index) => {
            if (!variant.id) {
              // Không có ID -> Tạo mới
              toCreate.push(variant);
            } else if (dirtyFields.bien_the_san_phams[index]) {
              // Có ID và bị "dirty" (thay đổi) -> Cập nhật
              toUpdate.push(variant);
            }
          });

          // Thực thi các mutations (dùng Promise.allSettled để đảm bảo chạy hết)
          const tasks = [];

          toCreate.forEach((v) =>
            tasks.push(
              taoBienTheMutation.mutateAsync({ sanPhamId, bienTheData: v }),
            ),
          );

          toUpdate.forEach((v) =>
            tasks.push(
              capNhatBienTheMutation.mutateAsync({
                bienTheId: v.id,
                bienTheData: v,
              }),
            ),
          );

          toDelete.forEach((id) =>
            tasks.push(xoaBienTheMutation.mutateAsync(id)),
          );

          const results = await Promise.allSettled(tasks);

          // (Tùy chọn) Báo lỗi nếu có
          results.forEach((result) => {
            if (result.status === "rejected") {
              toast.error(`Lỗi khi xử lý biến thể: ${result.reason?.message}`);
            }
          });
        }
      } else {
        // ===================================
        // LOGIC THÊM MỚI (CREATE) - ĐƠN GIẢN
        // ===================================
        await taoSanPhamMutation.mutateAsync(data);
      }

      toast.success(isEdit ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!");
      onClose(); // Đóng modal
    } catch (error) {
      toast.error(`Thao tác thất bại: ${error.message}`);
    } finally {
      setIsSubmitting(false); // Luôn tắt loading
    }
  };

  if (isLoadingSanPham) return <div>Đang tải dữ liệu form...</div>;

  return (
    // Bọc FormProvider để các component con (ThongSoKyThuatView, BienTheHinhAnhUploader)
    // có thể dùng `useFormContext`
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Phần Thông tin chung (Giữ nguyên) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Tên Sản Phẩm"
            name="ten_san_pham"
            register={register}
            errors={errors}
          />
          <FormInput
            label="Mã Sản Phẩm"
            name="ma_san_pham"
            register={register}
            errors={errors}
            disabled={isEdit}
          />
          <FormSelect
            label="Danh mục"
            name="danh_muc_id"
            register={register}
            errors={errors}
          >
            <option value="">Chọn danh mục</option>
            {danhMucs?.data.map((dm) => (
              <option key={dm.id} value={dm.id}>
                {dm.ten_danh_muc}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            label="Thương hiệu"
            name="thuong_hieu_id"
            register={register}
            errors={errors}
          >
            <option value="">Chọn thương hiệu</option>
            {thuongHieus?.data.map((th) => (
              <option key={th.id} value={th.id}>
                {th.ten_thuong_hieu}
              </option>
            ))}
          </FormSelect>
        </div>

        {/* --- Phần Mô tả (Giữ nguyên) --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <Controller
            name="mo_ta"
            control={control}
            render={({ field }) => (
              <ReactQuill
                theme="snow"
                value={field.value}
                onChange={field.onChange}
                className="bg-white"
              />
            )}
          />
        </div>

        {/* --- Phần Thông số kỹ thuật (Giữ nguyên) --- */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Thông số kỹ thuật</h3>
          <ThongSoKyThuatView />
        </div>

        {/* === Quản lý Biến Thể (Đã tích hợp TODO 2) === */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Biến Thể Sản Phẩm</h3>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border p-4 rounded-md space-y-3 bg-gray-50"
              >
                {/* Tên biến thể & Nút Xóa */}
                <div className="flex justify-between items-center">
                  <FormInput
                    label={`Tên biến thể ${index + 1}`}
                    name={`bien_the_san_phams.${index}.ten_bien_the`}
                    register={register}
                    errors={errors}
                    placeholder="Vd: Body Only, Kit 24-70mm..."
                    className="!mt-0" // Ghi đè margin top của FormInput
                  />
                  {/* Chỉ cho xóa nếu có nhiều hơn 1 biến thể */}
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800 text-sm mt-5 ml-4"
                    >
                      Xóa Biến Thể
                    </button>
                  )}
                </div>

                {/* Giá & Tồn kho */}
                <div className="grid grid-cols-3 gap-2">
                  <FormInput
                    label="Giá bán"
                    name={`bien_the_san_phams.${index}.gia_ban`}
                    register={register}
                    errors={errors}
                    type="number"
                  />
                  <FormInput
                    label="Giá khuyến mãi"
                    name={`bien_the_san_phams.${index}.gia_khuyen_mai`}
                    register={register}
                    errors={errors}
                    type="number"
                  />
                  <FormInput
                    label="Số lượng tồn"
                    name={`bien_the_san_phams.${index}.so_luong_ton`}
                    register={register}
                    errors={errors}
                    type="number"
                  />
                </div>

                {/* === TÍCH HỢP TODO 2 === */}
                <BienTheHinhAnhUploader bienTheIndex={index} />
              </div>
            ))}
            {/* Nút thêm biến thể mới */}
            <button
              type="button"
              onClick={() =>
                append({
                  ten_bien_the: "",
                  gia_ban: 0,
                  gia_khuyen_mai: null,
                  so_luong_ton: 0,
                  hinh_anhs: [],
                })
              }
              className="bg-green-500 text-white px-3 py-1 rounded shadow"
            >
              Thêm Biến Thể Mới
            </button>
          </div>
        </div>

        {/* Nút Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-2 disabled:opacity-50"
            disabled={isSubmitting} // Vô hiệu hóa khi đang gửi
          >
            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
            {isSubmitting
              ? "Đang xử lý..."
              : isEdit
                ? "Lưu Thay Đổi"
                : "Tạo Sản Phẩm"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};