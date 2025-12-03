// src/pages/Admin/PhieuNhapPage.jsx
// ===========================================================
// Trang quản lý Phiếu Nhập (Admin) – có phân trang
// ===========================================================

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPhieuNhaps, taoPhieuNhap } from "../../api/phieuNhapApi";

// 💡 Lưu ý: folder hiện tại là `PhieuThu`, chỉ là tên cũ.
// Nếu sau này bạn đổi tên folder thành `PhieuNhap` thì nhớ sửa lại path import.
import AddPhieuNhapModal from "../../components/common/PhieuThu/AddPhieuNhapModal";
import PhieuNhapDetailModal from "../../components/common/PhieuThu/PhieuNhapDetailModal";

import { useToast } from "../../hooks/useToast";

export default function PhieuNhapPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [openCreate, setOpenCreate] = useState(false);
  const [viewId, setViewId] = useState(null);

  const [filters, setFilters] = useState({
    ma_phieu_nhap: "",
    ten_nha_cung_cap: "",
  });

  const [page, setPage] = useState(1);
  const perPage = 10;

  // Reset về trang 1 khi đổi filter
  useEffect(() => {
    setPage(1);
  }, [filters.ma_phieu_nhap, filters.ten_nha_cung_cap]);

  // ===== LẤY DANH SÁCH PHIẾU NHẬP =====
  const { data, isLoading, isError } = useQuery({
    queryKey: ["phieu-nhap", { filters, page, perPage }],
    queryFn: () =>
      getPhieuNhaps({
        page,
        per_page: perPage,
        ma_phieu_nhap: filters.ma_phieu_nhap || undefined,
        ten_nha_cung_cap: filters.ten_nha_cung_cap || undefined,
      }),
    keepPreviousData: true,
  });

  // ===== TẠO MỚI PHIẾU NHẬP =====
  const createMutation = useMutation({
    mutationFn: taoPhieuNhap,
    onSuccess: (res) => {
      // Refetch lại tất cả query phiếu nhập
      queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "phieu-nhap",
      });

      // Refetch lại tất cả danh sách sản phẩm (Inventory dùng "san-pham")
      queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "san-pham",
      });

      setOpenCreate(false);
      const msg =
        res?.message || "Tạo phiếu nhập thành công và đã cộng vào tồn kho";
      success(msg);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Tạo phiếu nhập thất bại";
      console.error("Tạo phiếu nhập lỗi:", err);
      toastError(msg);
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
    <div className="p-6 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 text-slate-800">
      {/* header */}
      <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Phiếu nhập kho</h1>
          <p className="text-sm text-slate-500">
            Quản lý các lần nhập hàng, tự động cộng số lượng cho biến thể sản
            phẩm.
          </p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-slate-600 
                     hover:from-emerald-400 hover:to-slate-500 shadow-md hover:shadow-lg 
                     transition focus:outline-none focus:ring-2 focus:ring-emerald-500/70 
                     disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={createMutation.isLoading}
        >
          {createMutation.isLoading ? "Đang lưu..." : "+ Tạo phiếu nhập"}
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-4">
        {/* bộ lọc */}
        <div className="flex flex-wrap gap-3 max-w-3xl">
          <input
            value={filters.ma_phieu_nhap}
            onChange={(e) =>
              setFilters((f) => ({ ...f, ma_phieu_nhap: e.target.value }))
            }
            placeholder="Lọc theo mã phiếu"
            className="w-56 px-3 py-2 text-sm rounded-lg border bg-white/90 text-slate-800 placeholder:text-slate-400 shadow-inner
                       border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
          />
          <input
            value={filters.ten_nha_cung_cap}
            onChange={(e) =>
              setFilters((f) => ({ ...f, ten_nha_cung_cap: e.target.value }))
            }
            placeholder="Lọc theo nhà cung cấp"
            className="w-64 px-3 py-2 text-sm rounded-lg border bg-white/90 text-slate-800 placeholder:text-slate-400 shadow-inner
                       border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
          />
        </div>

        {/* card chứa bảng */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-emerald-50 shadow-lg overflow-hidden">
          {isLoading && (
            <div className="p-6 text-center text-slate-600">
              Đang tải phiếu nhập...
            </div>
          )}

          {isError && (
            <div className="p-6 text-center text-red-500">
              Không tải được danh sách phiếu nhập
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <table className="w-full text-left text-sm text-slate-800">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500">
                      Mã phiếu
                    </th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500">
                      Nhà cung cấp
                    </th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wide text-slate-500">
                      Ngày nhập
                    </th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wide text-right text-slate-500">
                      Tổng SL
                    </th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wide text-right text-slate-500">
                      Tổng giá trị
                    </th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wide text-right text-slate-500">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((pt) => (
                    <tr
                      key={pt.id}
                      className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-3">
                        <button
                          onClick={() => setViewId(pt.id)}
                          className="text-emerald-600 hover:underline cursor-pointer font-medium"
                        >
                          {pt.ma_phieu_nhap}
                        </button>
                      </td>
                      <td className="p-3">{pt.ten_nha_cung_cap || "-"}</td>
                      <td className="p-3">
                        {pt.ngay_nhap
                          ? new Date(pt.ngay_nhap).toLocaleString("vi-VN")
                          : "-"}
                      </td>
                      <td className="p-3 text-right">
                        {pt.tong_so_luong ?? 0}
                      </td>
                      <td className="p-3 text-right">
                        {formatVnd(pt.tong_gia_tri)}
                      </td>
                      <td className="p-3 text-right space-x-3">
                        <button
                          onClick={() => setViewId(pt.id)}
                          className="text-sky-600 hover:underline cursor-pointer"
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
                        className="p-4 text-center text-slate-500"
                      >
                        Chưa có phiếu nhập nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Phân trang */}
              {pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-600 border-t border-slate-100">
                  <span>
                    Đang hiển thị{" "}
                    {items.length > 0 ? (currentPage - 1) * perPage + 1 : 0} –{" "}
                    {Math.min(currentPage * perPage, total)} / {total} phiếu
                    nhập
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <span>
                      Trang {currentPage} / {pages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      disabled={currentPage >= pages}
                      className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* modal tạo */}
      {openCreate && (
        <AddPhieuNhapModal
          onClose={() => setOpenCreate(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      )}

      {/* modal xem chi tiết */}
      {viewId && (
        <PhieuNhapDetailModal
          phieuNhapId={viewId}
          onClose={() => setViewId(null)}
        />
      )}
    </div>
  );
}
