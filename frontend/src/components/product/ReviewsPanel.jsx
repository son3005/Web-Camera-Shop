// src/components/product/ReviewsPanel.jsx
// Panel đánh giá: đọc API public /danh-gia/san-pham, /thong-ke

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
          className={
            i <= value ? "fill-amber-400" : "fill-gray-300 dark:fill-slate-600"
          }
        >
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896l-7.335 3.869 1.401-8.168L.132 9.21l8.2-1.192z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPanel({ productId }) {
  const [page, setPage] = useState(1);
  const [starFilter, setStarFilter] = useState(null); // null = tất cả

  // ==== THỐNG KÊ ====
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["review-stats", productId],
    queryFn: () => layThongKeDanhGiaSanPham(productId),
    enabled: !!productId,
  });

  // ==== DANH SÁCH ĐÁNH GIÁ ====
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

  const tong = stats?.tong_danh_gia || 0;
  const trungBinh = stats?.trung_binh || 0;
  const thongKeSao = stats?.thong_ke_theo_sao || {};
  const phanTram = stats?.phan_tram_theo_sao || {};

  const handleChangeStarFilter = (star) => {
    setStarFilter(star);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* ==== KHỐI THỐNG KÊ ==== */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Trung bình & tổng */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 min-w-[180px]">
          {loadingStats ? (
            <div className="h-10 w-24 skeleton mb-2" />
          ) : (
            <>
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-300">
                {trungBinh.toFixed ? trungBinh.toFixed(1) : trungBinh}
              </div>
              <StarDisplay value={Math.round(trungBinh)} size={18} />
              <div className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                {tong} đánh giá
              </div>
            </>
          )}
        </div>

        {/* Phân bố theo sao */}
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((sao) => {
            const count = thongKeSao?.[sao] || 0;
            const pct = phanTram?.[sao] || (tong ? (count / tong) * 100 : 0);
            return (
              <div key={sao} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleChangeStarFilter(starFilter === sao ? null : sao)
                  }
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border
                    ${
                      starFilter === sao
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                    }`}
                >
                  <span>{sao}</span>
                  <span>★</span>
                </button>

                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${pct || 0}%` }}
                  />
                </div>
                <div className="w-[70px] text-right text-xs text-slate-500 dark:text-slate-300">
                  {count} ({pct ? pct.toFixed(1) : "0"}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==== FILTER NHANH ==== */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => handleChangeStarFilter(null)}
          className={`px-3 py-1 rounded-full border ${
            starFilter == null
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
          }`}
        >
          Tất cả
        </button>
        {[5, 4, 3, 2, 1].map((sao) => (
          <button
            key={sao}
            type="button"
            onClick={() =>
              handleChangeStarFilter(starFilter === sao ? null : sao)
            }
            className={`px-3 py-1 rounded-full border ${
              starFilter === sao
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            }`}
          >
            {sao} sao
          </button>
        ))}
      </div>

      {/* ==== DANH SÁCH ==== */}
      <div className="space-y-3">
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
          <div className="text-sm text-slate-500">
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
        ) : (
          <>
            {reviews.map((rv) => (
              <div
                key={rv.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white/70 dark:bg-slate-900/60"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {rv.nguoi_dung?.ten || "Khách hàng"}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StarDisplay value={rv.diem_danh_gia} size={14} />
                      <span className="text-xs text-slate-500">
                        {rv.diem_danh_gia} / 5
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 text-right">
                    {rv.ngay_tao &&
                      new Date(rv.ngay_tao).toLocaleString("vi-VN")}
                  </div>
                </div>

                {rv.binh_luan && (
                  <p className="mt-2 text-sm text-slate-800 dark:text-slate-100">
                    {rv.binh_luan}
                  </p>
                )}
              </div>
            ))}

            {/* Phân trang */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-2">
                {Array.from({ length: pagination.pages }).map((_, i) => {
                  const current = i + 1;
                  const active = current === page;
                  return (
                    <button
                      key={current}
                      onClick={() => setPage(current)}
                      className={`px-3 py-1 rounded-lg text-xs ${
                        active
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                      }`}
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

      {/* Gợi ý cách đánh giá */}
      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        Để đánh giá sản phẩm, bạn cần mua hàng và đơn ở trạng thái{" "}
        <b>Đã giao</b>. Sau đó vào trang <b>Tài khoản &gt; Lịch sử đơn hàng</b>{" "}
        để gửi đánh giá.
      </div>
    </div>
  );
}
