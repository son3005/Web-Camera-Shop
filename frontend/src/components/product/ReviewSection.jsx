// frontend/src/components/product/ReviewSection.jsx
// Hiển thị danh sách đánh giá và form nhập đánh giá (giả lập client-side)

import { useState } from "react";
import { FaStar } from "react-icons/fa";

export default function ReviewSection({ reviews = [] }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState("");
  const [localReviews, setLocalReviews] = useState(reviews);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return alert("Vui lòng nhập nhận xét!");
    const newReview = {
      id: Date.now(),
      name: "Khách hàng ẩn danh",
      rating,
      comment,
      date: new Date().toLocaleDateString("vi-VN"),
    };
    setLocalReviews([newReview, ...localReviews]);
    setComment("");
    setRating(0);
  };

  return (
    <div className="space-y-8">
      {/* --- Form đánh giá --- */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Viết đánh giá của bạn
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                size={28}
                className={`cursor-pointer transition-transform ${
                  (hover || rating) >= star
                    ? "text-yellow-400 scale-110"
                    : "text-gray-400 dark:text-slate-500"
                }`}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            className="w-full mt-3 p-3 rounded-lg border dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 resize-none min-h-[100px]"
          />

          <button
            type="submit"
            className="btn-emerald mt-2 px-6 py-2 rounded-lg font-semibold"
          >
            Gửi đánh giá
          </button>
        </form>
      </div>

      {/* --- Danh sách đánh giá --- */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Nhận xét của khách hàng
        </h3>
        {localReviews.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 italic">
            Chưa có đánh giá nào cho sản phẩm này.
          </p>
        ) : (
          <ul className="space-y-4">
            {localReviews.map((r) => (
              <li
                key={r.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 shadow-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {r.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    {r.date}
                  </span>
                </div>
                <div className="flex mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={18}
                      className={`${
                        r.rating >= star
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-800 dark:text-slate-200">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
