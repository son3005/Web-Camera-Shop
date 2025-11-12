// src/pages/Admin/PhieuThuPage.jsx
// ===========================================================
// Trang quản lý Phiếu Thu (Admin) – khớp field backend
// ===========================================================

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPhieuThus, taoPhieuThu } from "../../api/phieuThuApi";
import AddPhieuThuModal from "../../components/common/PhieuThu/AddPhieuThuModal";
import PhieuThuDetailModal from "../../components/common/PhieuThu/PhieuThuDetailModal";

export default function PhieuThuPage() {
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [viewId, setViewId] = useState(null);

  // lọc đơn giản
  const [filters, setFilters] = useState({
    ma_phieu_thu: "",
    ten_nha_cung_cap: "",
  });

  // ===== Danh sách =====
  const { data, isLoading, isError } = useQuery({
    queryKey: ["phieu-thu", filters],
    queryFn: () =>
      getPhieuThus({
        page: 1,
        per_page: 50,
        ma_phieu_thu: filters.ma_phieu_thu || undefined,
        ten_nha_cung_cap: filters.ten_nha_cung_cap || undefined,
      }),
  });

  // ===== Tạo mới =====
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

  return (
    <div className="p-6 space-y-4">
      {/* header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Quản lý Phiếu Thu</h1>
        <button
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg"
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
          className="bg-slate-900/30 border border-slate-700 rounded-md px-3 py-2 text-sm text-white w-56"
        />
        <input
          value={filters.ten_nha_cung_cap}
          onChange={(e) =>
            setFilters((f) => ({ ...f, ten_nha_cung_cap: e.target.value }))
          }
          placeholder="Lọc theo nhà cung cấp"
          className="bg-slate-900/30 border border-slate-700 rounded-md px-3 py-2 text-sm text-white w-64"
        />
      </div>

      {/* bảng */}
      {isLoading && <div>Đang tải phiếu thu...</div>}
      {isError && (
        <div className="text-red-400">Không tải được danh sách phiếu thu</div>
      )}

      {!isLoading && !isError && (
        <table className="w-full text-left border border-slate-700/60 rounded-lg overflow-hidden text-white">
          <thead className="bg-slate-900/40">
            <tr>
              <th className="p-2">Mã phiếu</th>
              <th className="p-2">Nhà cung cấp</th>
              <th className="p-2">Ngày nhập</th>
              <th className="p-2 text-right">Tổng SL</th>
              <th className="p-2 text-right">Tổng giá trị</th>
              <th className="p-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(data?.data || []).map((pt) => (
              <tr
                key={pt.id}
                className="border-t border-slate-700/40 hover:bg-slate-900/30"
              >
                <td className="p-2">
                  <button
                    onClick={() => setViewId(pt.id)}
                    className="text-emerald-200 hover:underline"
                  >
                    {pt.ma_phieu_thu}
                  </button>
                </td>
                <td className="p-2">{pt.ten_nha_cung_cap}</td>
                <td className="p-2">
                  {pt.ngay_thu
                    ? new Date(pt.ngay_thu).toLocaleString("vi-VN")
                    : "-"}
                </td>
                <td className="p-2 text-right">{pt.tong_so_luong ?? 0}</td>
                <td className="p-2 text-right">{formatVnd(pt.tong_gia_tri)}</td>
                <td className="p-2 text-right space-x-3">
                  <button
                    onClick={() => setViewId(pt.id)}
                    className="text-sky-300 hover:underline"
                  >
                    Xem
                  </button>
                  {/* không render nút Xóa vì backend nói không cho xóa */}
                </td>
              </tr>
            ))}

            {(!data?.data || data.data.length === 0) && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-300">
                  Chưa có phiếu thu nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

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
