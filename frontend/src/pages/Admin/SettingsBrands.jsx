// src/pages/Admin/SettingsBrands.jsx
import React, { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useBrands } from "../../hooks/useBrands";
import BrandFormModal from "../../components/common/settings/BrandFormModal";

export default function SettingsBrands() {
  const [page, setPage] = useState(1);
  const { useListBrands, createBrand, updateBrand, deleteBrand, checkUsage } =
    useBrands();
  const { data, isLoading } = useListBrands(page, 10);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const onAdd = () => {
    setEditing(null);
    setOpen(true);
  };
  const onEdit = (row) => {
    setEditing(row);
    setOpen(true);
  };

  const onSubmit = async (form) => {
    try {
      if (editing) await updateBrand.mutateAsync({ id: editing.id, ...form });
      else await createBrand.mutateAsync(form);
      setOpen(false);
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  };

  const onDelete = async (row) => {
    try {
      const usage = await checkUsage(row.id);
      if (usage?.dang_su_dung) {
        return alert(
          `Không thể xóa. Thương hiệu đang được dùng cho ${usage.so_luong} sản phẩm.`
        );
      }
      if (confirm(`Xóa thương hiệu '${row.ten_thuong_hieu}'?`)) {
        await deleteBrand.mutateAsync(row.id);
      }
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  };

  const rows = data?.data || [];
  const pg = data?.pagination || { page: 1, pages: 1 };

  return (
    <div className="p-6 space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Quản lý Thương hiệu
        </h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:from-emerald-400 hover:to-slate-500 shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus size={18} /> Thêm thương hiệu
        </button>
      </div>

      {/* bảng */}
      <div className="rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg">
        <table className="w-full text-sm text-slate-800 dark:text-slate-100">
          <thead className="bg-slate-100/80 dark:bg-slate-900/70">
            <tr>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                ID
              </th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Mã
              </th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Tên thương hiệu
              </th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Logo
              </th>
              <th className="text-right p-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="5" className="p-6 text-center">
                  Đang tải...
                </td>
              </tr>
            )}

            {rows.map((b) => (
              <tr
                key={b.id}
                className="border-t border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
              >
                <td className="p-3">{b.id}</td>
                <td className="p-3 font-mono">{b.ma_thuong_hieu}</td>
                <td className="p-3">{b.ten_thuong_hieu}</td>
                <td className="p-3">
                  {b.logo_url ? (
                    <img
                      src={b.logo_url}
                      alt={b.ten_thuong_hieu}
                      className="h-6"
                    />
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="p-3 text-right space-x-1">
                  <button
                    onClick={() => onEdit(b)}
                    className="inline-flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Sửa"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(b)}
                    className="inline-flex items-center justify-center p-2 rounded-full text-red-600 hover:bg-red-50 dark:text-rose-400 dark:hover:bg-slate-800 cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="p-6 text-center text-slate-500 dark:text-slate-400"
                >
                  Chưa có thương hiệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex justify-end items-center gap-2 text-slate-700 dark:text-slate-200">
        <button
          className="px-3 py-1 rounded-lg border border-slate-300 bg-white/80 hover:bg-slate-50 disabled:opacity-50 cursor-pointer
                     dark:bg-slate-900/70 dark:border-slate-700 dark:hover:bg-slate-800"
          disabled={(pg.page || 1) <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Trước
        </button>
        <span className="px-2 py-1 text-sm">
          Trang {pg.page || 1}/{pg.pages || 1}
        </span>
        <button
          className="px-3 py-1 rounded-lg border border-slate-300 bg-white/80 hover:bg-slate-50 disabled:opacity-50 cursor-pointer
                     dark:bg-slate-900/70 dark:border-slate-700 dark:hover:bg-slate-800"
          disabled={(pg.page || 1) >= (pg.pages || 1)}
          onClick={() => setPage((p) => p + 1)}
        >
          Sau
        </button>
      </div>

      <BrandFormModal
        open={open}
        onClose={() => setOpen(false)}
        defaultValues={editing}
        onSubmit={onSubmit}
        loading={createBrand.isPending || updateBrand.isPending}
      />
    </div>
  );
}
