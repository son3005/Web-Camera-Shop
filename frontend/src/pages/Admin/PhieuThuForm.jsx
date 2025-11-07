import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createPhieuThu } from "../../api/phieuThuApi";
import { useToast } from "../../hooks/useToast";

export default function PhieuThuForm() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    ten_nha_cung_cap: "",
    phieu_thu_chi_tiets: [
      { bien_the_san_pham_id: "", so_luong: 1, gia_nhap_tung_vat: 0 },
    ],
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createPhieuThu,
    onSuccess: (res) => {
      success("✅ Tạo phiếu thu thành công!");
      navigate(`/admin/phieu-thu/${res.data.id}`);
    },
    onError: (err) => {
      console.error("❌ Lỗi khi tạo phiếu thu:", err.response?.data);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Lỗi không xác định khi tạo phiếu thu";
      error(msg);
    },
  });

  // ✅ Thêm chi tiết mới
  const handleAddDetail = () => {
    setFormData((prev) => ({
      ...prev,
      phieu_thu_chi_tiets: [
        ...prev.phieu_thu_chi_tiets,
        { bien_the_san_pham_id: "", so_luong: 1, gia_nhap_tung_vat: 0 },
      ],
    }));
  };

  // ✅ Cập nhật chi tiết
  const handleChangeDetail = (index, field, value) => {
    const updated = [...formData.phieu_thu_chi_tiets];
    updated[index][field] = value;
    setFormData({ ...formData, phieu_thu_chi_tiets: updated });
  };

  // ✅ Gửi form
  const handleSubmit = (e) => {
    e.preventDefault();

    // Bỏ các dòng chi tiết không hợp lệ
    const validDetails = formData.phieu_thu_chi_tiets.filter(
      (ct) =>
        ct.bien_the_san_pham_id &&
        ct.so_luong > 0 &&
        ct.gia_nhap_tung_vat > 0
    );

    if (!formData.ten_nha_cung_cap.trim()) {
      error("⚠️ Tên nhà cung cấp là bắt buộc!");
      return;
    }

    if (validDetails.length === 0) {
      error("⚠️ Cần ít nhất 1 sản phẩm hợp lệ (số lượng > 0, giá > 0).");
      return;
    }

    const payload = {
      ten_nha_cung_cap: formData.ten_nha_cung_cap.trim(),
      phieu_thu_chi_tiets: validDetails,
    };

    console.log("📦 GỬI DỮ LIỆU PHIẾU THU:", JSON.stringify(payload, null, 2));

    mutate(payload);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        Tạo Phiếu Thu
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl"
      >
        {/* --- TÊN NHÀ CUNG CẤP --- */}
        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300">
            Tên Nhà Cung Cấp
          </label>
          <input
            type="text"
            placeholder="Nhập tên nhà cung cấp..."
            className="w-full mt-1 p-2 border rounded-md dark:bg-slate-800 dark:text-white"
            value={formData.ten_nha_cung_cap}
            onChange={(e) =>
              setFormData({ ...formData, ten_nha_cung_cap: e.target.value })
            }
            required
          />
        </div>

        {/* --- CHI TIẾT SẢN PHẨM --- */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            Chi tiết sản phẩm
          </h3>

          {formData.phieu_thu_chi_tiets.map((ct, index) => (
            <div
              key={index}
              className="grid grid-cols-3 gap-3 items-center bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg"
            >
              <input
                type="number"
                placeholder="ID biến thể"
                value={ct.bien_the_san_pham_id}
                onChange={(e) =>
                  handleChangeDetail(index, "bien_the_san_pham_id", Number(e.target.value))
                }
                className="p-2 border rounded-md dark:bg-slate-800 dark:text-white"
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Số lượng"
                value={ct.so_luong}
                onChange={(e) =>
                  handleChangeDetail(index, "so_luong", Number(e.target.value))
                }
                className="p-2 border rounded-md dark:bg-slate-800 dark:text-white"
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Giá nhập"
                value={ct.gia_nhap_tung_vat}
                onChange={(e) =>
                  handleChangeDetail(index, "gia_nhap_tung_vat", Number(e.target.value))
                }
                className="p-2 border rounded-md dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddDetail}
            className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            + Thêm sản phẩm
          </button>
        </div>

        {/* --- NÚT HÀNH ĐỘNG --- */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/admin/phieu-thu")}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={`px-4 py-2 rounded-lg text-white transition ${
              isPending
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPending ? "Đang tạo..." : "Tạo Phiếu Thu"}
          </button>
        </div>
      </form>
    </div>
  );
}
