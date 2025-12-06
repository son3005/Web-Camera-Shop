// src/components/review/ReviewForm.jsx
import { useState } from "react";
import StarRating from "./StarRating";

export default function ReviewForm({
  initialValue,
  onSubmit,
  submitting = false,
  disabled = false,
}) {
  const [rating, setRating] = useState(initialValue?.diem_danh_gia || 5);
  const [comment, setComment] = useState(initialValue?.binh_luan || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return alert("Vui lòng chọn số sao (1–5).");
    if (comment.length > 2000)
      return alert("Bình luận không được vượt quá 2000 ký tự.");

    onSubmit({
      diem_danh_gia: rating,
      binh_luan: comment.trim() || null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/95 border border-slate-200 rounded-2xl p-4 space-y-3 mt-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-800">
          Đánh giá của bạn:
        </span>
        <StarRating
          value={rating}
          onChange={setRating}
          readOnly={disabled || submitting}
          size={20}
        />
        <span className="text-xs text-slate-500">{rating} / 5</span>
      </div>

      <div>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting || disabled}
          className="ui-input w-full resize-y"
          placeholder="Chia sẻ trải nghiệm của bạn (tùy chọn)..."
        />
        <p className="text-xs text-slate-400 mt-1 text-right">
          {comment.length}/2000
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || disabled}
          className="btn-emerald cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </div>

      <p className="text-[11px] text-slate-400">
        * Bạn chỉ có thể đánh giá các sản phẩm đã mua và đã được giao. Nếu chưa
        thấy đơn hàng, hãy kiểm tra trang Đơn hàng của bạn.
      </p>
    </form>
  );
}
