// src/components/review/ReviewSummary.jsx
import StarRating from "./StarRating";

export default function ReviewSummary({ stats }) {
  if (!stats) return null;

  const {
    thong_ke_theo_sao = {},
    tong_danh_gia = 0,
    trung_binh = 0,
    phan_tram_theo_sao = {},
  } = stats;

  const rows = [5, 4, 3, 2, 1];

  return (
    <div className="surface-panel p-4 flex flex-col md:flex-row gap-4">
      {/* trung bình */}
      <div className="flex-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-slate-700/60 pb-4 md:pb-0 md:pr-4">
        <div className="text-4xl font-bold text-amber-400">
          {trung_binh?.toFixed ? trung_binh.toFixed(1) : trung_binh}
        </div>
        <StarRating value={Math.round(trung_binh)} readOnly size={22} />
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {tong_danh_gia} đánh giá
        </p>
      </div>

      {/* bars */}
      <div className="flex-[2] space-y-2">
        {rows.map((star) => {
          const count = thong_ke_theo_sao?.[star] ?? 0;
          const percent = phan_tram_theo_sao?.[star] ?? 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-10 flex items-center gap-1">
                {star}
                <span className="text-amber-400">★</span>
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-200/70 dark:bg-slate-700">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-12 text-right text-slate-500 dark:text-slate-400">
                {percent.toFixed ? percent.toFixed(0) : percent}%
              </span>
              <span className="w-10 text-right text-slate-500 dark:text-slate-400">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
