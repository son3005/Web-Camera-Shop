// src/components/common/PhieuThu/AddPhieuThuModal.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../../api/productApi"; // ✅ đổi sang getProducts cho chắc có dữ liệu

export default function AddPhieuThuModal({ onClose, onSubmit }) {
  const [supplier, setSupplier] = useState("");
  const [rows, setRows] = useState([
    { bien_the_san_pham_id: "", so_luong: 1, gia_nhap_tung_vat: 0 },
  ]);

  // ✅ lấy tới 200 sp để chọn biến thể
  const { data: productList, isLoading } = useQuery({
    queryKey: ["products-for-phieuthu"],
    queryFn: () => getProducts({ page: 1, limit: 200 }),
  });

  // flatten tất cả biến thể ra 1 mảng để select
  const allVariants =
    productList?.items
      ?.flatMap((sp) =>
        (sp.variants || []).map((v) => ({
          id: v.id,
          label: `${sp.name} – ${v.ten_bien_the || v.name || "Biến thể"}`,
        }))
      )
      .filter(Boolean) || [];

  const handleAddRow = () =>
    setRows((prev) => [
      ...prev,
      { bien_the_san_pham_id: "", so_luong: 1, gia_nhap_tung_vat: 0 },
    ]);

  const handleChange = (i, field, value) => {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = () => {
    const details = rows.filter((r) => r.bien_the_san_pham_id);
    if (!details.length) {
      alert("Vui lòng chọn ít nhất một biến thể để nhập hàng");
      return;
    }

    const payload = {
      ten_nha_cung_cap: supplier || "Nhà cung cấp",
      phieu_thu_chi_tiets: details.map((d) => ({
        bien_the_san_pham_id: Number(d.bien_the_san_pham_id),
        so_luong: Number(d.so_luong || 1),
        gia_nhap_tung_vat: Number(d.gia_nhap_tung_vat || 0),
      })),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200/70 dark:border-emerald-500/40 bg-white/90 dark:bg-slate-950/95 text-slate-900 dark:text-slate-50 shadow-2xl space-y-4 p-6">
        {/* header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-200/70 dark:border-slate-800/70">
          <h2 className="text-lg font-semibold">Tạo phiếu thu mới</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* nhà cung cấp */}
        <div>
          <label className="text-sm block mb-1 text-slate-700 dark:text-slate-300">
            Tên nhà cung cấp
          </label>
          <input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full rounded-md px-3 py-2 text-sm bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="VD: Sony Việt Nam"
          />
        </div>

        {/* bảng biến thể */}
        <div className="rounded-xl overflow-hidden border border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/60">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="p-2 text-left">Biến thể</th>
                <th className="p-2 text-left w-20">SL</th>
                <th className="p-2 text-left w-32">Giá nhập</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-slate-100 dark:border-slate-800/80 bg-white/40 dark:bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <td className="p-2">
                    <select
                      value={row.bien_the_san_pham_id}
                      onChange={(e) =>
                        handleChange(i, "bien_the_san_pham_id", e.target.value)
                      }
                      className="w-full rounded-md px-2 py-1.5 bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 cursor-pointer"
                      disabled={isLoading}
                    >
                      <option value="">-- Chọn biến thể --</option>
                      {allVariants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={1}
                      value={row.so_luong}
                      onChange={(e) =>
                        handleChange(i, "so_luong", e.target.value)
                      }
                      className="w-full rounded-md px-2 py-1.5 bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={row.gia_nhap_tung_vat}
                      onChange={(e) =>
                        handleChange(i, "gia_nhap_tung_vat", e.target.value)
                      }
                      className="w-full rounded-md px-2 py-1.5 bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* nút */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleAddRow}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
          >
            + Thêm dòng
          </button>
          <div className="space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:from-emerald-400 hover:to-slate-500 shadow-md shadow-emerald-500/30 cursor-pointer transition"
            >
              Lưu phiếu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
