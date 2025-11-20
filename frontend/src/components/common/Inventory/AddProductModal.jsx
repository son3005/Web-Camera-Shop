// src/components/common/Inventory/AddProductModal.jsx
import React, { useEffect, useState } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { X, Loader2, Save } from "lucide-react";
import VariantManager from "./VariantManager";
import PropertyForm from "./PropertyForm";
import DescriptionEditor from "./DescriptionEditor";
import { useProducts } from "../../../hooks/useProducts";
import { useCatalogs } from "../../../hooks/useCatalogs";
import { useToast } from "../../../hooks/useToast";

const AddProductModal = ({ mode, productId, onClose }) => {
  const { useGetSanPhamById, useCreateSanPham, useUpdateSanPham } =
    useProducts();
  const { useGetAllDanhMuc, useGetAllThuongHieu, useGetAllCapDo } =
    useCatalogs();

  const toastHook = useToast();
  const showSuccess =
    toastHook?.success || toastHook?.toast?.success || (() => {});
  const showError = toastHook?.error || toastHook?.toast?.error || (() => {});

  // để gom id biến thể cũ bị xoá
  const [deletedVariantIds, setDeletedVariantIds] = useState([]);

  // dropdown data
  const { data: danhMucData } = useGetAllDanhMuc({ page: 1, per_page: 100 });
  const { data: thuongHieuData } = useGetAllThuongHieu({
    page: 1,
    per_page: 100,
  });
  const { data: capDoData } = useGetAllCapDo({ page: 1, per_page: 100 });

  // detail khi edit
  const { data: productDetail } = useGetSanPhamById(productId, {
    enabled: mode === "edit" && !!productId,
  });

  const createMutation = useCreateSanPham();
  const updateMutation = useUpdateSanPham();

  const methods = useForm({
    defaultValues: {
      ten_san_pham: "",
      danh_muc_id: "",
      thuong_hieu_id: "",
      cap_do_id: "",
      mo_ta: "",
      // vẫn giữ để backend không thiếu, nhưng không render ra UI nữa
      trang_thai: "dang_ban",
      thong_so_ky_thuat: {},
      bien_the_san_phams: [
        {
          ten_bien_the: "",
          gia_ban: 0,
          mau: "",
          so_luong: 0,
          // trạng thái sẽ hiển thị trong từng biến thể (VariantManager)
          trang_thai_kich_hoat: "dang_ban",
          hinh_anhs: [],
        },
      ],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = methods;

  // fill data khi edit
  useEffect(() => {
    if (mode === "edit" && productDetail) {
      setDeletedVariantIds([]);

      reset({
        ten_san_pham: productDetail.ten_san_pham,
        danh_muc_id: productDetail.danh_muc_id?.toString() || "",
        thuong_hieu_id: productDetail.thuong_hieu_id?.toString() || "",
        cap_do_id: productDetail.cap_do_id?.toString() || "",
        mo_ta: productDetail.mo_ta || "",
        // giữ lại trạng thái của sản phẩm nhưng không cho sửa
        trang_thai: productDetail.trang_thai || "dang_ban",
        thong_so_ky_thuat:
          typeof productDetail.thong_so_ky_thuat === "string"
            ? (() => {
                try {
                  return JSON.parse(productDetail.thong_so_ky_thuat);
                } catch {
                  return {};
                }
              })()
            : productDetail.thong_so_ky_thuat || {},
        bien_the_san_phams: (productDetail.cac_bien_the || []).map((v) => ({
          id: v.id,
          id_in_db: v.id,
          ten_bien_the: v.ten_bien_the,
          gia_ban: v.gia_ban,
          mau: v.mau || "",
          so_luong:
            typeof v.so_luong_ton === "number"
              ? v.so_luong_ton
              : v.so_luong || 0,
          // ✅ trạng thái nằm ở từng biến thể
          trang_thai_kich_hoat: v.trang_thai_kich_hoat
            ? "dang_ban"
            : "ngung_ban",
          hinh_anhs: (v.hinh_anhs || []).map((img, idx) => ({
            id: img.id,
            url: img.url,
            public_id: img.public_id,
            alt_text: img.alt_text || `Ảnh ${idx + 1}`,
            la_anh_dai_dien: img.la_anh_dai_dien,
            thu_tu: img.thu_tu || idx + 1,
          })),
        })),
      });
    }
  }, [mode, productDetail, reset]);

  // chuẩn hóa để đưa thẳng cho backend
  const normalizeForBackend = (formData) => {
    const thongSoObj = formData.thong_so_ky_thuat || {};

    return {
      danh_muc_id: formData.danh_muc_id
        ? Number(formData.danh_muc_id)
        : undefined,
      thuong_hieu_id: formData.thuong_hieu_id
        ? Number(formData.thuong_hieu_id)
        : undefined,
      cap_do_id: formData.cap_do_id ? Number(formData.cap_do_id) : undefined,
      ten_san_pham: formData.ten_san_pham?.trim(),
      mo_ta: formData.mo_ta || "",
      // vẫn gửi lên nếu backend cần
      trang_thai: formData.trang_thai || "dang_ban",
      thong_so_ky_thuat: thongSoObj,
      bien_the_xoa_ids: deletedVariantIds,
      cac_bien_the: (formData.bien_the_san_phams || []).map((v, i) => {
        const trangThai =
          v.trang_thai_kich_hoat === "dang_ban" ||
          v.trang_thai_kich_hoat === true
            ? "dang_ban"
            : "ngung_ban";

        return {
          ...(v.id ? { id: v.id } : {}),
          ten_bien_the: v.ten_bien_the?.trim(),
          mau: v.mau || "",
          gia_ban: v.gia_ban ? Number(v.gia_ban) : 0,
          trang_thai_kich_hoat: trangThai,
          so_luong: v.so_luong ? Number(v.so_luong) : 0,
          hinh_anhs: (v.hinh_anhs || []).map((img, j) => ({
            ...(img.id ? { id: img.id } : {}),
            alt_text: img.alt_text || img?.file?.name || `Ảnh ${j + 1}`,
            thu_tu: typeof img.thu_tu === "number" ? img.thu_tu : j + 1,
            la_anh_dai_dien:
              typeof img.la_anh_dai_dien === "boolean"
                ? img.la_anh_dai_dien
                : j === 0,
            ...(img.url ? { url: img.url } : {}),
            ...(img.public_id ? { public_id: img.public_id } : {}),
            ...(img.file ? { file: img.file } : {}),
          })),
        };
      }),
    };
  };

  const onSubmit = async (data) => {
    const payload = normalizeForBackend(data);
    console.log("📦 payload gửi BE:", payload);

    try {
      if (mode === "add") {
        await createMutation.mutateAsync(payload);
        showSuccess("Thêm sản phẩm thành công");
      } else {
        await updateMutation.mutateAsync({ id: productId, ...payload });
        showSuccess("Cập nhật sản phẩm thành công");
      }
      onClose();
    } catch (err) {
      console.error("❌ Lỗi khi lưu sản phẩm:", err);
      console.error("❌ BE trả:", err?.response?.data);
      showError(
        err?.response?.data?.error ||
          err?.message ||
          "Có lỗi xảy ra khi lưu sản phẩm"
      );
    }
  };

  const isSaving =
    createMutation.isPending || updateMutation.isPending || false;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative w-full max-w-7xl max-h-[95vh] flex flex-col rounded-3xl bg-slate-200/60 dark:bg-slate-800/70"
        >
          {/* header */}
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

          {/* body */}
          <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* tên */}
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

              {/* ✅ KHÔNG render toggle trạng thái sản phẩm ở đây nữa */}

              <VariantManager
                control={control}
                register={register}
                errors={errors}
                onDeleteExistingVariant={(id) =>
                  setDeletedVariantIds((prev) =>
                    prev.includes(id) ? prev : [...prev, id]
                  )
                }
              />
            </div>

            <div className="lg:col-span-5">
              <PropertyForm control={control} readOnly={false} />
            </div>
          </div>

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

          {/* footer */}
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
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-slate-600"
            >
              {isSaving ? (
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
