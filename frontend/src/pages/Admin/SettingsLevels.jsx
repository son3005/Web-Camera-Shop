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
      // kiểm tra sử dụng
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Quản lý Cấp độ</h2>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500"
        >
          <Plus className="w-4 h-4" />
          Thêm cấp độ
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-700">
        <table className="w-full">
          <thead className="bg-slate-800/70 text-slate-200">
            <tr>
              <th className="px-4 py-3 text-left w-16">ID</th>
              <th className="px-4 py-3 text-left">Mã</th>
              <th className="px-4 py-3 text-left">Tên cấp độ</th>
              <th className="px-4 py-3 text-right w-40">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-red-400">
                  Lỗi tải dữ liệu
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center">
                  Chưa có dữ liệu.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-slate-800 hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3">{row.id}</td>
                  <td className="px-4 py-3">{row.ma_cap_do}</td>
                  <td className="px-4 py-3">{row.ten_cap_do}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 rounded-lg hover:bg-slate-700"
                        title="Sửa"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="w-4 h-4 text-emerald-400" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-slate-700"
                        title="Xóa"
                        onClick={() => handleDelete(row)}
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-800 text-slate-300">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 rounded-lg bg-slate-800 disabled:opacity-50"
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
            className="px-3 py-1 rounded-lg bg-slate-800 disabled:opacity-50"
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
