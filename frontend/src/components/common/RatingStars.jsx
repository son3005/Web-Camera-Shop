// src/components/common/RatingStars.jsx
// Hiển thị rating 0..5 (full, half, empty) + số lượt đánh giá

export default function RatingStars({ value = 0, count = 0, className = "" }) {
  const numericValue = Number(value) || 0; // rating trung bình (float)
  const numericCount = Number(count) || 0; // số lượt đánh giá

  const full = Math.floor(numericValue);
  const half = numericValue - full >= 0.5;
  const total = 5;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: total }).map((_, i) => {
        let type = "empty";

        if (i < full) type = "full";
        else if (i === full && half) type = "half";

        return <StarIcon key={i} type={type} />;
      })}

      {/* Chỉ hiển thị (x) nếu có đánh giá */}
      {numericCount > 0 && (
        <span className="text-xs text-slate-500 ml-1">({numericCount})</span>
      )}
    </div>
  );
}

/* ===========================
   SVG ICON: full | half | empty 
=========================== */
function StarIcon({ type }) {
  const base = "w-4 h-4";

  // ⭐ Full Star
  if (type === "full")
    return (
      <svg
        className={`${base} text-amber-500`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L1.05 9.394c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69l1.287-3.967z" />
      </svg>
    );

  // ⭐ Half Star
  if (type === "half")
    return (
      <svg
        className={`${base} text-amber-500`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <defs>
          <linearGradient id="halfStarGradient">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          fill="url(#halfStarGradient)"
          stroke="currentColor"
          strokeWidth="1"
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L1.05 9.394c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69l1.287-3.967z"
        />
      </svg>
    );

  // ☆ Empty Star
  return (
    <svg
      className={`${base} text-slate-300`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L1.05 9.394c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69l1.287-3.967z" />
    </svg>
  );
}
