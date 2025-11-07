// frontend/src/components/common/Inventory/AddProductModal.jsx
// ------------------------------------------------------------
// Mục đích:
// 1. Modal thêm / sửa sản phẩm
// 2. Luồng "sửa" phải fill lại toàn bộ dữ liệu từ backend
//    (kể cả biến thể và ảnh cũ) để gửi lại đúng format
// 3. Khi submit sẽ gọi hook useProducts() (đã trỏ tới adminProductApi)
// 4. Các dropdown (danh mục, thương hiệu, cấp độ) lấy từ useCatalogs()
//    → sau khi mình fix useCatalogs thì nó sẽ có data
// ------------------------------------------------------------

import React, { useEffect } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { X, Loader2, Save } from "lucide-react";

import VariantManager from "./VariantManager";
import PropertyForm from "./PropertyForm";
import DescriptionEditor from "./DescriptionEditor";

import { useProducts } from "../../../hooks/useProducts";
import { useCatalogs } from "../../../hooks/useCatalogs";
import { useToast } from "../../../hooks/useToast";

import {
  sanPhamCreateSchema,
  sanPhamUpdateSchema,
} from "../../../validation/products";

/* =========================================================
   Component chuyển đổi trạng thái (chỉ để UI đẹp)
   Backend của bạn đang không bắt buộc phải gửi field này,
   nên mình giữ ở UI để sau này bạn muốn gửi thì gửi.
   ========================================================= */
const StatusToggle = ({ label, enabled, onChange, readOnly }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => !readOnly && onChange(!enabled)}
        disabled={readOnly}
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
          enabled ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span
        className={`text-sm font-medium ${
          enabled ? "text-emerald-600" : "text-slate-500"
        }`}
      >
        {enabled ? "Đang bán" : "Ngừng bán"}
      </span>
    </div>
  </div>
);

/* =========================================================
   MAIN COMPONENT
   props:
   - mode: "add" | "edit"
   - productId: id sản phẩm cần sửa (mode=edit)
   - onClose: đóng modal
   ========================================================= */
const AddProductModal = ({ mode, productId, onClose }) => {
  /* ===================== HOOK API ===================== */
  // hook sản phẩm
  const { useGetSanPhamById, useCreateSanPham, useUpdateSanPham } =
    useProducts();

  // hook danh mục / thương hiệu / cấp độ
  const { useGetAllDanhMuc, useGetAllThuongHieu, useGetAllCapDo } =
    useCatalogs();

  // toast
  const { success, error } = useToast();

  /* ===================== GỌI DROPDOWN ===================== */
  // gọi nhiều hơn 1 trang để chắc có dữ liệu
  const { data: danhMucData } = useGetAllDanhMuc({ page: 1, per_page: 100 });
  const { data: thuongHieuData } = useGetAllThuongHieu({
    page: 1,
    per_page: 100,
  });
  const { data: capDoData } = useGetAllCapDo({ page: 1, per_page: 100 });

  /* ===================== GỌI DETAIL KHI EDIT ===================== */
  const { data: productDetail } = useGetSanPhamById(productId, {
    enabled: mode === "edit" && !!productId,
  });

  /* ===================== MUTATION ===================== */
  const createMutation = useCreateSanPham();
  const updateMutation = useUpdateSanPham();

  /* ===================== FORM ===================== */
  const methods = useForm({
    // dùng yup để check
    resolver: yupResolver(
      mode === "add" ? sanPhamCreateSchema : sanPhamUpdateSchema
    ),
    // giá trị mặc định
    defaultValues: {
      ten_san_pham: "",
      danh_muc_id: "",
      thuong_hieu_id: "",
      cap_do_id: "",
      mo_ta: "",
      trang_thai: "dang_ban",
      thong_so_ky_thuat: {},
      bien_the_san_phams: [],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  /* =========================================================
     KHI MODE = EDIT → ĐỔ DỮ LIỆU VÀO FORM
     - Lưu ý: backend trả "cac_bien_the"
     - FE đang dùng "bien_the_san_phams"
     - nên phải map qua
     ========================================================= */
  useEffect(() => {
    if (mode === "edit" && productDetail) {
      reset({
        ten_san_pham: productDetail.ten_san_pham,
        // ưu tiên id, nếu BE chỉ trả object thì lấy object.id
        danh_muc_id: productDetail.danh_muc_id || productDetail.danh_muc?.id,
        thuong_hieu_id:
          productDetail.thuong_hieu_id || productDetail.thuong_hieu?.id,
        cap_do_id: productDetail.cap_do_id || productDetail.cap_do?.id,
        mo_ta: productDetail.mo_ta,
        trang_thai: productDetail.trang_thai || "dang_ban",
        thong_so_ky_thuat: productDetail.thong_so_ky_thuat || {},
        // map biến thể
        bien_the_san_phams:
          productDetail.cac_bien_the?.map((v, idx) => ({
            id: v.id,
            ten_bien_the: v.ten_bien_the,
            gia_ban: v.gia_ban,
            gia_khuyen_mai: v.gia_khuyen_mai,
            ngay_bat_dau_khuyen_mai: v.ngay_bat_dau_khuyen_mai,
            ngay_ket_thuc_khuyen_mai: v.ngay_ket_thuc_khuyen_mai,
            so_luong_ton: v.so_luong_ton,
            trang_thai_kich_hoat: v.trang_thai_kich_hoat,
            // ảnh cũ → không có file, nhưng cần để hiển thị
            hinh_anhs:
              v.hinh_anhs?.map((img, i) => ({
                id: img.id,
                url: img.url,
                public_id: img.public_id,
                alt_text: img.alt_text || `Ảnh ${i + 1}`,
                la_anh_dai_dien: img.la_anh_dai_dien,
                thu_tu: img.thu_tu || i + 1,
              })) || [],
          })) || [],
      });
    }
  }, [mode, productDetail, reset]);

  /* =========================================================
     SUBMIT FORM
     - Chuẩn hóa lại dữ liệu
     - Ép ID về number để backend (SQLAlchemy/Pydantic) không kêu
     - Chuẩn hóa mảng ảnh trong từng biến thể
     ========================================================= */
  const onSubmit = async (data) => {
    try {
      // ép 3 id chính sang number (hoặc null)
      const normalizedBase = {
        ...data,
        danh_muc_id: data.danh_muc_id ? Number(data.danh_muc_id) : null,
        thuong_hieu_id: data.thuong_hieu_id
          ? Number(data.thuong_hieu_id)
          : null,
        cap_do_id: data.cap_do_id ? Number(data.cap_do_id) : null,
      };

      // chuẩn hóa biến thể + ảnh bên trong
      const payload = {
        ...normalizedBase,
        bien_the_san_phams: Array.isArray(normalizedBase.bien_the_san_phams)
          ? normalizedBase.bien_the_san_phams.map((v) => ({
              ...v,
              // hinh_anhs có thể là ảnh cũ (url, id) hoặc ảnh mới (file)
              hinh_anhs: Array.isArray(v.hinh_anhs)
                ? v.hinh_anhs.map((img, idx) => ({
                    id: img.id,
                    url: img.url,
                    public_id: img.public_id,
                    // nếu không có alt_text thì lấy tên file hoặc "Ảnh x"
                    alt_text:
                      img.alt_text || img?.file?.name || `Ảnh ${idx + 1}`,
                    // nếu BE cần boolean rõ ràng
                    la_anh_dai_dien:
                      typeof img.la_anh_dai_dien === "boolean"
                        ? img.la_anh_dai_dien
                        : idx === 0,
                    thu_tu:
                      typeof img.thu_tu === "number" ? img.thu_tu : idx + 1,
                    file: img.file, // để adminProductApi.append file
                  }))
                : [],
            }))
          : [],
      };

      if (mode === "add") {
        await createMutation.mutateAsync(payload);
        success("Thêm sản phẩm thành công");
      } else {
        await updateMutation.mutateAsync({ id: productId, ...payload });
        success("Cập nhật sản phẩm thành công");
      }

      onClose();
    } catch (err) {
      error(
        err?.response?.data?.error ||
          err?.message ||
          "Có lỗi xảy ra khi lưu sản phẩm"
      );
    }
  };

  /* =========================================================
     RENDER
     ========================================================= */
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative w-full max-w-7xl max-h-[95vh] flex flex-col rounded-3xl bg-slate-200/60 dark:bg-slate-800/70"
        >
          {/* ========== HEADER ========== */}
          <div className="flex justify-between items-center p-5 border-b border-black/10 dark:border-white/10">
            <h2 className="text-2xl font-bold">
              {mode === "add" ? "Thêm Sản Phẩm Mới" : "Cập Nhật Sản Phẩm"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/10"
            >
              <X size={24} />
            </button>
          </div>

          {/* ========== BODY ========== */}
          <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cột trái: thông tin chính + biến thể */}
            <div className="lg:col-span-7 space-y-6">
              {/* dòng inputs cơ bản */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* tên sản phẩm */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    {...register("ten_san_pham")}
                    className="w-full rounded-lg px-3 py-2 bg-white/50"
                  />
                  <p className="text-red-500 text-xs h-4">
                    {errors.ten_san_pham?.message}
                  </p>
                </div>

                {/* danh mục */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Danh mục *
                  </label>
                  <select
                    {...register("danh_muc_id")}
                    className="w-full rounded-lg px-3 py-2 bg-white/50"
                  >
                    <option value="">Chọn danh mục</option>
                    {(danhMucData?.data || []).map((dm) => (
                      <option key={dm.id} value={dm.id}>
                        {dm.ten_danh_muc}
                      </option>
                    ))}
                  </select>
                  <p className="text-red-500 text-xs h-4">
                    {errors.danh_muc_id?.message}
                  </p>
                </div>

                {/* thương hiệu */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Thương hiệu *
                  </label>
                  <select
                    {...register("thuong_hieu_id")}
                    className="w-full rounded-lg px-3 py-2 bg-white/50"
                  >
                    <option value="">Chọn thương hiệu</option>
                    {(thuongHieuData?.data || []).map((th) => (
                      <option key={th.id} value={th.id}>
                        {th.ten_thuong_hieu}
                      </option>
                    ))}
                  </select>
                  <p className="text-red-500 text-xs h-4">
                    {errors.thuong_hieu_id?.message}
                  </p>
                </div>

                {/* cấp độ */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cấp độ
                  </label>
                  <select
                    {...register("cap_do_id")}
                    className="w-full rounded-lg px-3 py-2 bg-white/50"
                  >
                    <option value="">Chọn cấp độ</option>
                    {(capDoData?.data || []).map((cd) => (
                      <option key={cd.id} value={cd.id}>
                        {cd.ten_cap_do}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* toggle trạng thái chỉ để UI */}
              <Controller
                name="trang_thai"
                control={control}
                render={({ field }) => (
                  <StatusToggle
                    label="Tình trạng kinh doanh"
                    enabled={field.value === "dang_ban"}
                    onChange={(enabled) =>
                      field.onChange(enabled ? "dang_ban" : "ngung_ban")
                    }
                  />
                )}
              />

              {/* quản lý biến thể */}
              <VariantManager
                control={control}
                register={register}
                errors={errors}
                readOnly={false}
              />
            </div>

            {/* Cột phải: thuộc tính kỹ thuật */}
            <div className="lg:col-span-5">
              <PropertyForm control={control} readOnly={false} />
            </div>
          </div>

          {/* Mô tả dài */}
          <div className="p-6">
            <Controller
              name="mo_ta"
              control={control}
              render={({ field }) => (
                <DescriptionEditor
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* ========== FOOTER ========== */}
          <div className="flex justify-end gap-4 p-5 border-t border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-slate-900/5"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-slate-600"
            >
              {isSubmitting ||
              createMutation.isPending ||
              updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />{" "}
                  {mode === "add" ? "Thêm sản phẩm" : "Lưu thay đổi"}
                </>
              )}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddProductModal;
