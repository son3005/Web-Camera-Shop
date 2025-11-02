// frontend/src/components/product/ReviewsPanel.jsx
// Sao + nội dung; lưu theo productId; hỗ trợ dark/light

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getReviews, addReview } from "../../api/reviewsApi";

function Stars({ value = 0, onChange, size = 22 }) {
  const arr = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {arr.map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          aria-label={`${i} sao`}
          className="focus:outline-none"
          title={`${i} sao`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={
              i <= value
                ? "fill-amber-400"
                : "fill-gray-300 dark:fill-slate-600"
            }
          >
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896l-7.335 3.869 1.401-8.168L.132 9.21l8.2-1.192z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPanel({ productId }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => getReviews(String(productId)),
    enabled: !!productId,
  });

  const mutation = useMutation({
    mutationFn: (payload) => addReview(String(productId), payload),
    onSuccess: () => {
      setContent("");
      setRating(5);
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!rating || rating < 1 || rating > 5) return alert("Chọn số sao (1–5).");
    if (text.length < 5) return alert("Nội dung tối thiểu 5 ký tự.");
    mutation.mutate({ name, rating, content: text });
  };

  const items = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-slate-800/60"
      >
        <h3 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Viết đánh giá của bạn
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Tên hiển thị (tuỳ chọn)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ui-input dark:bg-slate-800 dark:border-slate-600"
          />
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Đánh giá:
            </span>
            <Stars value={rating} onChange={setRating} />
          </div>
        </div>
        <textarea
          rows={3}
          placeholder="Chia sẻ cảm nhận về sản phẩm…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="ui-input dark:bg-slate-800 dark:border-slate-600 min-h-[96px]"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="btn-emerald rounded-xl disabled:opacity-60"
          >
            {mutation.isLoading ? "Đang gửi…" : "Gửi đánh giá"}
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            * Không cần ảnh, chỉ sao + nội dung.
          </span>
        </div>
      </form>

      {/* Danh sách */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Đánh giá ({data?.total || 0})
        </h3>

        {isLoading ? (
          <div className="skeleton h-20" />
        ) : items.length === 0 ? (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Chưa có đánh giá nào. Hãy là người đầu tiên!
          </div>
        ) : (
          items.map((rv) => (
            <div
              key={rv.id}
              className="rounded-xl border border-black/10 dark:border-white/10 p-3 bg-white/60 dark:bg-slate-800/60"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {rv.name || "Ẩn danh"}
                </div>
                <Stars value={rv.rating} size={18} />
              </div>
              <p className="mt-1 text-slate-800 dark:text-slate-200">
                {rv.content}
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {new Date(rv.createdAt).toLocaleString("vi-VN")}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
