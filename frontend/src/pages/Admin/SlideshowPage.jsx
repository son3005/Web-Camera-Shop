// src/pages/Admin/SlideshowPage.jsx
// Quản lý ảnh trình chiếu cho homepage

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSlideshow } from "../../hooks/useSlideshow";

export default function SlideshowPage() {
  const { useGetSlides, useCreateSlide, useUpdateSlide, useDeleteSlide } =
    useSlideshow();

  const { data: slides = [], isLoading } = useGetSlides();
  const createMutation = useCreateSlide();
  const updateMutation = useUpdateSlide();
  const deleteMutation = useDeleteSlide();

  const [editing, setEditing] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      tieu_de: "",
      lien_ket: "",
      vi_tri: 1,
      trang_thai: true,
      file: null,
    },
  });

  const fileList = watch("file");
  const file = fileList && fileList[0];
  const previewUrl = file ? URL.createObjectURL(file) : null;

  const onSubmit = async (values) => {
    if (editing) {
      // Update text / vị trí / trạng thái (không đổi hình trong API hiện tại)
      updateMutation.mutate({
        id: editing.id,
        payload: {
          tieu_de: values.tieu_de,
          lien_ket: values.lien_ket,
          vi_tri: Number(values.vi_tri) || 1,
          trang_thai: values.trang_thai,
        },
      });
    } else {
      // Create mới (có upload file)
      createMutation.mutate({
        tieu_de: values.tieu_de,
        lien_ket: values.lien_ket,
        vi_tri: Number(values.vi_tri) || 1,
        trang_thai: values.trang_thai,
        file: values.file?.[0],
      });
    }

    setEditing(null);
    reset({
      tieu_de: "",
      lien_ket: "",
      vi_tri: 1,
      trang_thai: true,
      file: null,
    });
  };

  const handleEdit = (slide) => {
    setEditing(slide);
    reset({
      tieu_de: slide.tieu_de || "",
      lien_ket: slide.lien_ket || "",
      vi_tri: slide.vi_tri ?? 1,
      trang_thai: slide.trang_thai ?? true,
      file: null,
    });
  };

  const handleCancelEdit = () => {
    setEditing(null);
    reset({
      tieu_de: "",
      lien_ket: "",
      vi_tri: 1,
      trang_thai: true,
      file: null,
    });
  };

  const handleToggleActive = (slide) => {
    updateMutation.mutate({
      id: slide.id,
      payload: { trang_thai: !slide.trang_thai },
    });
  };

  const handleDelete = (slide) => {
    if (window.confirm(`Xoá ảnh "${slide.tieu_de}" ?`)) {
      deleteMutation.mutate(slide.id);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50/40 min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Quản lý ảnh trình chiếu
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.4fr] gap-6">
        {/* Danh sách ảnh */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-lg p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Danh sách ảnh trình chiếu
            </h2>
          </div>

          {isLoading ? (
            <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
          ) : slides.length === 0 ? (
            <p className="text-sm text-slate-500">
              Chưa có ảnh trình chiếu nào. Hãy thêm một ảnh ở form bên dưới.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-slate-800">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-2 text-left text-slate-500 font-medium">
                      Ảnh
                    </th>
                    <th className="py-2 px-2 text-left text-slate-500 font-medium">
                      Tiêu đề
                    </th>
                    <th className="py-2 px-2 text-left text-slate-500 font-medium">
                      Liên kết
                    </th>
                    <th className="py-2 px-2 text-center text-slate-500 font-medium">
                      Vị trí
                    </th>
                    <th className="py-2 px-2 text-center text-slate-500 font-medium">
                      Trạng thái
                    </th>
                    <th className="py-2 pl-2 text-right text-slate-500 font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slides.map((slide) => (
                    <tr
                      key={slide.id}
                      className="border-b border-slate-100 last:border-none"
                    >
                      <td className="py-2 pr-2">
                        <div className="w-20 h-12 rounded-lg overflow-hidden bg-slate-100">
                          {slide.hinh_anh_url && (
                            <img
                              src={slide.hinh_anh_url}
                              alt={slide.tieu_de}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 align-top">
                        <div className="font-medium text-slate-900 line-clamp-2">
                          {slide.tieu_de}
                        </div>
                      </td>
                      <td className="py-2 px-2 align-top">
                        <div className="text-xs text-emerald-600 break-all">
                          {slide.lien_ket || "—"}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center align-top">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-xs font-semibold">
                          {slide.vi_tri ?? "-"}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center align-top">
                        <button
                          onClick={() => handleToggleActive(slide)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                            slide.trang_thai
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          {slide.trang_thai ? "Đang hiển thị" : "Đang ẩn"}
                        </button>
                      </td>
                      <td className="py-2 pl-2 text-right align-top space-x-2">
                        <button
                          onClick={() => handleEdit(slide)}
                          className="text-xs px-2.5 py-1 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(slide)}
                          className="text-xs px-2.5 py-1 rounded-full border border-rose-300 text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                        >
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form thêm / sửa */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-lg p-4 md:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {editing ? "Chỉnh sửa ảnh trình chiếu" : "Thêm ảnh trình chiếu"}
              </h2>
            </div>
            {editing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs px-2.5 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer transition"
              >
                Thêm mới
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-sm">
            <div className="space-y-1">
              <label className="font-medium text-slate-800">Tiêu đề</label>
              <input
                type="text"
                {...register("tieu_de")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/70 text-sm"
                placeholder="Ví dụ: Siêu sale máy ảnh cuối tuần"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-800">
                Liên kết (khi click banner)
              </label>
              <input
                type="text"
                {...register("lien_ket")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/70 text-sm"
                placeholder="Dán đường dẫn"
              />
            </div>

            <div className="flex gap-3">
              <div className="space-y-1">
                <label className="font-medium text-slate-800">
                  Vị trí hiển thị
                </label>
                <input
                  type="number"
                  min={1}
                  {...register("vi_tri")}
                  className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/70 text-sm"
                />
              </div>
              <div className="flex items-end gap-2">
                <input
                  type="checkbox"
                  id="trang_thai"
                  {...register("trang_thai")}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="trang_thai" className="text-sm text-slate-700">
                  Hiển thị trên trang chủ
                </label>
              </div>
            </div>

            {!editing && (
              <div className="space-y-1">
                <label className="font-medium text-slate-800">Chọn ảnh</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("file")}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>
            )}

            {previewUrl && (
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-1">Xem trước:</p>
                <div className="w-full rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-40 object-cover"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || createMutation.isPending}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-md shadow-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition"
              >
                {editing ? "Lưu thay đổi" : "Thêm ảnh trình chiếu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
