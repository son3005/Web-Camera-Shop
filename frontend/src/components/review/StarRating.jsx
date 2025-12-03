// src/components/review/StarRating.jsx
import { Star } from "lucide-react";

export default function StarRating({
  value = 0,
  onChange,
  size = 16,
  readOnly = false,
}) {
  const stars = [1, 2, 3, 4, 5];
  const isInteractive = !!onChange && !readOnly;

  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!isInteractive}
          onClick={isInteractive ? () => onChange(s) : undefined}
          className={
            isInteractive
              ? "cursor-pointer hover:scale-110 transition-transform disabled:cursor-default"
              : "cursor-default"
          }
        >
          <Star
            size={size}
            className={
              s <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"
            }
          />
        </button>
      ))}
    </div>
  );
}
