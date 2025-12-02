// src/pages/Admin/SuppliersPage.jsx
// ===========================================================
// Trang quản lý Nhà Cung Cấp (Admin)
// ===========================================================

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  kichHoatSupplier,
  ngungHoatDongSupplier,
} from "../../api/supplierApi";
import AddEditSupplierModal from "../../components/common/Suppliers/AddEditSupplierModal";
import { useToast } from "../../hooks/useToast";

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState({
    ten_nha_cung_cap: "",
    so_dien_thoai: "",
    email: "",
    trang_thai: "all", // all | kich_hoat | ngung_hoat_dong
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [
    filters.ten_nha_cung_cap,
    filters.so_dien_thoai,
    filters.email,
    filters.trang_thai,
  ]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["suppliers", { page, limit, filters }],
    queryFn: () => getSuppliers({ page, limit, filters }),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const hasMore = data?.hasMore;

  // ==== Mutations ====
  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      toast.success("Tạo nhà cung cấp thành công");
      queryClient.invalidateQueries(["suppliers"]);
      setModalOpen(false);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error ||
        "Không thể tạo nhà cung cấp. Vui lòng thử lại.";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateSupplier(id, payload),
    onSuccess: () => {
      toast.success("Cập nhật nhà cung cấp thành công");
      queryClient.invalidateQueries(["suppliers"]);
      setModalOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error ||
        "Không thể cập nhật nhà cung cấp. Vui lòng thử lại.";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSupplier(id),
    onSuccess: (res) => {
      toast.success(res?.message || "Xóa nhà cung cấp thành công");
      queryClient.invalidateQueries(["suppliers"]);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error ||
        "Không thể xóa nhà cung cấp (có thể đang có phiếu nhập liên quan).";
      toast.error(msg);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, action }) =>
      action === "kich_hoat" ? kichHoatSupplier(id) : ngungHoatDongSupplier(id),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái nhà cung cấp thành công");
      queryClient.invalidateQueries(["suppliers"]);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error ||
        "Không thể thay đổi trạng thái nhà cung cấp. Vui lòng thử lại.";
      toast.error(msg);
    },
  });

  const openCreateModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleDelete = (item) => {
    if (
      window.confirm(
        `Bạn chắc chắn muốn xóa nhà cung cấp "${item.ten_nha_cung_cap}"?`
      )
    ) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleStatusToggle = (item) => {
    const isActive = item.trang_thai === "kich_hoat";
    const action = isActive ? "ngung_hoat_dong" : "kich_hoat";

    if (
      window.confirm(
        `Bạn muốn ${isActive ? "ngừng hoạt động" : "kích hoạt"} nhà cung cấp "${
          item.ten_nha_cung_cap
        }"?`
      )
    ) {
      toggleStatusMutation.mutate({ id: item.id, action });
    }
  };

  const statusLabel = (status) =>
    status === "kich_hoat"
      ? "Đang hoạt động"
      : status === "ngung_hoat_dong"
      ? "Ngừng hoạt động"
      : status || "-";

  const statusClass = (status) =>
    status === "kich_hoat"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Quản lý Nhà Cung Cấp
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Theo dõi danh sách nhà cung cấp, trạng thái và thông tin liên hệ.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:from-emerald-400 hover:to-slate-500 shadow-md hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
        >
          + Thêm nhà cung cấp
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-3xl shadow-md p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tên nhà cung cấp
          </label>
          <input
            value={filters.ten_nha_cung_cap}
            onChange={(e) =>
              setFilters((f) => ({ ...f, ten_nha_cung_cap: e.target.value }))
            }
            placeholder="Nhập tên..."
            className="w-56 px-3 py-2 text-sm rounded-lg border bg-white/80 text-slate-800 placeholder:text-slate-400 shadow-inner
                       border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/70
                       dark:bg-slate-900/50 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Số điện thoại
          </label>
          <input
            value={filters.so_dien_thoai}
            onChange={(e) =>
              setFilters((f) => ({ ...f, so_dien_thoai: e.target.value }))
            }
            placeholder="SĐT..."
            className="w-40 px-3 py-2 text-sm rounded-lg border bg-white/80 text-slate-800 placeholder:text-slate-400 shadow-inner
                       border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/70
                       dark:bg-slate-900/50 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Email
          </label>
          <input
            value={filters.email}
            onChange={(e) =>
              setFilters((f) => ({ ...f, email: e.target.value }))
            }
            placeholder="Email..."
            className="w-52 px-3 py-2 text-sm rounded-lg border bg-white/80 text-slate-800 placeholder:text-slate-400 shadow-inner
                       border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/70
                       dark:bg-slate-900/50 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Trạng thái
          </label>
          <select
            value={filters.trang_thai}
            onChange={(e) =>
              setFilters((f) => ({ ...f, trang_thai: e.target.value }))
            }
            className="w-44 px-3 py-2 text-sm rounded-lg border bg-white/80 text-slate-800 shadow-inner
                       border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/70
                       dark:bg-slate-900/50 dark:text-slate-100 dark:border-slate-700"
          >
            <option value="all">Tất cả</option>
            <option value="kich_hoat">Đang hoạt động</option>
            <option value="ngung_hoat_dong">Ngừng hoạt động</option>
          </select>
        </div>
      </div>

      {/* Bảng */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg overflow-hidden">
        {isLoading && (
          <div className="p-6 text-center text-slate-600 dark:text-slate-200">
            Đang tải nhà cung cấp...
          </div>
        )}

        {isError && (
          <div className="p-6 text-center text-red-500 dark:text-red-400">
            Không tải được danh sách nhà cung cấp.
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <table className="w-full text-left text-sm text-slate-800 dark:text-slate-100">
              <thead className="bg-slate-100/80 dark:bg-slate-900/70">
                <tr>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Mã NCC
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Tên nhà cung cấp
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Người đại diện
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Liên hệ
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Trạng thái
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-right text-slate-500 dark:text-slate-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((ncc) => (
                  <tr
                    key={ncc.id}
                    className="border-t border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="p-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                      {ncc.ma_nha_cung_cap}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{ncc.ten_nha_cung_cap}</div>
                      {ncc.dia_chi && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {ncc.dia_chi}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {ncc.nguoi_dai_dien || (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {ncc.so_dien_thoai && (
                        <div className="text-slate-800 dark:text-slate-100">
                          {ncc.so_dien_thoai}
                        </div>
                      )}
                      {ncc.email && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {ncc.email}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(
                          ncc.trang_thai
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-70" />
                        {statusLabel(ncc.trang_thai)}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleStatusToggle(ncc)}
                        className="text-xs px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        {ncc.trang_thai === "kich_hoat"
                          ? "Ngừng hoạt động"
                          : "Kích hoạt"}
                      </button>
                      <button
                        onClick={() => openEditModal(ncc)}
                        className="text-xs px-2 py-1 rounded-lg text-sky-600 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/40 cursor-pointer transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(ncc)}
                        className="text-xs px-2 py-1 rounded-lg text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/40 cursor-pointer transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-4 text-center text-slate-500 dark:text-slate-400"
                    >
                      Chưa có nhà cung cấp nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination đơn giản dựa trên hasMore */}
            <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>
                Trang {page}
                {isFetching && (
                  <span className="ml-2 text-xs">(đang tải...)</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40"
                >
                  Trước
                </button>
                <button
                  onClick={() => hasMore && setPage((p) => p + 1)}
                  disabled={!hasMore}
                  className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal thêm / sửa */}
      {modalOpen && (
        <AddEditSupplierModal
          supplier={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={(payload) => {
            if (editing) {
              updateMutation.mutate({ id: editing.id, payload });
            } else {
              createMutation.mutate(payload);
            }
          }}
        />
      )}
    </div>
  );
}
