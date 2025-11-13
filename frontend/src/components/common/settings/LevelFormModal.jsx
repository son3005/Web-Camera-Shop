// src/components/common/settings/LevelFormModal.jsx
import React, { useEffect, useState } from "react";

export default function LevelFormModal({
  open,
  onClose,
  onSubmit,
  initialData = null, // { id, ma_cap_do, ten_cap_do }
  loading = false,
}) {
  const [ma, setMa] = useState("");
  const [ten, setTen] = useState("");
  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (open) {
      setMa(initialData?.ma_cap_do || "");
      setTen(initialData?.ten_cap_do || "");
    }
  }, [open, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // simple FE validate theo rule: ma <= 5, ten <= 100
    if (!ma.trim() || ma.trim().length > 5) {
      alert("Mã cấp độ bắt buộc và tối đa 5 ký tự.");
      return;
    }
    if (!ten.trim() || ten.trim().length > 100) {
      alert("Tên cấp độ bắt buộc và tối đa 100 ký tự.");
      return;
    }

    onSubmit({
      ma_cap_do: ma.trim(),
      ten_cap_do: ten.trim(),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Cập nhật cấp độ" : "Thêm cấp độ"}
          </h3>
          <button
            className="text-slate-400 hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm mb-1">
              Mã cấp độ (tối đa 5 ký tự) *
            </label>
            <input
              value={ma}
              onChange={(e) => setMa(e.target.value.toUpperCase())}
              maxLength={5}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: CD001"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Tên cấp độ *</label>
            <input
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              maxLength={100}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: Chuyên nghiệp"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
            >
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
