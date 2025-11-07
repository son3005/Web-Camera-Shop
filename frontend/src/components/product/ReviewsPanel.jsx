// src/components/product/ReviewsPanel.jsx
// Panel đánh giá. Ở đây mình giữ nguyên giao diện,
// bạn có thể nối lại với API review thật sau.

import { useState } from "react";

function Stars({ value = 0, onChange, size = 22 }) {
  const arr = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {arr.map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
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
  // fake state local, bạn thay bằng react-query gọi backend review sau
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  const submit = (e) => {
    e.preventDefault();
    alert("Demo gửi review. Gắn API thật của bạn vào đây.");
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
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
          <button type="submit" className="btn-emerald rounded-xl">
            Gửi đánh giá
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            * Demo thôi, gắn API thật sau.
          </span>
        </div>
      </form>

      <div className="text-sm text-slate-500 dark:text-slate-400">
        Chưa có đánh giá nào.
      </div>
    </div>
  );
}
