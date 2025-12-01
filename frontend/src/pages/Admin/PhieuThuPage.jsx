// src/pages/Admin/PhieuThuPage.jsx
// ===========================================================
// Trang quản lý Phiếu Thu (Admin) – có phân trang
// ===========================================================

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPhieuThus, taoPhieuThu } from "../../api/phieuThuApi";
import AddPhieuThuModal from "../../components/common/PhieuThu/AddPhieuThuModal";
import PhieuThuDetailModal from "../../components/common/PhieuThu/PhieuThuDetailModal";

export default function PhieuThuPage() {
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [viewId, setViewId] = useState(null);

  const [filters, setFilters] = useState({
    ma_phieu_thu: "",
    ten_nha_cung_cap: "",
  });

  const [page, setPage] = useState(1);
  const perPage = 10;

  // reset về trang 1 khi filter đổi
  useEffect(() => {
    setPage(1);
  }, [filters.ma_phieu_thu, filters.ten_nha_cung_cap]);

  // ===== Danh sách =====
  const { data, isLoading, isError } = useQuery({
    queryKey: ["phieu-thu", { filters, page, perPage }],
    queryFn: () =>
      getPhieuThus({
        page,
        per_page: perPage,
        ma_phieu_thu: filters.ma_phieu_thu || undefined,
        ten_nha_cung_cap: filters.ten_nha_cung_cap || undefined,
      }),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: taoPhieuThu,
    onSuccess: () => {
      queryClient.invalidateQueries(["phieu-thu"]);
      setOpenCreate(false);
    },
  });

  const formatVnd = (n) =>
    Number(n || 0).toLocaleString("vi-VN", {
      maximumFractionDigits: 0,
    }) + "₫";

  const items = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination.total ?? items.length;
  const pages = pagination.pages ?? 1;
  const currentPage = pagination.page ?? page;

  return (
    <div className="p-6 space-y-6">
      {/* header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Quản lý Phiếu Thu
        </h1>
        <button
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:from-emerald-400 hover:to-slate-500 shadow-md hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
        >
          + Tạo phiếu thu
        </button>
      </div>

      {/* bộ lọc */}
      <div className="flex gap-3 max-w-3xl">
        <input
          value={filters.ma_phieu_thu}
          onChange={(e) =>
            setFilters((f) => ({ ...f, ma_phieu_thu: e.target.value }))
          }
          placeholder="Lọc theo mã phiếu"
          className="w-56 px-3 py-2 text-sm rounded-lg border bg-white/80 text-slate-800 placeholder:text-slate-400 shadow-inner
                     border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/70
                     dark:bg-slate-900/50 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500"
        />
        <input
          value={filters.ten_nha_cung_cap}
          onChange={(e) =>
            setFilters((f) => ({ ...f, ten_nha_cung_cap: e.target.value }))
          }
          placeholder="Lọc theo nhà cung cấp"
          className="w-64 px-3 py-2 text-sm rounded-lg border bg-white/80 text-slate-800 placeholder:text-slate-400 shadow-inner
                     border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/70
                     dark:bg-slate-900/50 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500"
        />
      </div>

      {/* card chứa bảng */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg overflow-hidden">
        {isLoading && (
          <div className="p-6 text-center text-slate-600 dark:text-slate-200">
            Đang tải phiếu thu...
          </div>
        )}

        {isError && (
          <div className="p-6 text-center text-red-500 dark:text-red-400">
            Không tải được danh sách phiếu thu
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <table className="w-full text-left text-sm text-slate-800 dark:text-slate-100">
              <thead className="bg-slate-100/80 dark:bg-slate-900/70">
                <tr>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Mã phiếu
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Nhà cung cấp
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Ngày nhập
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-right text-slate-500 dark:text-slate-400">
                    Tổng SL
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-right text-slate-500 dark:text-slate-400">
                    Tổng giá trị
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase tracking-wide text-right text-slate-500 dark:text-slate-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((pt) => (
                  <tr
                    key={pt.id}
                    className="border-t border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="p-3">
                      <button
                        onClick={() => setViewId(pt.id)}
                        className="text-emerald-600 dark:text-emerald-300 hover:underline cursor-pointer"
                      >
                        {pt.ma_phieu_thu}
                      </button>
                    </td>
                    <td className="p-3">{pt.ten_nha_cung_cap}</td>
                    <td className="p-3">
                      {pt.ngay_thu
                        ? new Date(pt.ngay_thu).toLocaleString("vi-VN")
                        : "-"}
                    </td>
                    <td className="p-3 text-right">{pt.tong_so_luong ?? 0}</td>
                    <td className="p-3 text-right">
                      {formatVnd(pt.tong_gia_tri)}
                    </td>
                    <td className="p-3 text-right space-x-3">
                      <button
                        onClick={() => setViewId(pt.id)}
                        className="text-sky-600 dark:text-sky-300 hover:underline cursor-pointer"
                      >
                        Xem
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
                      Chưa có phiếu thu nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Phân trang */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-700/60">
                <span>
                  Đang hiển thị{" "}
                  {items.length > 0 ? (currentPage - 1) * perPage + 1 : 0} –{" "}
                  {Math.min(currentPage * perPage, total)} / {total} phiếu thu
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <span>
                    Trang {currentPage} / {pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={currentPage >= pages}
                    className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* modal tạo */}
      {openCreate && (
        <AddPhieuThuModal
          onClose={() => setOpenCreate(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      )}

      {/* modal xem chi tiết */}
      {viewId && (
        <PhieuThuDetailModal
          phieuThuId={viewId}
          onClose={() => setViewId(null)}
        />
      )}
    </div>
  );
}
