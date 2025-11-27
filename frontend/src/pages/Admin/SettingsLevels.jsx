// src/pages/Admin/SettingsLevels.jsx
import React, { useMemo, useState } from "react";
import {
  useLevelsList,
  useCreateLevel,
  useUpdateLevel,
  useDeleteLevel,
  useCheckLevelUsage,
} from "../../hooks/useLevels";
import LevelFormModal from "../../components/common/settings/LevelFormModal";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function SettingsLevels() {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading, isError } = useLevelsList(page, perPage);
  const list = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const createMut = useCreateLevel();
  const updateMut = useUpdateLevel();
  const deleteMut = useDeleteLevel();
  const checkUsage = useCheckLevelUsage();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      closeModal();
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Lỗi không xác định");
    }
  };

  const handleDelete = async (row) => {
    try {
      const usage = await checkUsage.mutateAsync(row.id);
      if (usage?.dang_su_dung) {
        alert(
          `Không thể xóa vì đang có ${usage.so_luong} sản phẩm dùng cấp độ này.`
        );
        return;
      }
      if (!confirm(`Xóa cấp độ "${row.ten_cap_do}"?`)) return;
      await deleteMut.mutateAsync(row.id);
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Lỗi không xác định");
    }
  };

  const isMutating =
    createMut.isPending ||
    updateMut.isPending ||
    deleteMut.isPending ||
    checkUsage.isPending;

  const rows = useMemo(() => list, [list]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Quản lý Cấp độ
        </h2>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-slate-600 px-4 py-2 text-white hover:from-emerald-400 hover:to-slate-500 shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm cấp độ
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl shadow-lg">
        <table className="w-full text-sm text-slate-800 dark:text-slate-100">
          <thead className="bg-slate-100/80 dark:bg-slate-900/70">
            <tr>
              <th className="px-4 py-3 text-left w-16 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Mã
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Tên cấp độ
              </th>
              <th className="px-4 py-3 text-right w-40 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-red-500 dark:text-red-400"
                >
                  Lỗi tải dữ liệu
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                >
                  Chưa có dữ liệu.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <td className="px-4 py-3">{row.id}</td>
                  <td className="px-4 py-3">{row.ma_cap_do}</td>
                  <td className="px-4 py-3">{row.ten_cap_do}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Sửa"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
                      </button>
                      <button
                        className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/40 cursor-pointer"
                        title="Xóa"
                        onClick={() => handleDelete(row)}
                      >
                        <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-300" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 rounded-lg bg-white/80 border border-slate-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer
                       dark:bg-slate-900/70 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Trước
          </button>
          <span className="text-sm">
            Trang {pagination.page || page}/{pagination.pages || 1}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() =>
              setPage((p) =>
                Math.min(p + 1, pagination.pages || Number.MAX_SAFE_INTEGER)
              )
            }
            className="px-3 py-1 rounded-lg bg-white/80 border border-slate-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer
                       dark:bg-slate-900/70 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Sau
          </button>
        </div>
      </div>

      <LevelFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editing}
        loading={isMutating}
      />
    </div>
  );
}
