// src/components/orders/ReturnRequestModal.jsx
import React, { useEffect, useState } from "react";

export default function ReturnRequestModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  order,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    const value = reason.trim();
    if (!value) return;
    onConfirm?.(value);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-50 bg-white/96 text-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Yêu cầu đổi / trả hàng</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {order && (
          <p className="text-xs text-slate-500 mb-4">
            Mã đơn:{" "}
            <span className="font-semibold font-mono">{order.ma_don_hang}</span>
          </p>
        )}

        <label className="text-sm font-medium">
          Lý do đổi/trả <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400 placeholder:text-slate-400"
          placeholder="Ví dụ: Sản phẩm lỗi, không đúng mô tả..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
        />

        <div className="flex justify-end gap-3 mt-5">
          <button
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={loading}
          >
            Đóng
          </button>
          <button
            className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
          >
            {loading ? "Đang xử lý..." : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
}
