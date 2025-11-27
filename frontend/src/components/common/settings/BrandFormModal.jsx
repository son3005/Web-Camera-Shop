// src/components/common/settings/BrandFormModal.jsx
import React, { useEffect, useState } from "react";

export default function BrandFormModal({
  open,
  onClose,
  onSubmit,
  initialData = null, // { id, ma_thuong_hieu, ten_thuong_hieu, logo_url, public_id }
  loading = false,
}) {
  const isEdit = !!initialData?.id;

  const [ma, setMa] = useState("");
  const [ten, setTen] = useState("");
  const [logo, setLogo] = useState("");
  const [publicId, setPublicId] = useState("");

  useEffect(() => {
    if (!open) return;
    setMa(initialData?.ma_thuong_hieu || "");
    setTen(initialData?.ten_thuong_hieu || "");
    setLogo(initialData?.logo_url || "");
    setPublicId(initialData?.public_id || "");
  }, [open, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const maTrim = ma.trim().toUpperCase();
    const tenTrim = ten.trim();
    const logoTrim = logo.trim();
    const publicIdTrim = publicId.trim();

    // --- FE validation khớp rule BE ---
    if (!maTrim || maTrim.length > 5) {
      alert("Mã thương hiệu bắt buộc và tối đa 5 ký tự.");
      return;
    }
    if (!tenTrim || tenTrim.length > 100) {
      alert("Tên thương hiệu bắt buộc và tối đa 100 ký tự.");
      return;
    }
    if (logoTrim && !/^https?:\/\/\S+$/i.test(logoTrim)) {
      alert("Logo URL không hợp lệ (phải bắt đầu bằng http/https).");
      return;
    }

    const payload = {
      ma_thuong_hieu: maTrim,
      ten_thuong_hieu: tenTrim,
    };
    if (logoTrim) payload.logo_url = logoTrim;
    if (publicIdTrim) payload.public_id = publicIdTrim;

    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/70 dark:border-slate-700/70">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-slate-700/70">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}
          </h3>
          <button
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* MÃ THƯƠNG HIỆU */}
          <div>
            <label className="block text-sm mb-1 text-slate-700 dark:text-slate-200">
              Mã thương hiệu (tối đa 5 ký tự) *
            </label>
            <input
              value={ma}
              onChange={(e) => setMa(e.target.value.toUpperCase())}
              maxLength={5}
              className="w-full rounded-lg px-3 py-2 bg-white/80 border border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-inner
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500
                         dark:bg-slate-900/60 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="VD: TH001"
            />
            {isEdit && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Lưu ý: Nếu thay đổi mã, mã mới phải là duy nhất.
              </p>
            )}
          </div>

          {/* TÊN THƯƠNG HIỆU */}
          <div>
            <label className="block text-sm mb-1 text-slate-700 dark:text-slate-200">
              Tên thương hiệu *
            </label>
            <input
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              maxLength={100}
              className="w-full rounded-lg px-3 py-2 bg-white/80 border border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-inner
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500
                         dark:bg-slate-900/60 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="VD: Samsung"
            />
          </div>

          {/* LOGO URL */}
          <div>
            <label className="block text-sm mb-1 text-slate-700 dark:text-slate-200">
              Logo URL (tuỳ chọn)
            </label>
            <input
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-white/80 border border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-inner
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500
                         dark:bg-slate-900/60 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="https://..."
            />
          </div>

          {/* PUBLIC ID */}
          <div>
            <label className="block text-sm mb-1 text-slate-700 dark:text-slate-200">
              Cloudinary public_id (tuỳ chọn)
            </label>
            <input
              value={publicId}
              onChange={(e) => setPublicId(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-white/80 border border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-inner
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500
                         dark:bg-slate-900/60 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="abc_xyz_123"
            />
          </div>

          {/* footer buttons */}
          <div className="flex justify-end gap-3 pt-2">
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
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:from-emerald-400 hover:to-slate-500 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Đang lưu..." : isEdit ? "Lưu" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
