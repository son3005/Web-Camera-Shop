// src/pages/Admin/SettingsCategories.jsx
import React from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import CategoryFormModal from "../../components/common/settings/CategoryFormModal";

const SettingsCategories = () => {
  const {
    useGetCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
    useCheckCategoryUsage,
  } = useCategories();

  const [page, setPage] = React.useState(1);
  const per_page = 10;

  const { data, isLoading, refetch } = useGetCategories({ page, per_page });
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();
  const checkUsage = useCheckCategoryUsage();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  const handleCreate = async (values) => {
    try {
      await createMut.mutateAsync(values);
      setOpen(false);
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  };

  const handleUpdate = async (values) => {
    try {
      await updateMut.mutateAsync({ id: editing.id, ...values });
      setEditing(null);
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  };

  const handleDelete = async (cat) => {
    try {
      const usage = await checkUsage.mutateAsync(cat.id);
      if (usage?.dang_su_dung) {
        return alert(
          `Không thể xóa vì đang có ${usage.so_luong} sản phẩm dùng danh mục này.`
        );
      }
      if (confirm(`Xóa danh mục "${cat.ten_danh_muc}"?`)) {
        await deleteMut.mutateAsync(cat.id);
      }
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  };

  React.useEffect(() => {
    // phòng khi route / dính strict_slashes backend khác nhau
    refetch();
  }, [page, refetch]);

  const rows = data?.data ?? [];
  const pag = data?.pagination ?? { page: 1, pages: 1 };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Quản lý Danh mục</h2>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white flex items-center gap-2"
        >
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
        <table className="w-full">
          <thead className="bg-slate-900/20">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Mã</th>
              <th className="px-4 py-3 text-left">Tên danh mục</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center">
                  Chưa có dữ liệu.
                </td>
              </tr>
            ) : (
              rows.map((cat) => (
                <tr key={cat.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{cat.id}</td>
                  <td className="px-4 py-3">{cat.ma_danh_muc}</td>
                  <td className="px-4 py-3">{cat.ten_danh_muc}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                        onClick={() => setEditing(cat)}
                        title="Sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-red-600 hover:bg-red-500"
                        onClick={() => handleDelete(cat)}
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination đơn giản */}
      <div className="flex justify-end items-center gap-2 mt-3">
        <button
          disabled={pag.page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 rounded-lg bg-slate-700 disabled:opacity-50"
        >
          Trước
        </button>
        <span>
          Trang {pag.page}/{pag.pages || 1}
        </span>
        <button
          disabled={pag.page >= (pag.pages || 1)}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded-lg bg-slate-700 disabled:opacity-50"
        >
          Sau
        </button>
      </div>

      {/* Modal thêm */}
      <CategoryFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Modal sửa */}
      <CategoryFormModal
        open={!!editing}
        defaultValues={editing || undefined}
        onClose={() => setEditing(null)}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default SettingsCategories;
