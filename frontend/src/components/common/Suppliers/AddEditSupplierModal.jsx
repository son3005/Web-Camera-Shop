// src/components/common/Suppliers/AddEditSupplierModal.jsx
import { useState, useEffect } from "react";

export default function AddEditSupplierModal({ supplier, onClose, onSubmit }) {
  // isEdit = true nếu có truyền supplier (chế độ chỉnh sửa)
  const isEdit = !!supplier;

  // State form lưu toàn bộ thông tin nhập của nhà cung cấp
  const [form, setForm] = useState({
    ten_nha_cung_cap: "",
    dia_chi: "",
    so_dien_thoai: "",
    email: "",
    nguoi_dai_dien: "",
    tai_khoan_ngan_hang: "",
    ten_ngan_hang: "",
    trang_thai: "kich_hoat", // mặc định là đang hoạt động
    ghi_chu: "",
  });

  // Khi prop `supplier` thay đổi (mở modal sửa),
  // fill sẵn dữ liệu vào form
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

  // Helper cập nhật 1 field trong form
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Submit form
  const handleSubmit = () => {
    // Validate: tên nhà cung cấp là bắt buộc
    if (!form.ten_nha_cung_cap.trim()) {
      alert("Tên nhà cung cấp là bắt buộc");
      return;
    }

    // Chuẩn payload: bỏ bớt field rỗng để backend dễ xử lý update partial
    const payload = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) payload[k] = v;
    });

    // Gửi payload ra ngoài cho parent xử lý (create / update)
    onSubmit(payload);
  };

  return (
    // Lớp overlay full màn hình + background mờ
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      {/* Khung modal chính */}
      <div className="w-full max-w-3xl rounded-2xl border border-emerald-50 bg-white text-slate-900 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/90">
          <div>
            {/* Tiêu đề: tuỳ theo đang thêm mới hay chỉnh sửa */}
            <h2 className="text-lg font-semibold">
              {isEdit ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
            </h2>
            {/* Mã NCC nếu có (chỉ hiển thị khi edit) */}
            {isEdit && supplier?.ma_nha_cung_cap && (
              <p className="text-xs text-slate-500">
                Mã NCC: {supplier.ma_nha_cung_cap}
              </p>
            )}
          </div>
          {/* Nút đóng modal (dấu ✕) */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body: nội dung form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Grid chia 2 cột trên màn hình lớn, 1 cột trên mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên nhà cung cấp */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Tên nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <input
                value={form.ten_nha_cung_cap}
                onChange={(e) =>
                  handleChange("ten_nha_cung_cap", e.target.value)
                }
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="VD: Công ty TNHH ABC"
              />
            </div>

            {/* Người đại diện */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Người đại diện
              </label>
              <input
                value={form.nguoi_dai_dien}
                onChange={(e) => handleChange("nguoi_dai_dien", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>

            {/* Địa chỉ: span 2 cột */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Địa chỉ
              </label>
              <input
                value={form.dia_chi}
                onChange={(e) => handleChange("dia_chi", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="VD: 123 Đường Lê Lợi, Quận 1, TP.HCM"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Số điện thoại
              </label>
              <input
                value={form.so_dien_thoai}
                onChange={(e) => handleChange("so_dien_thoai", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="VD: 0901234567"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="VD: contact@abctech.com"
              />
            </div>

            {/* Tài khoản ngân hàng */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Tài khoản ngân hàng
              </label>
              <input
                value={form.tai_khoan_ngan_hang}
                onChange={(e) =>
                  handleChange("tai_khoan_ngan_hang", e.target.value)
                }
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="Số tài khoản"
              />
            </div>

            {/* Tên ngân hàng */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Tên ngân hàng
              </label>
              <input
                value={form.ten_ngan_hang}
                onChange={(e) => handleChange("ten_ngan_hang", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/80"
                placeholder="VD: Vietcombank"
              />
            </div>

            {/* Trạng thái */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Trạng thái
              </label>
              <select
                value={form.trang_thai}
                onChange={(e) => handleChange("trang_thai", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/80 cursor-pointer"
              >
                <option value="kich_hoat">Đang hoạt động</option>
                <option value="ngung_hoat_dong">Ngừng hoạt động</option>
              </select>
            </div>

            {/* Ghi chú: span 2 cột */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Ghi chú
              </label>
              <textarea
                value={form.ghi_chu}
                onChange={(e) => handleChange("ghi_chu", e.target.value)}
                rows={3}
                className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/80 resize-none"
                placeholder="Ghi chú thêm (không bắt buộc)"
              />
            </div>
          </div>
        </div>

        {/* Footer: nút Hủy + Lưu / Thêm */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white/90 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-400 cursor-pointer transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/30 cursor-pointer transition"
          >
            {isEdit ? "Lưu thay đổi" : "Thêm nhà cung cấp"}
          </button>
        </div>
      </div>
    </div>
  );
}
