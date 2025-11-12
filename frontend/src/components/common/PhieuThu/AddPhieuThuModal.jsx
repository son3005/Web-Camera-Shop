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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-slate-950 text-slate-50 rounded-xl p-6 w-[640px] space-y-4 border border-emerald-500/40">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Tạo phiếu thu mới</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* nhà cung cấp */}
        <div>
          <label className="text-sm block mb-1">Tên nhà cung cấp</label>
          <input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full border border-slate-700 rounded-md px-3 py-2 bg-slate-900 outline-none focus:border-emerald-500"
            placeholder="VD: Sony Việt Nam"
          />
        </div>

        {/* bảng biến thể */}
        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th className="p-2 text-left">Biến thể</th>
                <th className="p-2 text-left w-20">SL</th>
                <th className="p-2 text-left w-32">Giá nhập</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-slate-800">
                  <td className="p-2">
                    <select
                      value={row.bien_the_san_pham_id}
                      onChange={(e) =>
                        handleChange(i, "bien_the_san_pham_id", e.target.value)
                      }
                      className="w-full border border-slate-700 rounded-md bg-slate-900"
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
                      className="w-full border border-slate-700 rounded-md bg-slate-900"
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
                      className="w-full border border-slate-700 rounded-md bg-slate-900"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* nút */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleAddRow}
            className="px-3 py-2 rounded-md border border-slate-600 hover:bg-slate-800"
          >
            + Thêm dòng
          </button>
          <div className="space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-500"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-md bg-emerald-500 text-white"
            >
              Lưu phiếu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
