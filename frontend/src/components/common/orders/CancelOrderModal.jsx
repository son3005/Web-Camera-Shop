// src/components/orders/CancelOrderModal.jsx
import React, { useEffect, useState } from "react";

export default function CancelOrderModal({
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

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-2">Huỷ đơn hàng</h2>
        {order && (
          <p className="text-xs text-slate-500 mb-3">
            Mã đơn: <b>{order.ma_don_hang}</b>
          </p>
        )}

        <label className="text-sm font-medium">
          Lý do huỷ <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Ví dụ: Đổi ý, chọn nhầm sản phẩm..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-4 py-2 rounded-lg border text-slate-700"
            onClick={onClose}
            disabled={loading}
          >
            Đóng
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60"
            onClick={() => onConfirm(reason.trim())}
            disabled={loading || !reason.trim()}
          >
            {loading ? "Đang xử lý..." : "Xác nhận huỷ"}
          </button>
        </div>
      </div>
    </div>
  );
}
