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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Cập nhật cấp độ" : "Thêm cấp độ"}
          </h3>
          <button
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm mb-1 text-slate-700">
              Mã cấp độ (tối đa 5 ký tự) *
            </label>
            <input
              value={ma}
              onChange={(e) => setMa(e.target.value.toUpperCase())}
              maxLength={5}
              className="w-full rounded-lg px-3 py-2 bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-inner
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
              placeholder="VD: CD001"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-700">
              Tên cấp độ *
            </label>
            <input
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              maxLength={100}
              className="w-full rounded-lg px-3 py-2 bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-inner
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
              placeholder="VD: Chuyên nghiệp"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:from-emerald-400 hover:to-slate-500 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer transition"
            >
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
