// src/components/review/MyReviewsSection.jsx
// =======================================================
// Tab "Đánh giá của tôi" trong trang Tài khoản
// - Hiển thị các đánh giá user đã gửi
// - Cho phép lọc theo số sao
// - Cho phép sửa / xóa đánh giá
// =======================================================

import { useState } from "react";
import {
  useMyReviews,
  useUpdateReview,
  useDeleteReview,
} from "../../hooks/useReviews";
import ReviewForm from "./ReviewForm";
import StarRating from "./StarRating";

function formatDate(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN");
}

export default function MyReviewsSection() {
  const [page, setPage] = useState(1);
  const [starFilter, setStarFilter] = useState("");
  const [editingId, setEditingId] = useState(null);

  const {
    data: listRes,
    isLoading,
    isError,
    refetch,
  } = useMyReviews({
    page,
    per_page: 5,
    diem_danh_gia: starFilter || undefined,
  });

  const updateMut = useUpdateReview();
  const deleteMut = useDeleteReview();

  const reviews = listRes?.data || [];
  const pagination = listRes?.pagination || {
    page: 1,
    per_page: 5,
    total: 0,
    pages: 1,
  };

  const handleEditSubmit = async (payload) => {
    if (!editingId) return;
    try {
      await updateMut.mutateAsync({ id: editingId, payload });
      alert("Cập nhật đánh giá thành công!");
      setEditingId(null);
      refetch();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Không thể cập nhật đánh giá. Vui lòng thử lại.";
      alert(msg);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa đánh giá này? Hành động không thể hoàn tác.")) {
      return;
    }
    try {
      await deleteMut.mutateAsync(id);
      alert("Đã xóa đánh giá.");
      refetch();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Không thể xóa đánh giá. Vui lòng thử lại.";
      alert(msg);
      console.error(err);
    }
  };

  const isBusy = updateMut.isLoading || deleteMut.isLoading;

  return (
    <div className="space-y-4">
      {/* Thanh filter sao */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-sm text-slate-600">Lọc theo số sao:</span>
        <button
          type="button"
          onClick={() => {
            setStarFilter("");
            setPage(1);
          }}
          className={`px-3 py-1 rounded-full text-xs border cursor-pointer transition ${
            !starFilter
              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm hover:bg-emerald-600"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Tất cả
        </button>
        {[5, 4, 3, 2, 1].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStarFilter(String(s));
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 cursor-pointer transition ${
              starFilter === String(s)
                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm hover:bg-emerald-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {s}
            <span className="text-amber-400">★</span>
          </button>
        ))}
      </div>

      {/* Danh sách */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-red-500">
          Không thể tải danh sách đánh giá. Vui lòng thử lại.
        </p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-slate-500">
          Bạn chưa có đánh giá nào. Hãy vào tab Lịch sử đơn hàng để đánh giá
          những sản phẩm đã mua.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const productName =
              r.san_pham?.ten_san_pham ||
              r.san_pham?.name ||
              `Sản phẩm #${r.san_pham_id}`;
            const userRating = r.diem_danh_gia;
            const orderCode =
              r.chi_tiet_don_hang?.don_hang?.ma_don_hang ||
              r.chi_tiet_don_hang?.ma_don_hang ||
              null;

            const isEditing = editingId === r.id;

            return (
              <div
                key={r.id}
                className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-white/90 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {productName}
                    </p>
                    {orderCode && (
                      <p className="text-xs text-slate-500">
                        Mã đơn: {orderCode}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      Đánh giá lúc: {formatDate(r.ngay_tao)}
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1">
                    <div className="flex items-center gap-2">
                      <StarRating value={userRating} readOnly />
                      <span className="text-xs text-slate-600">
                        {userRating} / 5
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          setEditingId((prev) => (prev === r.id ? null : r.id))
                        }
                        className="px-2 py-1 rounded-lg border border-emerald-500 text-emerald-600 bg-white cursor-pointer hover:bg-emerald-50 hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEditing ? "Đóng" : "Sửa đánh giá"}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDelete(r.id)}
                        className="px-2 py-1 rounded-lg border border-red-500 text-red-600 bg-white cursor-pointer hover:bg-red-50 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>

                {!isEditing && r.binh_luan && (
                  <p className="text-sm text-slate-800 whitespace-pre-line">
                    {r.binh_luan}
                  </p>
                )}

                {isEditing && (
                  <ReviewForm
                    initialValue={{
                      diem_danh_gia: r.diem_danh_gia,
                      binh_luan: r.binh_luan || "",
                    }}
                    onSubmit={handleEditSubmit}
                    submitting={updateMut.isLoading}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-3 text-sm">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-lg border border-slate-300 bg-white cursor-pointer hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <span>
            Trang{" "}
            <span className="font-semibold">{pagination.page || page}</span> /{" "}
            {pagination.pages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.pages}
            onClick={() =>
              setPage((p) =>
                Math.min(p + 1, pagination.pages || Number.MAX_SAFE_INTEGER)
              )
            }
            className="px-3 py-1 rounded-lg border border-slate-300 bg-white cursor-pointer hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
