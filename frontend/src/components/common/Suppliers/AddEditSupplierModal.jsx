// src/components/common/Suppliers/AddEditSupplierModal.jsx
import { useState, useEffect } from "react";

export default function AddEditSupplierModal({ supplier, onClose, onSubmit }) {
  const isEdit = !!supplier;

  const [form, setForm] = useState({
    ten_nha_cung_cap: "",
    dia_chi: "",
    so_dien_thoai: "",
    email: "",
    nguoi_dai_dien: "",
    tai_khoan_ngan_hang: "",
    ten_ngan_hang: "",
    trang_thai: "kich_hoat",
    ghi_chu: "",
  });

  useEffect(() => {
    if (supplier) {
      setForm((prev) => ({
        ...prev,
        ten_nha_cung_cap: supplier.ten_nha_cung_cap || "",
        dia_chi: supplier.dia_chi || "",
        so_dien_thoai: supplier.so_dien_thoai || "",
        email: supplier.email || "",
        nguoi_dai_dien: supplier.nguoi_dai_dien || "",
        tai_khoan_ngan_hang: supplier.tai_khoan_ngan_hang || "",
        ten_ngan_hang: supplier.ten_ngan_hang || "",
        trang_thai: supplier.trang_thai || "kich_hoat",
        ghi_chu: supplier.ghi_chu || "",
      }));
    }
  }, [supplier]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.ten_nha_cung_cap.trim()) {
      alert("Tên nhà cung cấp là bắt buộc");
      return;
    }

    // Chuẩn payload: bỏ bớt field rỗng để backend update partial
    const payload = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) payload[k] = v;
    });

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200/70 dark:border-emerald-500/40 bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-slate-50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/90">
          <div>
            <h2 className="text-lg font-semibold">
              {isEdit ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
            </h2>
            {isEdit && supplier?.ma_nha_cung_cap && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mã NCC: {supplier.ma_nha_cung_cap}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 block">
                Tên nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <input
                value={form.ten_nha_cung_cap}
                onChange={(e) =>
                  handleChange("ten_nha_cung_cap", e.target.value)
                }
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="VD: Công ty TNHH ABC"
              />
            </div>

            {/* Người đại diện */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 block">
                Người đại diện
              </label>
              <input
                value={form.nguoi_dai_dien}
                onChange={(e) => handleChange("nguoi_dai_dien", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>

            {/* Địa chỉ */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 block">
                Địa chỉ
              </label>
              <input
                value={form.dia_chi}
                onChange={(e) => handleChange("dia_chi", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="VD: 123 Đường Lê Lợi, Quận 1, TP.HCM"
              />
            </div>

            {/* SĐT */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 block">
                Số điện thoại
              </label>
              <input
                value={form.so_dien_thoai}
                onChange={(e) => handleChange("so_dien_thoai", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="VD: 0901234567"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="VD: contact@abctech.com"
              />
            </div>

            {/* Tài khoản ngân hàng */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 block">
                Tài khoản ngân hàng
              </label>
              <input
                value={form.tai_khoan_ngan_hang}
                onChange={(e) =>
                  handleChange("tai_khoan_ngan_hang", e.target.value)
                }
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="Số tài khoản"
              />
            </div>

            {/* Tên ngân hàng */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 block">
                Tên ngân hàng
              </label>
              <input
                value={form.ten_ngan_hang}
                onChange={(e) => handleChange("ten_ngan_hang", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="VD: Vietcombank"
              />
            </div>

            {/* Trạng thái */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 block">
                Trạng thái
              </label>
              <select
                value={form.trang_thai}
                onChange={(e) => handleChange("trang_thai", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/80 cursor-pointer"
              >
                <option value="kich_hoat">Đang hoạt động</option>
                <option value="ngung_hoat_dong">Ngừng hoạt động</option>
              </select>
            </div>

            {/* Ghi chú */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 block">
                Ghi chú
              </label>
              <textarea
                value={form.ghi_chu}
                onChange={(e) => handleChange("ghi_chu", e.target.value)}
                rows={3}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/80 resize-none"
                placeholder="Ghi chú thêm (không bắt buộc)"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/90 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:from-emerald-400 hover:to-slate-500 shadow-md shadow-emerald-500/30 cursor-pointer transition"
          >
            {isEdit ? "Lưu thay đổi" : "Thêm nhà cung cấp"}
          </button>
        </div>
      </div>
    </div>
  );
}
