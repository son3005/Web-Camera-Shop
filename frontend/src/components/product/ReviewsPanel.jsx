// src/components/product/ReviewsPanel.jsx
// FULL LIGHT UI – style C (White + Emerald Accents)

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  layDanhGiaSanPham,
  layThongKeDanhGiaSanPham,
} from "../../api/reviewApi";

function StarDisplay({ value = 0, size = 16 }) {
  const arr = [1, 2, 3, 4, 5];
  return (
    <div className="inline-flex items-center gap-0.5">
      {arr.map((i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={i <= value ? "fill-amber-400" : "fill-slate-300"}
        >
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896l-7.335 3.869 1.401-8.168L.132 9.21l8.2-1.192z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPanel({ productId }) {
  const [page, setPage] = useState(1);
  const [starFilter, setStarFilter] = useState(null);

  // ==== THỐNG KÊ ====
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["review-stats", productId],
    queryFn: () => layThongKeDanhGiaSanPham(productId),
    enabled: !!productId,
  });

  // ==== DANH SÁCH ====
  const {
    data: listRes,
    isLoading: loadingList,
    isError,
  } = useQuery({
    queryKey: ["reviews", productId, page, starFilter],
    queryFn: () =>
      layDanhGiaSanPham(productId, {
        page,
        per_page: 10,
        ...(starFilter ? { diem_danh_gia: starFilter } : {}),
        co_binh_luan: true,
      }),
    enabled: !!productId,
    keepPreviousData: true,
  });

  const reviews = listRes?.data || [];
  const pagination = listRes?.pagination || {
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1,
  };

  // ====== Stats ======
  const tong = stats?.tong_danh_gia || 0;
  const trungBinh = stats?.trung_binh || 0;
  const thongKeSao = stats?.thong_ke_theo_sao || {};
  const phanTram = stats?.phan_tram_theo_sao || {};

  const handleChangeStarFilter = (star) => {
    setStarFilter(starFilter === star ? null : star);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* ==== KHỐI THỐNG KÊ ==== */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Khối trung bình */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm min-w-[200px]">
          {loadingStats ? (
            <div className="h-10 w-24 skeleton mb-2" />
          ) : (
            <>
              <div className="text-4xl font-bold text-emerald-600">
                {trungBinh.toFixed ? trungBinh.toFixed(1) : trungBinh}
              </div>
              <StarDisplay value={Math.round(trungBinh)} size={20} />
              <div className="text-xs text-slate-600 mt-1">{tong} đánh giá</div>
            </>
          )}
        </div>

        {/* Phân bố sao */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((sao) => {
            const count = thongKeSao?.[sao] || 0;
            const pct = phanTram?.[sao] || (tong ? (count / tong) * 100 : 0);

            return (
              <div key={sao} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleChangeStarFilter(sao)}
                  className={`
                    flex items-center gap-1 text-xs px-3 py-1 rounded-lg border transition
                    ${
                      starFilter === sao
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50"
                    }
                  `}
                >
                  {sao} ★
                </button>

                <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="w-[70px] text-right text-xs text-slate-600">
                  {count} ({pct.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER NHANH */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => handleChangeStarFilter(null)}
          className={`px-4 py-1 rounded-full border ${
            starFilter == null
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50"
          }`}
        >
          Tất cả
        </button>

        {[5, 4, 3, 2, 1].map((sao) => (
          <button
            key={sao}
            type="button"
            onClick={() => handleChangeStarFilter(sao)}
            className={`px-4 py-1 rounded-full border ${
              starFilter === sao
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50"
            }`}
          >
            {sao} sao
          </button>
        ))}
      </div>

      {/* DANH SÁCH ĐÁNH GIÁ */}
      <div className="space-y-4">
        {isError && (
          <div className="text-sm text-red-500">
            Không tải được danh sách đánh giá.
          </div>
        )}

        {loadingList ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-slate-600">
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
        ) : (
          <>
            {reviews.map((rv) => (
              <div
                key={rv.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {rv.nguoi_dung?.ten ||
                        rv.nguoi_dung?.ho_ten ||
                        "Khách hàng"}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <StarDisplay value={rv.diem_danh_gia} size={16} />
                      <span className="text-xs text-slate-500">
                        {rv.diem_danh_gia} / 5
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    {rv.ngay_tao &&
                      new Date(rv.ngay_tao).toLocaleString("vi-VN")}
                  </div>
                </div>

                {rv.binh_luan && (
                  <p className="mt-3 text-sm text-slate-800">{rv.binh_luan}</p>
                )}
              </div>
            ))}

            {/* PHÂN TRANG */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {Array.from({ length: pagination.pages }).map((_, i) => {
                  const current = i + 1;
                  const active = current === page;
                  return (
                    <button
                      key={current}
                      onClick={() => setPage(current)}
                      className={`
                        px-3 py-1 rounded-lg text-xs
                        ${
                          active
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }
                      `}
                    >
                      {current}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
