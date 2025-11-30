// src/components/review/ReviewList.jsx
import { useSelector } from "react-redux";
import StarRating from "./StarRating";

export default function ReviewList({ reviews = [] }) {
  const authUser = useSelector((state) => state.auth.user);

  if (reviews.length === 0) {
    return (
      <div className="surface-panel p-4 text-sm text-slate-500 dark:text-slate-300">
        Chưa có đánh giá nào cho sản phẩm này.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => {
        // Tên lấy từ API
        const rawName =
          r.nguoi_dung?.ho_ten ||
          r.nguoi_dung?.ten ||
          r.nguoi_dung?.ten_nguoi_dung ||
          r.ten_nguoi_dung ||
          null;

        let userName = rawName || "Người dùng ẩn danh";

        // 🔁 Nếu là chính user đang đăng nhập thì override theo profile hiện tại
        if (authUser && r.nguoi_dung_id && authUser.id === r.nguoi_dung_id) {
          userName =
            authUser.ho_ten ||
            authUser.ten_nguoi_dung ||
            authUser.email ||
            userName;
        }

        return (
          <div
            key={r.id}
            className="surface-panel p-4 flex flex-col gap-2 text-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{userName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {r.ngay_tao
                    ? new Date(r.ngay_tao).toLocaleString("vi-VN")
                    : ""}
                </p>
              </div>
              <StarRating value={r.diem_danh_gia} readOnly />
            </div>

            {r.binh_luan && (
              <p className="text-slate-700 dark:text-slate-200 whitespace-pre-line">
                {r.binh_luan}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
