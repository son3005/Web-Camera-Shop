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

const mapBackendStatusToForm = (raw) => {
  if (typeof raw === "boolean") return raw ? "dang_ban" : "ngung_ban";
  if (typeof raw === "string") {
    const v = raw.trim().toUpperCase();
    if (["DANG_BAN", "DANGBAN", "ACTIVE", "DANG_BAN"].includes(v))
      return "dang_ban";
    if (["SAP_BAN", "SAPBAN", "COMING_SOON"].includes(v)) return "sap_ban";
    if (["NGUNG_BAN", "AN", "INACTIVE"].includes(v)) return "ngung_ban";
  }
  return "ngung_ban";
};

const mapFormStatusToBackend = (raw) => {
  if (raw === "sap_ban") return "sap_ban";
  if (raw === "ngung_ban" || raw === false) return "ngung_ban";
  return "dang_ban";
};

const AddProductModal = ({ mode, productId, onClose }) => {
  const { useGetSanPhamById, useCreateSanPham, useUpdateSanPham } =
    useProducts();
  const { useGetAllDanhMuc, useGetAllThuongHieu, useGetAllCapDo } =
    useCatalogs();

  const toastHook = useToast();
  const showSuccess =
    toastHook?.success || toastHook?.toast?.success || (() => {});
  const showError = toastHook?.error || toastHook?.toast?.error || (() => {});

  // các biến thể bị xóa (đã tồn tại trong DB) để gửi lên backend
  const [deletedVariantIds, setDeletedVariantIds] = useState([]);

  const { data: danhMucData } = useGetAllDanhMuc({ page: 1, per_page: 100 });
  const { data: thuongHieuData } = useGetAllThuongHieu({
    page: 1,
    per_page: 100,
  });
  const { data: capDoData } = useGetAllCapDo({ page: 1, per_page: 100 });

  const { data: productDetail } = useGetSanPhamById(productId, {
    enabled: mode === "edit" && !!productId,
  });

  const createMutation = useCreateSanPham();
  const updateMutation = useUpdateSanPham();

  // ✅ DEFAULT VALUES KHÔNG CÒN SỐ LƯỢNG
  const methods = useForm({
    defaultValues: {
      ten_san_pham: "",
      danh_muc_id: "",
      thuong_hieu_id: "",
      cap_do_id: "",
      mo_ta: "",
      trang_thai: "dang_ban",
      thong_so_ky_thuat: {},
      bien_the_san_phams: [
        {
          ten_bien_the: "",
          gia_ban: 0,
          mau: "",
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

  // ✅ FILL DATA khi EDIT – map theo backend (nested danh_muc / thuong_hieu / cap_do)
  useEffect(() => {
    if (mode === "edit" && productDetail) {
      setDeletedVariantIds([]);

      reset({
        ten_san_pham: productDetail.ten_san_pham,
        danh_muc_id:
          productDetail.danh_muc?.id != null
            ? String(productDetail.danh_muc.id)
            : "",
        thuong_hieu_id:
          productDetail.thuong_hieu?.id != null
            ? String(productDetail.thuong_hieu.id)
            : "",
        cap_do_id:
          productDetail.cap_do?.id != null
            ? String(productDetail.cap_do.id)
            : "",
        mo_ta: productDetail.mo_ta || "",
        trang_thai: mapBackendStatusToForm(productDetail.trang_thai),
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
        // ✅ KHÔNG ĐƯA so_luong VÀO FORM (backend không có field này)
        bien_the_san_phams: (productDetail.cac_bien_the || []).map((v) => ({
          id: v.id,
          id_in_db: v.id,
          ten_bien_the: v.ten_bien_the,
          gia_ban: v.gia_ban,
          mau: v.mau || "",
          trang_thai_kich_hoat: mapBackendStatusToForm(v.trang_thai_kich_hoat),
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

  // ✅ Chuẩn hóa dữ liệu form -> backend (SanPhamCreate / SanPhamUpdate)
  //    Không còn gửi so_luong vào biến thể
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
      trang_thai: mapFormStatusToBackend(formData.trang_thai),
      thong_so_ky_thuat: thongSoObj,
      bien_the_xoa_ids: deletedVariantIds,
      cac_bien_the: (formData.bien_the_san_phams || []).map((v, i) => ({
        ...(v.id ? { id: v.id } : {}),
        ten_bien_the: v.ten_bien_the?.trim(),
        mau: v.mau || "",
        gia_ban: v.gia_ban ? Number(v.gia_ban) : 0,
        trang_thai_kich_hoat: mapFormStatusToBackend(v.trang_thai_kich_hoat),
        // ✅ KHÔNG gửi so_luong nữa – backend hiện không có trường này
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
          ...(img.file ? { file: img.file } : {}), // 🔥 giữ file để adminProductApi chuyển qua FormData
        })),
      })),
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
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative w-full max-w-7xl max-h-[95vh] flex flex-col rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 shadow-2xl"
        >
          {/* header */}
          <div className="flex justify-between items-center p-5 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-700/60">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {mode === "add" ? "Thêm Sản Phẩm Mới" : "Cập Nhật Sản Phẩm"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    {...register("ten_san_pham")}
                    className="w-full rounded-lg px-3 py-2 text-sm bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                  />
                  <p className="text-red-500 text-xs h-4">
                    {errors.ten_san_pham?.message}
                  </p>
                </div>

                {/* danh mục */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Danh mục *
                  </label>
                  <select
                    {...register("danh_muc_id")}
                    className="w-full rounded-lg px-3 py-2 text-sm bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Thương hiệu *
                  </label>
                  <select
                    {...register("thuong_hieu_id")}
                    className="w-full rounded-lg px-3 py-2 text-sm bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Cấp độ
                  </label>
                  <select
                    {...register("cap_do_id")}
                    className="w-full rounded-lg px-3 py-2 text-sm bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
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

              {/* ✅ VariantManager KHÔNG còn số lượng */}
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

          <div className="p-6 pt-0">
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
          <div className="flex justify-end gap-4 p-5 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/80">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:from-emerald-500/90 hover:to-slate-600/90 disabled:opacity-70 transition cursor-pointer"
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
