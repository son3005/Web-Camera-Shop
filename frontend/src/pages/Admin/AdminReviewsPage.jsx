// src/pages/Admin/AdminReviewsPage.jsx
// Trang quản lý đánh giá sản phẩm cho Admin — LUÔN dùng theme Light

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

// ================== BADGE TRẠNG THÁI ==================
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

// ================== ICON SAO ==================
function StarsRow({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
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

// ================== COMPONENT CHÍNH ==================
export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 20;

  const [filters, setFilters] = useState({
    diem_danh_gia: "",
    trang_thai: "",
    san_pham_id: "",
    nguoi_dung_id: "",
    tu_ngay: "",
    den_ngay: "",
    co_binh_luan: "",
  });

  const buildParams = () => {
    const params = { page, per_page: perPage };

    if (filters.diem_danh_gia)
      params.diem_danh_gia = Number(filters.diem_danh_gia);
    if (filters.trang_thai) params.trang_thai = filters.trang_thai;
    if (filters.san_pham_id) params.san_pham_id = Number(filters.san_pham_id);
    if (filters.nguoi_dung_id)
      params.nguoi_dung_id = Number(filters.nguoi_dung_id);
    if (filters.tu_ngay) params.tu_ngay = filters.tu_ngay;
    if (filters.den_ngay) params.den_ngay = filters.den_ngay;

    if (filters.co_binh_luan === "co") params.co_binh_luan = true;
    else if (filters.co_binh_luan === "khong") params.co_binh_luan = false;

    return params;
  };

  // ================== QUERY ==================
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

  const { data: statsRes } = useQuery({
    queryKey: ["admin-review-stats"],
    queryFn: adminThongKeDanhGia,
  });

  const stats = statsRes || {
    thong_ke_theo_sao: {},
    tong_danh_gia: 0,
    trung_binh: 0,
    phan_tram_theo_sao: {},
  };

  const moKhoaMut = useMutation({
    mutationFn: adminMoKhoaDanhGia,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-reviews"]);
      queryClient.invalidateQueries(["admin-review-stats"]);
    },
  });

  const khoaMut = useMutation({
    mutationFn: adminKhoaDanhGia,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-reviews"]);
      queryClient.invalidateQueries(["admin-review-stats"]);
    },
  });

  const isMutating = moKhoaMut.isLoading || khoaMut.isLoading;

  // ================== RESET & APPLY ==================
  const handleApplyFilter = (e) => {
    e.preventDefault();
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

  // ================== UI ==================
  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-emerald-50 via-white to-slate-100 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Quản lý đánh giá sản phẩm
          </h1>
          <p className="text-sm text-slate-600">
            Xem, lọc, duyệt hoặc khóa các đánh giá của khách hàng.
          </p>
        </div>

        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm hover:bg-black hover:shadow-md cursor-pointer transition-all"
        >
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* ===== THỐNG KÊ ===== */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 mb-1">
            Tổng số đánh giá
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {stats.tong_danh_gia}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Điểm trung bình:{" "}
            <span className="font-semibold text-amber-500">
              {stats.trung_binh?.toFixed?.(1) ?? stats.trung_binh}
            </span>{" "}
            / 5
          </p>
        </div>

        {[5, 4, 3, 2, 1].map((sao) => (
          <div
            key={sao}
            className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-xs text-slate-500 mb-1">{sao} sao</p>
              <p className="text-lg font-semibold text-slate-900">
                {stats.thong_ke_theo_sao?.[sao] || 0}
              </p>
            </div>
            <div className="text-right">
              <StarsRow value={sao} />
              <p className="text-xs text-slate-500 mt-1">
                {stats.phan_tram_theo_sao?.[sao] || 0}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== BỘ LỌC ===== */}
      <form
        onSubmit={handleApplyFilter}
        className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm"
      >
        <div className="flex items-center gap-2 text-sm font-semibold mb-1">
          <Filter size={16} /> Bộ lọc
        </div>

        <div className="grid md:grid-cols-4 gap-3 text-sm">
          {/* Các input filter */}
          {[
            [
              "Điểm đánh giá",
              "diem_danh_gia",
              "select",
              ["5", "4", "3", "2", "1"],
            ],
            [
              "Trạng thái",
              "trang_thai",
              "select",
              ["da_duyet", "cho_duyet", "bi_tu_choi"],
            ],
            ["Sản phẩm (ID)", "san_pham_id", "number"],
            ["Người dùng (ID)", "nguoi_dung_id", "number"],
            ["Từ ngày", "tu_ngay", "date"],
            ["Đến ngày", "den_ngay", "date"],
            ["Bình luận", "co_binh_luan", "select", ["co", "khong"]],
          ].map(([label, key, type, options]) => (
            <div key={key}>
              <label className="block text-xs mb-1">{label}</label>

              {type === "select" ? (
                <select
                  value={filters[key]}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, [key]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 cursor-pointer hover:bg-slate-50 transition"
                >
                  <option value="">Tất cả</option>
                  {options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={filters[key]}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, [key]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 hover:bg-slate-50 transition"
                />
              )}
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleResetFilter}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm hover:bg-slate-50 hover:shadow-sm cursor-pointer transition"
          >
            Xoá bộ lọc
          </button>

          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm inline-flex items-center gap-1 hover:bg-emerald-500 hover:shadow-md cursor-pointer transition"
          >
            <Search size={14} /> Áp dụng
          </button>
        </div>
      </form>

      {/* ===== BẢNG ===== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
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
                <td colSpan={8} className="text-center py-6">
                  Đang tải...
                </td>
              </tr>
            )}

            {!isLoading && isError && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-red-500">
                  Lỗi tải dữ liệu
                </td>
              </tr>
            )}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-slate-500">
                  Không có đánh giá nào
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.length > 0 &&
              rows.map((dg) => {
                const productName =
                  dg.san_pham?.ten_san_pham ||
                  dg.ten_san_pham ||
                  `SP #${dg.san_pham_id}`;

                const userName =
                  dg.nguoi_dung?.ten ||
                  dg.nguoi_dung?.ho_ten ||
                  dg.nguoi_dung?.ten_nguoi_dung ||
                  `User #${dg.nguoi_dung_id}`;

                return (
                  <tr
                    key={dg.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="px-3 py-2 font-mono text-xs">#{dg.id}</td>

                    <td className="px-3 py-2">
                      <p className="font-semibold text-slate-900">
                        {productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        ID SP: {dg.san_pham_id} • CTDH:{" "}
                        {dg.chi_tiet_don_hang_id}
                      </p>
                    </td>

                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-900">{userName}</p>
                      <p className="text-xs text-slate-500">
                        ID: {dg.nguoi_dung_id}{" "}
                        {dg.nguoi_dung?.email ? `• ${dg.nguoi_dung.email}` : ""}
                      </p>
                    </td>

                    <td className="px-3 py-2">
                      <span className="font-bold text-amber-500">
                        {dg.diem_danh_gia}
                      </span>{" "}
                      / 5
                      <StarsRow value={dg.diem_danh_gia} />
                    </td>

                    <td className="px-3 py-2 max-w-xs">
                      {dg.binh_luan ? (
                        <p className="text-xs text-slate-800 line-clamp-3">
                          {dg.binh_luan}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-400">
                          (Không có)
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-2 text-xs text-slate-600">
                      <div>Tạo: {formatDate(dg.ngay_tao)}</div>
                      <div>Cập nhật: {formatDate(dg.ngay_cap_nhat)}</div>
                    </td>

                    <td className="px-3 py-2">
                      <StatusBadge value={dg.trang_thai} />
                    </td>

                    <td className="px-3 py-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          disabled={isMutating}
                          onClick={() => moKhoaMut.mutate(dg.id)}
                          className="px-2 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <CheckCircle2 size={14} /> Duyệt
                        </button>

                        <button
                          disabled={isMutating}
                          onClick={() => khoaMut.mutate(dg.id)}
                          className="px-2 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-500 hover:shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <XCircle size={14} /> Khóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50 text-sm text-slate-700">
          <div>
            Tổng: <span className="font-semibold">{pagination.total}</span> đánh
            giá
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Trước
            </button>

            <span>
              Trang <span className="font-semibold">{pagination.page}</span> /{" "}
              {pagination.pages}
            </span>

            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
              className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
