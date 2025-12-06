// src/pages/Admin/SuppliersPage.jsx
// ===========================================================
// Trang quản lý Nhà Cung Cấp (Admin)
// - Lọc / tìm kiếm
// - Danh sách NCC + trạng thái
// - Thêm / sửa / xóa / kích hoạt / ngừng hoạt động
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

  // Phân trang đơn giản: page + limit cố định
  const [page, setPage] = useState(1);
  const limit = 10;

  // State bộ lọc
  const [filters, setFilters] = useState({
    ten_nha_cung_cap: "",
    so_dien_thoai: "",
    email: "",
    trang_thai: "all", // all | kich_hoat | ngung_hoat_dong
  });

  // State modal thêm / sửa
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = tạo mới, khác null = edit

  // Reset page về 1 mỗi khi filters thay đổi
  useEffect(() => {
    setPage(1);
  }, [
    filters.ten_nha_cung_cap,
    filters.so_dien_thoai,
    filters.email,
    filters.trang_thai,
  ]);

  // Lấy danh sách nhà cung cấp
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["suppliers", { page, limit, filters }],
    queryFn: () => getSuppliers({ page, limit, filters }),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const hasMore = data?.hasMore; // cho nút "Sau" đơn giản

  // ================== MUTATIONS ==================

  // Tạo mới NCC
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

  // Cập nhật NCC
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

  // Xóa NCC
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

  // Kích hoạt / ngừng hoạt động NCC
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

  // ================== HANDLERS ==================

  // Mở modal tạo mới
  const openCreateModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const openEditModal = (item) => {
    setEditing(item);
    setModalOpen(true);
  };

  // Xử lý xóa
  const handleDelete = (item) => {
    if (
      window.confirm(
        `Bạn chắc chắn muốn xóa nhà cung cấp "${item.ten_nha_cung_cap}"?`
      )
    ) {
      deleteMutation.mutate(item.id);
    }
  };

  // Xử lý chuyển trạng thái (kích hoạt / ngừng hoạt động)
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

  // Label trạng thái để hiển thị đẹp
  const statusLabel = (status) =>
    status === "kich_hoat"
      ? "Đang hoạt động"
      : status === "ngung_hoat_dong"
      ? "Ngừng hoạt động"
      : status || "-";

  // Class màu theo trạng thái (badge)
  const statusClass = (status) =>
    status === "kich_hoat"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-rose-100 text-rose-700";

  // ================== RENDER ==================

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý Nhà Cung Cấp
          </h1>
          <p className="text-sm text-slate-600">
            Theo dõi danh sách nhà cung cấp, trạng thái và thông tin liên hệ.
          </p>
        </div>
        {/* Nút mở modal thêm mới */}
        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
        >
          + Thêm nhà cung cấp
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white/90 backdrop-blur-xl border border-emerald-50 rounded-3xl shadow-md p-4 flex flex-wrap gap-3 items-end max-w-7xl mx-auto">
        {/* Filter: tên NCC */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Tên nhà cung cấp
          </label>
          <input
            value={filters.ten_nha_cung_cap}
            onChange={(e) =>
              setFilters((f) => ({ ...f, ten_nha_cung_cap: e.target.value }))
            }
            placeholder="Nhập tên..."
            className="w-56 px-3 py-2 text-sm rounded-lg border bg-white text-slate-800 placeholder:text-slate-400 shadow-inner border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
          />
        </div>

        {/* Filter: SĐT */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Số điện thoại
          </label>
          <input
            value={filters.so_dien_thoai}
            onChange={(e) =>
              setFilters((f) => ({ ...f, so_dien_thoai: e.target.value }))
            }
            placeholder="SĐT..."
            className="w-40 px-3 py-2 text-sm rounded-lg border bg-white text-slate-800 placeholder:text-slate-400 shadow-inner border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
          />
        </div>

        {/* Filter: Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Email</label>
          <input
            value={filters.email}
            onChange={(e) =>
              setFilters((f) => ({ ...f, email: e.target.value }))
            }
            placeholder="Email..."
            className="w-52 px-3 py-2 text-sm rounded-lg border bg-white text-slate-800 placeholder:text-slate-400 shadow-inner border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
          />
        </div>

        {/* Filter: Trạng thái */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Trạng thái
          </label>
          <select
            value={filters.trang_thai}
            onChange={(e) =>
              setFilters((f) => ({ ...f, trang_thai: e.target.value }))
            }
            className="w-44 px-3 py-2 text-sm rounded-lg border bg-white text-slate-800 shadow-inner border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
          >
            <option value="all">Tất cả</option>
            <option value="kich_hoat">Đang hoạt động</option>
            <option value="ngung_hoat_dong">Ngừng hoạt động</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách NCC */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-emerald-50 shadow-lg overflow-hidden max-w-7xl mx-auto">
        {/* Trạng thái loading / error */}
        {isLoading && (
          <div className="p-6 text-center text-slate-600">
            Đang tải nhà cung cấp...
          </div>
        )}

        {isError && (
          <div className="p-6 text-center text-red-500">
            Không tải được danh sách nhà cung cấp.
          </div>
        )}

        {/* Khi không loading & không error => hiển thị bảng */}
        {!isLoading && !isError && (
          <>
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500">
                    Mã NCC
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500">
                    Tên nhà cung cấp
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500">
                    Người đại diện
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500">
                    Liên hệ
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500">
                    Trạng thái
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-right text-slate-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Nếu có dữ liệu */}
                {items.map((ncc) => (
                  <tr
                    key={ncc.id}
                    className="border-t border-slate-100 hover:bg-emerald-50/60 transition-colors"
                  >
                    {/* Mã NCC */}
                    <td className="p-3 text-xs font-mono text-slate-500">
                      {ncc.ma_nha_cung_cap}
                    </td>

                    {/* Tên NCC + địa chỉ */}
                    <td className="p-3">
                      <div className="font-medium">{ncc.ten_nha_cung_cap}</div>
                      {ncc.dia_chi && (
                        <div className="text-xs text-slate-500">
                          {ncc.dia_chi}
                        </div>
                      )}
                    </td>

                    {/* Người đại diện */}
                    <td className="p-3">
                      <div className="text-sm">
                        {ncc.nguoi_dai_dien || (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Liên hệ: SĐT + Email */}
                    <td className="p-3 text-sm">
                      {ncc.so_dien_thoai && (
                        <div className="text-slate-800">
                          {ncc.so_dien_thoai}
                        </div>
                      )}
                      {ncc.email && (
                        <div className="text-xs text-slate-500">
                          {ncc.email}
                        </div>
                      )}
                    </td>

                    {/* Badge trạng thái */}
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(
                          ncc.trang_thai
                        )}`}
                      >
                        {/* chấm màu nhỏ phía trước */}
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-70" />
                        {statusLabel(ncc.trang_thai)}
                      </span>
                    </td>

                    {/* Thao tác: kích hoạt / ngừng hoạt động / sửa / xóa */}
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleStatusToggle(ncc)}
                        className="text-xs px-2 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-emerald-300 transition cursor-pointer"
                      >
                        {ncc.trang_thai === "kich_hoat"
                          ? "Ngừng hoạt động"
                          : "Kích hoạt"}
                      </button>
                      <button
                        onClick={() => openEditModal(ncc)}
                        className="text-xs px-2 py-1 rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 hover:text-sky-800 border border-sky-100 cursor-pointer transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(ncc)}
                        className="text-xs px-2 py-1 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-100 cursor-pointer transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Không có dữ liệu */}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500">
                      Chưa có nhà cung cấp nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination đơn giản dựa trên hasMore */}
            <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-600 border-t border-slate-100">
              <span>
                Trang {page}
                {isFetching && (
                  <span className="ml-2 text-xs text-slate-400">
                    (đang tải...)
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Trước
                </button>
                <button
                  onClick={() => hasMore && setPage((p) => p + 1)}
                  disabled={!hasMore}
                  className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal thêm / sửa nhà cung cấp */}
      {modalOpen && (
        <AddEditSupplierModal
          supplier={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={(payload) => {
            if (editing) {
              // Chế độ chỉnh sửa
              updateMutation.mutate({ id: editing.id, payload });
            } else {
              // Chế độ thêm mới
              createMutation.mutate(payload);
            }
          }}
        />
      )}
    </div>
  );
}
