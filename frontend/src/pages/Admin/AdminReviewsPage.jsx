// src/pages/Admin/AdminReviewsPage.jsx
// Trang quản lý đánh giá sản phẩm cho Admin

import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminLayDanhGia,
  adminThongKeDanhGia,
  adminMoKhoaDanhGia,
  adminKhoaDanhGia,
} from "../../api/reviewApi";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Star,
  Filter,
  Search,
} from "lucide-react";

function formatDate(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN");
}

function vnd(n) {
  return (
    Number(n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫"
  );
}

function StatusBadge({ value }) {
  const map = {
    da_duyet: {
      label: "Đã duyệt",
      className: "bg-emerald-100 text-emerald-700",
    },
    cho_duyet: {
      label: "Chờ duyệt",
      className: "bg-amber-100 text-amber-700",
    },
    bi_tu_choi: {
      label: "Bị từ chối",
      className: "bg-red-100 text-red-700",
    },
  };
  const item = map[value] || {
    label: value || "Không rõ",
    className: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function StarsRow({ value }) {
  const arr = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {arr.map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const perPage = 20;

  // Bộ lọc
  const [filters, setFilters] = useState({
    diem_danh_gia: "",
    trang_thai: "",
    san_pham_id: "",
    nguoi_dung_id: "",
    tu_ngay: "",
    den_ngay: "",
    co_binh_luan: "", // "", "co", "khong"
  });

  const buildParams = () => {
    const params = {
      page,
      per_page: perPage,
    };

    if (filters.diem_danh_gia) {
      params.diem_danh_gia = Number(filters.diem_danh_gia);
    }
    if (filters.trang_thai) {
      params.trang_thai = filters.trang_thai;
    }
    if (filters.san_pham_id) {
      params.san_pham_id = Number(filters.san_pham_id);
    }
    if (filters.nguoi_dung_id) {
      params.nguoi_dung_id = Number(filters.nguoi_dung_id);
    }
    if (filters.tu_ngay) {
      params.tu_ngay = filters.tu_ngay;
    }
    if (filters.den_ngay) {
      params.den_ngay = filters.den_ngay;
    }
    if (filters.co_binh_luan === "co") {
      params.co_binh_luan = true;
    } else if (filters.co_binh_luan === "khong") {
      params.co_binh_luan = false;
    }

    return params;
  };

  // Query danh sách review
  const {
    data: listRes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-reviews", { page, perPage, filters }],
    queryFn: () => adminLayDanhGia(buildParams()),
    keepPreviousData: true,
  });

  const rows = useMemo(() => listRes?.data || [], [listRes]);
  const pagination = listRes?.pagination || {
    page: 1,
    pages: 1,
    total: 0,
    per_page: perPage,
  };

  // Query thống kê tổng quan
  const { data: statsRes } = useQuery({
    queryKey: ["admin-review-stats"],
    queryFn: () => adminThongKeDanhGia(),
  });

  const stats = statsRes || {
    thong_ke_theo_sao: {},
    tong_danh_gia: 0,
    trung_binh: 0,
    phan_tram_theo_sao: {},
  };

  // Mutations: duyệt / khóa
  const moKhoaMut = useMutation({
    mutationFn: (id) => adminMoKhoaDanhGia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-stats"] });
    },
    onError: (err) => {
      alert(
        err?.response?.data?.error || err?.message || "Lỗi khi mở khóa đánh giá"
      );
    },
  });

  const khoaMut = useMutation({
    mutationFn: (id) => adminKhoaDanhGia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-stats"] });
    },
    onError: (err) => {
      alert(
        err?.response?.data?.error || err?.message || "Lỗi khi khóa đánh giá"
      );
    },
  });

  const isMutating = moKhoaMut.isLoading || khoaMut.isLoading;

  const handleApplyFilter = (e) => {
    e?.preventDefault?.();
    setPage(1);
    refetch();
  };

  const handleResetFilter = () => {
    setFilters({
      diem_danh_gia: "",
      trang_thai: "",
      san_pham_id: "",
      nguoi_dung_id: "",
      tu_ngay: "",
      den_ngay: "",
      co_binh_luan: "",
    });
    setPage(1);
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Quản lý đánh giá sản phẩm
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Xem, lọc, duyệt hoặc khóa các đánh giá của khách hàng.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm hover:bg-black"
        >
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs uppercase text-slate-500 mb-1">
            Tổng số đánh giá
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.tong_danh_gia || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Điểm trung bình:{" "}
            <span className="font-semibold text-amber-500">
              {stats.trung_binh?.toFixed
                ? stats.trung_binh.toFixed(1)
                : stats.trung_binh || 0}
            </span>{" "}
            / 5
          </p>
        </div>

        {[5, 4, 3, 2, 1].map((sao) => {
          const soLuong =
            stats.thong_ke_theo_sao?.[sao] ||
            stats.thong_ke_theo_sao?.[String(sao)] ||
            0;
          const phanTram =
            stats.phan_tram_theo_sao?.[sao] ||
            stats.phan_tram_theo_sao?.[String(sao)] ||
            0;
          return (
            <div
              key={sao}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-slate-500 mb-1">{sao} sao</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {soLuong}
                </p>
              </div>
              <div className="text-right">
                <StarsRow value={sao} />
                <p className="text-xs text-slate-500 mt-1">{phanTram}%</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bộ lọc */}
      <form
        onSubmit={handleApplyFilter}
        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3"
      >
        <div className="flex items-center gap-2 text-sm font-semibold mb-1">
          <Filter size={16} />
          Bộ lọc
        </div>

        <div className="grid md:grid-cols-4 gap-3 text-sm">
          <div>
            <label className="block text-xs mb-1">Điểm đánh giá</label>
            <select
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5"
              value={filters.diem_danh_gia}
              onChange={(e) =>
                setFilters((f) => ({ ...f, diem_danh_gia: e.target.value }))
              }
            >
              <option value="">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1">Trạng thái</label>
            <select
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5"
              value={filters.trang_thai}
              onChange={(e) =>
                setFilters((f) => ({ ...f, trang_thai: e.target.value }))
              }
            >
              <option value="">Tất cả</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="cho_duyet">Chờ duyệt</option>
              <option value="bi_tu_choi">Bị từ chối</option>
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1">Sản phẩm (ID)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5"
              value={filters.san_pham_id}
              onChange={(e) =>
                setFilters((f) => ({ ...f, san_pham_id: e.target.value }))
              }
              placeholder="VD: 123"
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Người dùng (ID)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5"
              value={filters.nguoi_dung_id}
              onChange={(e) =>
                setFilters((f) => ({ ...f, nguoi_dung_id: e.target.value }))
              }
              placeholder="VD: 456"
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Từ ngày</label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5"
              value={filters.tu_ngay}
              onChange={(e) =>
                setFilters((f) => ({ ...f, tu_ngay: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Đến ngày</label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5"
              value={filters.den_ngay}
              onChange={(e) =>
                setFilters((f) => ({ ...f, den_ngay: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Bình luận</label>
            <select
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5"
              value={filters.co_binh_luan}
              onChange={(e) =>
                setFilters((f) => ({ ...f, co_binh_luan: e.target.value }))
              }
            >
              <option value="">Tất cả</option>
              <option value="co">Chỉ có bình luận</option>
              <option value="khong">Không có bình luận</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={handleResetFilter}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm"
          >
            Xoá bộ lọc
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm inline-flex items-center gap-1"
          >
            <Search size={14} /> Áp dụng
          </button>
        </div>
      </form>

      {/* Bảng danh sách đánh giá */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-3 py-2 text-left w-14">ID</th>
              <th className="px-3 py-2 text-left">Sản phẩm</th>
              <th className="px-3 py-2 text-left">Người dùng</th>
              <th className="px-3 py-2 text-left">Điểm</th>
              <th className="px-3 py-2 text-left">Bình luận</th>
              <th className="px-3 py-2 text-left">Thời gian</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-right w-40">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}

            {isError && !isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-red-500">
                  Lỗi khi tải danh sách đánh giá.
                </td>
              </tr>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  Chưa có đánh giá nào phù hợp.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              rows.map((dg) => (
                <tr
                  key={dg.id}
                  className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/60"
                >
                  <td className="px-3 py-2 align-top font-mono text-xs">
                    #{dg.id}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="font-semibold text-slate-900 dark:text-slate-50">
                      {dg.san_pham?.ten_san_pham || `SP #${dg.san_pham_id}`}
                    </div>
                    <div className="text-xs text-slate-500">
                      ID SP: {dg.san_pham_id} • CTDH: {dg.chi_tiet_don_hang_id}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium text-slate-900 dark:text-slate-50">
                      {dg.nguoi_dung?.ten || `User #${dg.nguoi_dung_id}`}
                    </div>
                    <div className="text-xs text-slate-500">
                      ID: {dg.nguoi_dung_id}
                      {dg.nguoi_dung?.email ? ` • ${dg.nguoi_dung.email}` : ""}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-amber-500">
                        {dg.diem_danh_gia}
                      </span>
                      <span className="text-xs text-slate-500">/ 5</span>
                    </div>
                    <StarsRow value={dg.diem_danh_gia} />
                  </td>
                  <td className="px-3 py-2 align-top max-w-xs">
                    {dg.binh_luan ? (
                      <p className="text-xs text-slate-800 dark:text-slate-100 line-clamp-3">
                        {dg.binh_luan}
                      </p>
                    ) : (
                      <span className="text-xs text-slate-400">
                        (Không có bình luận)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-slate-600 dark:text-slate-300">
                    <div>Tạo: {formatDate(dg.ngay_tao)}</div>
                    <div>Cập nhật: {formatDate(dg.ngay_cap_nhat)}</div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <StatusBadge value={dg.trang_thai} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        disabled={isMutating}
                        onClick={() => moKhoaMut.mutate(dg.id)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-500 disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                        Duyệt
                      </button>
                      <button
                        disabled={isMutating}
                        onClick={() => khoaMut.mutate(dg.id)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-600 text-white text-xs hover:bg-red-500 disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        Khóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200">
          <div>
            Tổng:{" "}
            <span className="font-semibold">
              {pagination.total || 0} đánh giá
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
            >
              Trước
            </button>
            <span>
              Trang{" "}
              <span className="font-semibold">{pagination.page || page}</span> /{" "}
              {pagination.pages || 1}
            </span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() =>
                setPage((p) =>
                  Math.min(p + 1, pagination.pages || Number.MAX_SAFE_INTEGER)
                )
              }
              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
