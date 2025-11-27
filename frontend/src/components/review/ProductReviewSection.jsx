// src/components/review/ProductReviewSection.jsx
import { useState } from "react";
import {
  useProductReviews,
  useProductReviewStats,
} from "../../hooks/useReviews";
import ReviewSummary from "./ReviewSummary";
import ReviewList from "./ReviewList";

export default function ProductReviewSection({ sanPhamId }) {
  const [page, setPage] = useState(1);
  const [starFilter, setStarFilter] = useState(null); // 1–5 hoặc null

  const { data: listRes, isLoading } = useProductReviews(sanPhamId, {
    page,
    per_page: 5,
    diem_danh_gia: starFilter || undefined,
  });

  const { data: stats } = useProductReviewStats(sanPhamId);

  const reviews = listRes?.data || [];
  const pagination = listRes?.pagination || {
    page: 1,
    per_page: 5,
    total: 0,
    pages: 1,
  };

  return (
    <div className="space-y-4">
      <ReviewSummary stats={stats} />

      {/* Filter theo số sao */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          Lọc theo số sao:
        </span>
        <button
          onClick={() => {
            setStarFilter(null);
            setPage(1);
          }}
          className={`px-3 py-1 rounded-full text-xs border ${
            starFilter == null
              ? "bg-emerald-500 text-white border-emerald-500"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
          }`}
        >
          Tất cả
        </button>
        {[5, 4, 3, 2, 1].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStarFilter(s);
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${
              starFilter === s
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            }`}
          >
            {s} <span className="text-amber-400">★</span>
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <ReviewList reviews={reviews} />
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: pagination.pages }).map((_, i) => {
            const current = i + 1;
            const active = current === pagination.page;
            return (
              <button
                key={current}
                onClick={() => setPage(current)}
                className={`px-3 py-1 rounded-lg text-sm border ${
                  active
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                }`}
              >
                {current}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
