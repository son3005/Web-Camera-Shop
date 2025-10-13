// frontend/src/components/common/RatingStars.jsx
// Hiển thị sao 0..5 + tổng đánh giá (count)
export default function RatingStars({ value = 0, count = 0, className = "" }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const total = 5;

  return (
    <div
      className={`flex items-center gap-1 text-amber-500 text-sm ${className}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const on = i < full || (i === full && half);
        return <span key={i}>{on ? "★" : "☆"}</span>;
      })}
      <span className="text-xs text-gray-500 dark:text-slate-400">
        ({count})
      </span>
    </div>
  );
}
